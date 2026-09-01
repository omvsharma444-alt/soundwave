import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EVENT_TYPES, formatCurrency, todayISO, type Package } from "@/lib/booking";

export const Route = createFileRoute("/_authenticated/book")({
  validateSearch: (search: Record<string, unknown>): { pkg?: string } =>
    typeof search['pkg'] === "string" ? { pkg: search['pkg'] as string } : {},
  head: () => ({
    meta: [
      { title: "Book a Sound System — SoundWave Events" },
      {
        name: "description",
        content: "Send a booking request for your wedding, party or festival with date, time slot and package.",
      },
      { property: "og:title", content: "Book a Sound System" },
      { property: "og:description", content: "Pick your date, slot and package — we confirm within hours." },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const { pkg } = Route.useSearch();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    contact_number: "",
    email: "",
    event_type: EVENT_TYPES[0] as string,
    event_date: todayISO(),
    start_time: "18:00",
    end_time: "22:00",
    venue: "",
    guests: "100",
    package_id: pkg ?? "",
    requirements: "",
  });

  const { data: packages } = useQuery({
    queryKey: ["packages", "public"],
    queryFn: async (): Promise<Package[]> => {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("is_active", true)
        .order("price");
      if (error) throw error;
      return (data ?? []) as Package[];
    },
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (form.start_time >= form.end_time) {
      toast.error("End time must be after start time.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      customer_name: form.customer_name || profile?.full_name || "Guest",
      contact_number: form.contact_number,
      email: form.email || user.email || null,
      event_type: form.event_type,
      event_date: form.event_date,
      start_time: form.start_time,
      end_time: form.end_time,
      venue: form.venue,
      guests: Number(form.guests) || 1,
      package_id: form.package_id || null,
      requirements: form.requirements || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(
        error.message.toLowerCase().includes("already")
          ? "That slot is already taken. Please pick another time."
          : error.message,
      );
      return;
    }
    toast.success("Booking request submitted!");
    void navigate({ to: "/dashboard" });
  }

  return (
    <PageShell>
      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Booking</p>
        <h1 className="mt-3 font-display text-5xl">Request your slot</h1>
        <p className="mt-3 text-muted-foreground">
          We check the calendar automatically — overlapping slots are rejected instantly.
        </p>

        <Card className="surface-panel mt-10 p-6">
          <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                required
                value={form.customer_name}
                onChange={(e) => set("customer_name", e.target.value)}
                placeholder={profile?.full_name ?? "Full name"}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Contact number</Label>
              <Input
                id="phone"
                required
                value={form.contact_number}
                onChange={(e) => set("contact_number", e.target.value)}
                placeholder="9876543210"
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder={user?.email ?? "you@example.com"}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Event type</Label>
              <select
                id="type"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.event_type}
                onChange={(e) => set("event_type", e.target.value)}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="package">Package</Label>
              <select
                id="package"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.package_id}
                onChange={(e) => set("package_id", e.target.value)}
              >
                <option value="">No preference</option>
                {(packages ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatCurrency(p.price)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Event date</Label>
              <Input
                id="date"
                type="date"
                required
                min={todayISO()}
                value={form.event_date}
                onChange={(e) => set("event_date", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="guests">Expected guests</Label>
              <Input
                id="guests"
                type="number"
                min={1}
                value={form.guests}
                onChange={(e) => set("guests", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="start">Start time</Label>
              <Input
                id="start"
                type="time"
                required
                value={form.start_time}
                onChange={(e) => set("start_time", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end">End time</Label>
              <Input
                id="end"
                type="time"
                required
                value={form.end_time}
                onChange={(e) => set("end_time", e.target.value)}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="venue">Venue / address</Label>
              <Input
                id="venue"
                required
                value={form.venue}
                onChange={(e) => set("venue", e.target.value)}
                placeholder="Hall name, area, city"
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="req">Special requirements</Label>
              <Textarea
                id="req"
                rows={4}
                value={form.requirements}
                onChange={(e) => set("requirements", e.target.value)}
                placeholder="Extra mics, DJ, stage lighting, generator…"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" size="lg" disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                Submit booking request
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </PageShell>
  );
}
