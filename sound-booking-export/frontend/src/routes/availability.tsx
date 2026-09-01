import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { AvailabilityChecker } from "@/components/AvailabilityChecker";

export const Route = createFileRoute("/availability")({
  head: () => ({
    meta: [
      { title: "Check Available Dates & Time Slots — SoundWave Events" },
      {
        name: "description",
        content:
          "See which dates and time slots are open, pending or already booked for sound system hire, then reserve your slot.",
      },
      { property: "og:title", content: "Check Sound System Availability" },
      {
        property: "og:description",
        content: "Live calendar of open, pending and booked slots for every event date.",
      },
    ],
  }),
  component: AvailabilityPage,
});

function AvailabilityPage() {
  return (
    <PageShell>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Availability</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">Available dates & times</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Slots are locked the moment a booking is submitted, so what you see here is real. Pick a
          date to view the day's schedule.
        </p>
        <div className="mt-10">
          <AvailabilityChecker />
        </div>
        <div className="mt-10">
          <Button asChild size="lg" className="bg-stage text-primary-foreground hover:opacity-90">
            <Link to="/book">Book an open slot</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
