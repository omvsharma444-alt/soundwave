export const EVENT_TYPES = [
  "Wedding",
  "Reception",
  "Birthday Party",
  "Engagement",
  "Anniversary",
  "DJ Party",
  "College Event",
  "Corporate Event",
  "Festival",
  "Religious Event",
  "Other",
] as const;

export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled";

/** Default slot grid shown on the availability calendar. */
export const SLOT_GRID = [
  { label: "Morning", start: "10:00", end: "13:00" },
  { label: "Afternoon", start: "14:00", end: "17:00" },
  { label: "Evening", start: "18:00", end: "22:00" },
  { label: "Late Night", start: "22:00", end: "23:59" },
];

export function toMinutes(time: string): number {
  const [h = "0", m = "0"] = time.split(":");
  return Number(h) * 60 + Number(m);
}

export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return toMinutes(aStart) < toMinutes(bEnd) && toMinutes(bStart) < toMinutes(aEnd);
}

export function formatTime(time: string): string {
  const [hRaw = "0", m = "00"] = time.split(":");
  const h = Number(hRaw);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m} ${suffix}`;
}

export function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isoDate(d: Date): string {
  const tzAdjusted = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tzAdjusted.toISOString().slice(0, 10);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function digitsOnly(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export function whatsappLink(phone: string, message: string): string {
  const num = digitsOnly(phone);
  const withCc = num.length === 10 ? `91${num}` : num;
  return `https://wa.me/${withCc}?text=${encodeURIComponent(message)}`;
}

export type Booking = {
  id: string;
  user_id: string;
  customer_name: string;
  contact_number: string;
  email: string | null;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  guests: number;
  package_id: string | null;
  requirements: string | null;
  status: BookingStatus;
  created_at: string;
};

export type Package = {
  id: string;
  name: string;
  description: string;
  price: number;
  equipment: string[];
  is_active: boolean;
};
