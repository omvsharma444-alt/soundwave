# Sound System Booking — Code Export

## backend/
- `database/` — SQL migrations: tables (profiles, user_roles, packages, bookings, notifications),
  RLS policies + grants, double-booking validation trigger, availability RPC functions.
- `supabase-clients/` — database/auth clients (browser, admin/service-role, auth middleware) and generated DB types.
- `server/` — server entry (`server.ts`) and server middleware registration (`start.ts`).
- `config.toml` — backend/auth project config.

## frontend/
- `src/routes/` — pages: landing, packages, availability, auth, reset-password, and protected
  `_authenticated/` pages (book, dashboard, admin).
- `src/components/` — shared UI (header, footer, availability checker, status badge, shadcn `ui/`).
- `src/hooks/`, `src/lib/` — auth hook and booking helpers/utilities.
- `src/styles.css` — design system tokens (dark stage theme).
- `package.json`, `vite.config.ts`, `tsconfig.json` — build config.

Environment variables required (not included): the backend URL, publishable key and service-role key.
