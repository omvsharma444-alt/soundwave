import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/booking";

const styles: Record<BookingStatus | "available", string> = {
  pending: "bg-warning/15 text-warning border-warning/40",
  confirmed: "bg-success/15 text-success border-success/40",
  rejected: "bg-destructive/15 text-destructive border-destructive/40",
  cancelled: "bg-muted text-muted-foreground border-border",
  available: "bg-success/10 text-success border-success/30",
};

export function StatusBadge({
  status,
  className,
}: {
  status: BookingStatus | "available";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider",
        styles[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
