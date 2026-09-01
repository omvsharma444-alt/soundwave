import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { SLOT_GRID, formatDate, formatTime, isoDate, overlaps } from "@/lib/booking";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Busy = { start_time: string; end_time: string; status: string };

export function useDayAvailability(date: string | null) {
  return useQuery({
    queryKey: ["day-availability", date],
    enabled: Boolean(date),
    queryFn: async (): Promise<Busy[]> => {
      const { data, error } = await supabase.rpc("day_availability", { d: date as string });
      if (error) throw error;
      return (data ?? []) as Busy[];
    },
  });
}

export function AvailabilityChecker({ className }: { className?: string }) {
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const dateStr = selected ? isoDate(selected) : null;
  const { data: busy, isLoading } = useDayAvailability(dateStr);

  return (
    <div className={cn("grid gap-6 lg:grid-cols-[auto_1fr]", className)}>
      <Card className="surface-panel w-fit p-3">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          disabled={{ before: new Date() }}
          className="pointer-events-auto p-1"
        />
      </Card>

      <Card className="surface-panel p-5">
        <h3 className="font-display text-2xl">
          {dateStr ? formatDate(dateStr) : "Pick a date"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Green slots are open. Yellow slots are awaiting admin confirmation. Red slots are locked.
        </p>

        {isLoading ? (
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Checking the calendar…
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {SLOT_GRID.map((slot) => {
              const clash = (busy ?? []).find((b) =>
                overlaps(slot.start, slot.end, b.start_time.slice(0, 5), b.end_time.slice(0, 5)),
              );
              const status =
                clash?.status === "confirmed"
                  ? "confirmed"
                  : clash?.status === "pending"
                    ? "pending"
                    : "available";
              return (
                <div
                  key={slot.label}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 transition-colors",
                    status === "available"
                      ? "border-success/30 bg-success/5"
                      : status === "pending"
                        ? "border-warning/30 bg-warning/5"
                        : "border-destructive/30 bg-destructive/5",
                  )}
                >
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      {slot.label}
                    </p>
                    <p className="font-semibold">
                      {formatTime(slot.start)} – {formatTime(slot.end)}
                    </p>
                  </div>
                  <StatusBadge status={status === "confirmed" ? "confirmed" : status} />
                </div>
              );
            })}

            {(busy ?? []).length > 0 && (
              <div className="rounded-xl border border-border bg-secondary/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Exact booked ranges
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {busy!.map((b, i) => (
                    <li key={i} className="flex items-center justify-between gap-3">
                      <span>
                        {formatTime(b.start_time.slice(0, 5))} – {formatTime(b.end_time.slice(0, 5))}
                      </span>
                      <span className="uppercase text-muted-foreground">{b.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
