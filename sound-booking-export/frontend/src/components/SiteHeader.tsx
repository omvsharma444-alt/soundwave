import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Speaker, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/packages", label: "Packages" },
  { to: "/availability", label: "Availability" },
];

export function SiteHeader() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 glass-panel border-x-0 border-t-0">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-stage text-primary-foreground">
            <Speaker className="size-5" />
          </span>
          <span className="font-display text-2xl leading-none">
            Sound<span className="text-gradient">Wave</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {publicLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-foreground bg-secondary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-secondary"
                >
                  Admin
                </Link>
              )}
            </>
          ) : null}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Logout
              </Button>
              <Button asChild size="sm" className="bg-stage text-primary-foreground hover:opacity-90">
                <Link to="/book">Book Now</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Login</Link>
              </Button>
              <Button asChild size="sm" className="bg-stage text-primary-foreground hover:opacity-90">
                <Link to="/auth" search={{ mode: "register" }}>
                  Get Started
                </Link>
              </Button>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {open && (
        <div className="animate-rise border-t border-border px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {publicLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  Dashboard
                </Link>
                <Link
                  to="/book"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  New Booking
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-accent hover:bg-secondary"
                  >
                    Admin Panel
                  </Link>
                )}
                <Button variant="secondary" className="mt-2" onClick={signOut}>
                  Logout
                </Button>
              </>
            ) : (
              <Button asChild className="mt-2 bg-stage text-primary-foreground">
                <Link to="/auth" onClick={() => setOpen(false)}>
                  Login / Register
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
