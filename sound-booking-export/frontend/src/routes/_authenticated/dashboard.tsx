import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Copy, Loader2, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/PageShell";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  formatDate,
  formatTime,
  todayISO,
  whatsappLink,
  type Booking,
  type BookingStatus,
} from "@/lib/booking";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Bookings — SoundWave Events" },
      {
        name: "description",
        content: "Track your sound system bookings, statuses and notifications in one dashboard.",
      },
      { property: "og:title", content: "My Bookings Dashboard" },
      { property: "og:description", content: "Upcoming events, booking history and status updates." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();

  const bookings = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<Booking[]> => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("event_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Booking[];
    },
  });

  const notifications = useQuery({
    queryKey: ["my-notifications", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

  async function cancel(id: string) {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" satisfies BookingStatus })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Booking cancelled");
    void qc.invalidateQueries({ queryKey: ["my-bookings"] });
    void qc.invalidateQueries({ queryKey: ["my-notifications"] });
  }

  const all = bookings.data ?? [];
  const upcoming = all.filter((b) => b.event_date >= todayISO());
  const past = all.filter((b) => b.event_date < todayISO());

  return (
    <PageShell>
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Dashboard</p>
            <h1 className="mt-3 font-display text-5xl">
              Hi, {profile?.full_name ?? user?.email ?? "there"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {profile?.phone ? `${profile.phone} · ` : ""}
              {profile?.email ?? user?.email}
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/book">New booking</Link>
          </Button>
        </div>

        {bookings.isLoading ? (
          <div className="mt-14 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" /> Loading your bookings…
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-8">
              <BookingList
                title="Upcoming events"
                bookings={upcoming}
                onCancel={cancel}
                empty="No upcoming bookings yet."
              />
              <BookingList
                title="History"
                bookings={past}
                onCancel={cancel}
                empty="Nothing in your history yet."
              />
            </div>

            <Card className="surface-panel h-fit p-6">
              <h2 className="flex items-center gap-2 font-semibold">
                <Bell className="size-4 text-primary" /> Notifications
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                {(notifications.data ?? []).length === 0 ? (
                  <li className="text-muted-foreground">No notifications yet.</li>
                ) : (
                  (notifications.data ?? []).map((n) => (
                    <li key={n.id} className="rounded-md border border-border/60 p-3">
                      <p>{n.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </Card>
          </div>
        )}
      </section>
    </PageShell>
  );
}

function BookingList({
  title,
  bookings,
  empty,
  onCancel,
}: {
  title: string;
  bookings: Booking[];
  empty: string;
  onCancel: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl">{title}</h2>
      {bookings.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="mt-4 space-y-4">
          {bookings.map((b) => (
            <Card key={b.id} className="surface-panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {b.event_type} · {formatDate(b.event_date)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatTime(b.start_time)} – {formatTime(b.end_time)} · {b.venue} · {b.guests}{" "}
                    guests
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              {b.requirements ? (
                <p className="mt-3 text-sm text-muted-foreground">{b.requirements}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={`tel:${b.contact_number}`}>
                    <Phone className="size-4" /> Call
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a
                    href={whatsappLink(
                      b.contact_number,
                      `Hi, regarding my ${b.event_type} booking on ${formatDate(b.event_date)}`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="size-4" /> WhatsApp
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(
                      `${b.event_type} · ${formatDate(b.event_date)} · ${formatTime(b.start_time)}-${formatTime(b.end_time)} · ${b.venue}`,
                    );
                    toast.success("Booking details copied");
                  }}
                >
                  <Copy className="size-4" /> Copy
                </Button>
                {b.status === "pending" || b.status === "confirmed" ? (
                  <Button variant="destructive" size="sm" onClick={() => onCancel(b.id)}>
                    Cancel booking
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
