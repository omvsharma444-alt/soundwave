revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.touch_updated_at() from anon, authenticated;
revoke execute on function public.validate_booking() from anon, authenticated;
revoke execute on function public.booking_notify() from anon, authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from anon;