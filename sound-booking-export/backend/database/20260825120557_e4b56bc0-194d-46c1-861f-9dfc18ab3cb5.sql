-- roles
create type public.app_role as enum ('admin','user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid());
create policy "admin profile read" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());
create policy "own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- packages
create table public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10,2) not null default 0,
  equipment text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.packages to anon;
grant select, insert, update, delete on public.packages to authenticated;
grant all on public.packages to service_role;
alter table public.packages enable row level security;
create policy "packages public read" on public.packages for select using (true);
create policy "packages admin write" on public.packages for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.packages (name, description, price, equipment) values
('Basic Package','Perfect for small gatherings and house functions up to 100 guests.',7500,
  array['2 Full-range Speakers','1 Amplifier','1 Wireless Microphone','Basic Cabling & Setup']),
('Standard Package','Great for birthdays, engagements and mid-size receptions up to 350 guests.',18500,
  array['4 Speakers','2 Subwoofers','2 Wireless Microphones','DJ Setup','Basic Party Lights']),
('Premium Package','Full concert-grade rig for weddings and large celebrations up to 1000 guests.',42000,
  array['6+ Line Array Speakers','Multiple Subwoofers','Professional Digital Mixer','4 Wireless Microphones','DJ Console','Stage Lighting','On-site Sound Engineer']),
('DJ Ultimate','High-energy DJ night setup with lighting, haze and live mixing.',65000,
  array['8 Speakers','4 Subwoofers','Pioneer DJ Console','Moving Head Lights','Laser & Haze Machine','LED Wall','2 Sound Engineers']);

-- bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  contact_number text not null,
  email text,
  event_type text not null,
  event_date date not null,
  start_time time not null,
  end_time time not null,
  venue text not null,
  guests integer not null default 50,
  package_id uuid references public.packages(id) on delete set null,
  requirements text,
  status text not null default 'pending' check (status in ('pending','confirmed','rejected','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
create policy "own bookings read" on public.bookings for select to authenticated using (user_id = auth.uid());
create policy "admin bookings read" on public.bookings for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "own bookings insert" on public.bookings for insert to authenticated with check (user_id = auth.uid());
create policy "own bookings update" on public.bookings for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin bookings update" on public.bookings for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin bookings delete" on public.bookings for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create index bookings_date_idx on public.bookings (event_date);

-- notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "own notifications read" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "own notifications update" on public.notifications for update to authenticated using (user_id = auth.uid());
create policy "own notifications delete" on public.notifications for delete to authenticated using (user_id = auth.uid());
create policy "notifications insert" on public.notifications for insert to authenticated
  with check (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- timestamps
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
create trigger bookings_touch before update on public.bookings for each row execute function public.touch_updated_at();

-- validation + double booking prevention
create or replace function public.validate_booking() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.end_time <= new.start_time then
    raise exception 'End time must be after start time';
  end if;
  if new.status in ('pending','confirmed') and exists (
    select 1 from public.bookings b
    where b.event_date = new.event_date
      and b.id <> new.id
      and b.status in ('pending','confirmed')
      and b.start_time < new.end_time
      and new.start_time < b.end_time
  ) then
    raise exception 'Sorry, this date/time is already booked. Please select another available time.';
  end if;
  return new;
end $$;
create trigger bookings_validate before insert or update on public.bookings
for each row execute function public.validate_booking();

-- notifications on submit / status change
create or replace function public.booking_notify() returns trigger
language plpgsql set search_path = public as $$
declare msg text;
begin
  if tg_op = 'INSERT' then
    msg := 'Your booking for ' || new.event_type || ' on ' || to_char(new.event_date,'DD Mon YYYY') || ' was submitted and is PENDING admin confirmation.';
  elsif new.status <> old.status then
    msg := 'Your booking for ' || new.event_type || ' on ' || to_char(new.event_date,'DD Mon YYYY') || ' is now ' || upper(new.status) || '.';
  else
    return new;
  end if;
  insert into public.notifications (user_id, booking_id, message) values (new.user_id, new.id, msg);
  return new;
end $$;
create trigger bookings_notify after insert or update on public.bookings
for each row execute function public.booking_notify();

-- public availability (no PII)
create or replace function public.day_availability(d date)
returns table (start_time time, end_time time, status text)
language sql stable security definer set search_path = public as $$
  select b.start_time, b.end_time, b.status
  from public.bookings b
  where b.event_date = d and b.status in ('pending','confirmed')
  order by b.start_time
$$;
grant execute on function public.day_availability(date) to anon, authenticated;

create or replace function public.month_availability(from_date date, to_date date)
returns table (event_date date, pending_count bigint, confirmed_count bigint)
language sql stable security definer set search_path = public as $$
  select b.event_date,
         count(*) filter (where b.status = 'pending'),
         count(*) filter (where b.status = 'confirmed')
  from public.bookings b
  where b.event_date between from_date and to_date and b.status in ('pending','confirmed')
  group by b.event_date
$$;
grant execute on function public.month_availability(date,date) to anon, authenticated;

-- profile autocreate
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email, new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();