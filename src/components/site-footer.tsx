import { Link } from "@tanstack/react-router";
import { Instagram, Youtube, Facebook, Music2, MapPin, Mail, Phone, Flame } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/lib/forms.functions";
import { useServerFn } from "@tanstack/react-start";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const subscribe = useServerFn(subscribeNewsletter);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await subscribe({ data: { email } });
      toast.success("You're on the list!", { description: "Watch for updates on camps, events and stories." });
      setEmail("");
    } catch (err) {
      toast.error("Something went wrong", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-sm bg-brand text-brand-foreground">
              <Flame className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="text-display text-xl">MAVUNO<span className="text-brand">.</span>YOUTH</span>
          </Link>
          <p className="mt-4 max-w-md text-sm text-white/70">
            Raising Christ-centered leaders for this generation through discipleship, worship,
            leadership development, community and life-changing camp experiences.
          </p>
          <form onSubmit={onSubmit} className="mt-6 flex max-w-md gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="flex-1 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-brand focus:outline-none"
            />
            <button
              disabled={loading}
              className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:brightness-110 disabled:opacity-50"
            >
              {loading ? "…" : "Subscribe"}
            </button>
          </form>
        </div>
        <div className="lg:col-span-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/60">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li><Link to="/about" className="hover:text-brand">About</Link></li>
            <li><Link to="/ministries/myf" className="hover:text-brand">Young & Fearless</Link></li>
            <li><Link to="/ministries/mya" className="hover:text-brand">Young Adults</Link></li>
            <li><Link to="/ministries/campus" className="hover:text-brand">Campus Trends</Link></li>
            <li><Link to="/camps" className="hover:text-brand">Camps</Link></li>
            <li><Link to="/sermons" className="hover:text-brand">Sermons</Link></li>
            <li><Link to="/stories" className="hover:text-brand">Salvation Stories</Link></li>
          </ul>
        </div>
        <div className="lg:col-span-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/60">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-brand" /> Bellevue Campus, Nairobi, Kenya</li>
            <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 text-brand" /> youth@mavunochurch.org</li>
            <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-brand" /> +254 700 000 000</li>
          </ul>
          <div className="mt-6 flex gap-3">
            {[
              { Icon: Youtube, href: "https://youtube.com", label: "YouTube" },
              { Icon: Instagram, href: "https://instagram.com", label: "Instagram" },
              { Icon: Facebook, href: "https://facebook.com", label: "Facebook" },
              { Icon: Music2, href: "https://tiktok.com", label: "TikTok" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-md border border-white/15 text-white/80 transition hover:border-brand hover:text-brand"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-white/50 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Mavuno Youth Ministries. All rights reserved.</p>
          <p>Built with faith · Fueled by fire · For the next generation.</p>
        </div>
      </div>
    </footer>
  );
}