import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Headphones,
  Lightbulb,
  Music4,
  PartyPopper,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  Truck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { EVENT_TYPES, formatCurrency, type Package } from "@/lib/booking";
import heroImg from "@/assets/hero.jpg";
import djImg from "@/assets/gallery-dj.jpg";
import festivalImg from "@/assets/gallery-festival.jpg";
import partyImg from "@/assets/gallery-party.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SoundWave Events — Professional Sound System Booking" },
      {
        name: "description",
        content:
          "Book concert-grade sound systems, DJ consoles and stage lighting for weddings, receptions, birthdays, festivals and college events. Live availability, instant booking.",
      },
      { property: "og:title", content: "SoundWave Events — Sound System Booking" },
      {
        property: "og:description",
        content:
          "Professional sound system for every celebration. Check live availability and book in minutes.",
      },
    ],
  }),
  component: HomePage,
});

const whyUs = [
  { icon: Headphones, title: "Concert-Grade Audio", text: "Line array speakers and digital mixers tuned per venue." },
  { icon: Timer, title: "On-Time Setup", text: "Crew arrives hours ahead so sound check is never rushed." },
  { icon: ShieldCheck, title: "No Double Booking", text: "Live slot locking means your date is truly yours." },
  { icon: Truck, title: "Delivery Included", text: "Transport, rigging and teardown handled by our team." },
  { icon: Lightbulb, title: "Lighting & Effects", text: "Moving heads, lasers and haze for a real stage feel." },
  { icon: Users, title: "Dedicated Engineer", text: "A sound engineer stays on-site for the whole event." },
];

const steps = [
  { icon: ClipboardList, title: "Create your account", text: "Register with your name, email and mobile number." },
  { icon: CalendarCheck, title: "Pick date & slot", text: "See open, pending and booked time slots instantly." },
  { icon: Music4, title: "Choose a package", text: "Basic, Standard, Premium or a full DJ Ultimate rig." },
  { icon: CheckCircle2, title: "Get confirmed", text: "Our team confirms and calls you on your number." },
];

const reviews = [
  { name: "Rahul Kumar", event: "Wedding, Bangalore", text: "Sound across the lawn was flawless. The team set up 4 hours early and the DJ night was unreal." },
  { name: "Sneha Reddy", event: "College Fest, Mysore", text: "We booked the DJ Ultimate rig. Lights, haze, LED wall — the fest felt like a proper concert." },
  { name: "Imran Shaikh", event: "Reception, Hyderabad", text: "Booking took two minutes and I could see which evening slots were open. Confirmation call came same day." },
];

function HomePage() {
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

  return (
    <PageShell>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Line array speakers and stage lighting at an evening wedding reception"
          width={1920}
          height={1088}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-background/78" />
        <div className="mx-auto w-full max-w-7xl px-4 py-28 sm:px-6 md:py-36">
          <div className="max-w-3xl animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <Sparkles className="size-3.5" /> 1200+ events powered
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[0.95] sm:text-6xl md:text-7xl">
              Professional Sound System for{" "}
              <span className="text-gradient">Every Celebration</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Weddings, receptions, birthdays, DJ nights, festivals and college events. Check live
              availability, lock your time slot, and let our engineers handle the rest.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-stage text-primary-foreground glow-ring hover:opacity-90">
                <Link to="/book">Book Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/packages">View Packages</Link>
              </Button>
            </div>
            <div className="mt-10 flex items-end gap-1.5" aria-hidden>
              {[0.2, 0.5, 0.1, 0.7, 0.35, 0.9, 0.45, 0.65, 0.25].map((d, i) => (
                <span
                  key={i}
                  className="equalizer-bar h-10 w-2 rounded-full bg-stage"
                  style={{ animationDelay: `${d}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section-y mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">About Us</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Sound engineers, not just speaker rental</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              SoundWave Events has powered over 1200 celebrations across South India since 2014. We
              own our inventory — line arrays, subwoofers, digital mixers, wireless mics, DJ consoles
              and intelligent lighting — and every booking ships with a trained engineer who tunes
              the room before your first guest arrives.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { k: "1200+", v: "Events" },
                { k: "10 yrs", v: "Experience" },
                { k: "4.9/5", v: "Rating" },
              ].map((s) => (
                <div key={s.k} className="surface-panel rounded-xl p-4 text-center">
                  <p className="font-display text-3xl text-gradient">{s.k}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src={djImg} alt="DJ mixing at a party" loading="lazy" width={1200} height={900} className="h-56 w-full rounded-2xl object-cover shadow-lg" />
            <img src={partyImg} alt="Wireless microphone at a decorated reception hall" loading="lazy" width={1200} height={900} className="mt-8 h-56 w-full rounded-2xl object-cover shadow-lg" />
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="section-y border-y border-border bg-card/30">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Packages</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Sound System Packages</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {(packages ?? []).map((p, i) => (
              <Card
                key={p.id}
                className={`surface-panel flex flex-col p-6 transition-transform duration-300 hover:-translate-y-1.5 ${
                  i === 2 ? "glow-ring" : ""
                }`}
              >
                <h3 className="font-display text-2xl">{p.name}</h3>
                <p className="mt-2 text-3xl font-bold text-gradient">{formatCurrency(p.price)}</p>
                <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {p.equipment.map((e) => (
                    <li key={e} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-6 bg-stage text-primary-foreground hover:opacity-90">
                  <Link to="/book" search={{ pkg: p.id }}>
                    Book this package
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Event types */}
      <section className="section-y mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Event Types</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">We cover every kind of function</h2>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {EVENT_TYPES.map((t) => (
            <span
              key={t}
              className="glass-panel rounded-full px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary"
            >
              <PartyPopper className="mr-2 inline size-4 text-primary" />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Why choose us */}
      <section className="section-y border-y border-border bg-card/30">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Why Choose Us</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Built for flawless events</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {whyUs.map((w) => (
              <Card key={w.title} className="surface-panel p-6 transition-colors hover:border-primary/40">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary">
                  <w.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{w.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{w.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How booking works */}
      <section className="section-y mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">How It Works</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Booking takes four steps</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-4">
          {steps.map((s, i) => (
            <Card key={s.title} className="surface-panel relative p-6">
              <span className="absolute right-5 top-4 font-display text-5xl text-muted/60">
                {i + 1}
              </span>
              <span className="grid size-11 place-items-center rounded-xl bg-accent/15 text-accent">
                <s.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="section-y border-y border-border bg-card/30">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Gallery</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Recent setups</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { src: heroImg, alt: "Wedding stage with line array speakers", w: 1920, h: 1088 },
              { src: djImg, alt: "DJ console with party lighting", w: 1200, h: 900 },
              { src: festivalImg, alt: "Outdoor festival stage with speaker stacks", w: 1200, h: 900 },
              { src: partyImg, alt: "Reception hall audio setup", w: 1200, h: 900 },
            ].map((g) => (
              <div key={g.alt} className="group overflow-hidden rounded-2xl border border-border">
                <img
                  src={g.src}
                  alt={g.alt}
                  loading="lazy"
                  width={g.w}
                  height={g.h}
                  className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="section-y mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Reviews</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">What customers say</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <Card key={r.name} className="surface-panel p-6">
              <Quote className="size-7 text-primary/60" />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">"{r.text}"</p>
              <div className="mt-5 flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-3 font-semibold">{r.name}</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{r.event}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-y border-t border-border bg-card/30">
        <div className="mx-auto w-full max-w-5xl px-4 text-center sm:px-6">
          <h2 className="font-display text-4xl md:text-5xl">Ready to lock your date?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Check availability for your event date, or talk to our booking desk directly. We answer
            calls between 9 AM and 10 PM, every day.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-stage text-primary-foreground hover:opacity-90">
              <Link to="/availability">Check Availability</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="tel:+919876543210">Call +91 98765 43210</a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a
                href="https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20book%20a%20sound%20system"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp Us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
