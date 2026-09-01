import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/PageShell";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  formatCurrency,
  formatDate,
  formatTime,
  type Booking,
  type BookingStatus,
  type Package,
} from "@/lib/booking";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — SoundWave Events" },
      {
        name: "description",
        content: "Manage bookings, confirm or reject requests, view customers and edit packages.",
      },
      { property: "og:title", content: "Admin Panel" },
      { property: "og:description", content: "Bookings, customers and package management." },
    ],
  }),
  component: AdminPage,
});

const FILTERS: Array<BookingStatus | "all"> = [
  "all",
  "pending",
  "confirmed",
  "rejected",
  "cancelled",
];

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<BookingStatus | "all">("all");

  const bookings = useQuery({
    queryKey: ["admin-bookings"],
    enabled: isAdmin,
    queryFn: async (): Promise<Booking[]> => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("event_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Booking[];
    },
  });

  const packages = useQuery({
    queryKey: ["admin-packages"],
    enabled: isAdmin,
    queryFn: async (): Promise<Package[]> => {
      const { data, error } = await supabase.from("packages").select("*").order("price");
      if (error) throw error;
      return (data ?? []) as Package[];
    },
  });

  async function setStatus(id: string, status: BookingStatus) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Booking ${status}`);
    void qc.invalidateQueries({ queryKey: ["admin-bookings"] });
  }

  async function togglePackage(p: Package) {
    const { error } = await supabase
      .from("packages")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    void qc.invalidateQueries({ queryKey: ["admin-packages"] });
    void qc.invalidateQueries({ queryKey: ["packages", "public"] });
  }

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (bookings.data ?? []).filter((b) => {
      const matchStatus = filter === "all" || b.status === filter;
      const matchTerm =
        !term ||
        [b.customer_name, b.contact_number, b.venue, b.event_type].some((v) =>
          v.toLowerCase().includes(term),
        );
      return matchStatus && matchTerm;
    });
  }, [bookings.data, search, filter]);

  const stats = useMemo(() => {
    const all = bookings.data ?? [];
    return {
      total: all.length,
      pending: all.filter((b) => b.status === "pending").length,
      confirmed: all.filter((b) => b.status === "confirmed").length,
      customers: new Set(all.map((b) => b.user_id)).size,
    };
  }, [bookings.data]);

  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-20 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" /> Loading…
        </div>
      </PageShell>
    );
  }

  if (!isAdmin) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="font-display text-4xl">Admins only</h1>
          <p className="mt-3 text-muted-foreground">
            This area is restricted to SoundWave staff accounts.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Admin</p>
        <h1 className="mt-3 font-display text-5xl">Control room</h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total bookings", value: stats.total },
            { label: "Pending", value: stats.pending },
            { label: "Confirmed", value: stats.confirmed },
            { label: "Customers", value: stats.customers },
          ].map((s) => (
            <Card key={s.label} className="surface-panel p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-display text-4xl">{s.value}</p>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, venue…"
            className="max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {bookings.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" /> Loading bookings…
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings match this view.</p>
          ) : (
            rows.map((b) => (
              <Card key={b.id} className="surface-panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {b.customer_name} · {b.event_type}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(b.event_date)} · {formatTime(b.start_time)} –{" "}
                      {formatTime(b.end_time)} · {b.venue} · {b.guests} guests
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {b.contact_number}
                      {b.email ? ` · ${b.email}` : ""}
                    </p>
                    {b.requirements ? (
                      <p className="mt-2 text-sm text-muted-foreground">{b.requirements}</p>
                    ) : null}
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setStatus(b.id, "confirmed")}>
                    Confirm
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus(b.id, "rejected")}>
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setStatus(b.id, "cancelled")}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        <h2 className="mt-14 font-display text-3xl">Packages</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(packages.data ?? []).map((p) => (
            <Card key={p.id} className="surface-panel p-5">
              <p className="font-semibold">{p.name}</p>
              <p className="mt-1 font-display text-3xl">{formatCurrency(p.price)}</p>
              <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={() => togglePackage(p)}
              >
                {p.is_active ? "Deactivate" : "Activate"}
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
