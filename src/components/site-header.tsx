import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import mavunoLogo from "@/assets/mavuno-logo.svg";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  // { to: "/ministries/myf", label: "MYF" },
  // { to: "/ministries/mya", label: "MYA" },
  // { to: "/ministries/campus", label: "Campus" },
  { to: "/camps", label: "Camps" },
  { to: "/ministries", label: "Ministries" },
  { to: "/sermons", label: "Sermons" },
  { to: "/events", label: "Events" },
  { to: "/visit", label: "Visit" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-ink text-ink-foreground backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="Mavuno Youth home">
          <img src={mavunoLogo} alt="Mavuno Church" className="h-14 w-auto" />
          <span className="hidden h-8 w-px bg-white/25 sm:block" aria-hidden="true" />
          <span className="text-display hidden text-xl tracking-wide text-brand sm:block">YOUTH</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              activeProps={{ className: "bg-white/10 text-white" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:flex">
          <Link
            to="/salvation"
            className="inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:brightness-110"
          >
            I Follow Jesus
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="rounded-md p-2 text-white lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <div className={cn("lg:hidden", open ? "block" : "hidden")}>
        <div className="space-y-1 border-t border-white/10 px-4 pb-4 pt-2">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-white/85 hover:bg-white/10 hover:text-white"
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/salvation"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-md bg-brand px-3 py-2 text-center text-base font-semibold text-brand-foreground"
          >
            I Follow Jesus
          </Link>
        </div>
      </div>
    </header>
  );
}