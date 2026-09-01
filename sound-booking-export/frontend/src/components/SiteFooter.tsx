import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Speaker } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-stage text-primary-foreground">
              <Speaker className="size-5" />
            </span>
            <span className="font-display text-2xl leading-none">
              Sound<span className="text-gradient">Wave</span> Events
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Professional sound, lighting and DJ systems for weddings, receptions, birthdays,
            festivals and college events. Crystal-clear audio, on time, every time.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link to="/packages" className="hover:text-primary">
                Packages
              </Link>
            </li>
            <li>
              <Link to="/availability" className="hover:text-primary">
                Check Availability
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-primary">
                Login / Register
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-primary" />
              <a href="tel:+919876543210" className="hover:text-primary">
                +91 98765 43210
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-primary" />
              <a href="mailto:bookings@soundwave.events" className="hover:text-primary">
                bookings@soundwave.events
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 text-primary" />
              <span>Indiranagar, Bangalore, Karnataka</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SoundWave Events. All rights reserved.
      </div>
    </footer>
  );
}
