import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, type Package } from "@/lib/booking";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "Sound System Packages & Prices — SoundWave Events" },
      {
        name: "description",
        content:
          "Compare Basic, Standard, Premium and DJ Ultimate sound system packages with full equipment lists and transparent pricing.",
      },
      { property: "og:title", content: "Sound System Packages & Prices" },
      {
        property: "og:description",
        content: "Speakers, subwoofers, mixers, DJ consoles and stage lighting — pick the rig that fits your event.",
      },
    ],
  }),
  component: PackagesPage,
});

function PackagesPage() {
  const { data, isLoading } = useQuery({
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
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Packages</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">Pick your rig</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Every package includes delivery, rigging, cabling, teardown and an on-site technician.
          Prices are per event day.
        </p>

        {isLoading ? (
          <div className="mt-16 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" /> Loading packages…
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {(data ?? []).map((p) => (
              <Card key={p.id} className="surface-panel flex flex-col p-6 transition-transform hover:-translate-y-1.5">
                <h2 className="font-display text-2xl">{p.name}</h2>
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
        )}
      </section>
    </PageShell>
  );
}
