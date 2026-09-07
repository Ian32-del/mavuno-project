import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CalendarDays, MapPin, Ticket, Users, Clock, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import bonfire from "@/assets/camp-bonfire.jpeg";
import { submitCampRegistration } from "@/lib/forms.functions";

export const Route = createFileRoute("/camps")({
  head: () => ({
    meta: [
      { title: "Camps — Mavuno Youth" },
      { name: "description", content: "Register for Ignite Camp 2026 and explore past camp highlights, videos and testimonies." },
      { property: "og:title", content: "Ignite Camp 2026 — Mavuno Youth" },
      { property: "og:description", content: "Four days. Thousands of young people. One radical encounter with Jesus." },
      { property: "og:url", content: "/camps" },
      { property: "og:image", content: bonfire },
    ],
    links: [{ rel: "canonical", href: "/camps" }],
  }),
  component: CampsPage,
});

function CampsPage() {
  const register = useServerFn(submitCampRegistration);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await register({
        data: {
          camp_name: "Ignite Camp 2026",
          full_name: String(fd.get("full_name") || ""),
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          age: fd.get("age") ? Number(fd.get("age")) : undefined,
          ministry: String(fd.get("ministry") || ""),
          emergency_contact: String(fd.get("emergency_contact") || ""),
          emergency_phone: String(fd.get("emergency_phone") || ""),
          notes: String(fd.get("notes") || ""),
        },
      });
      setDone(true);
      toast.success("Registration received!", { description: "We'll email your camp pack shortly." });
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err) {
      toast.error("Registration failed", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Camps · Ignite 2026"
        title={<>Four days that <span className="text-brand">rewrite</span> your year.</>}
        subtitle="Ignite Camp is Mavuno Youth's flagship gathering — worship, teaching, community and encounters with God that mark you for life."
      />

      <section className="relative bg-background py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="overflow-hidden rounded-2xl">
            <img src={bonfire} alt="Camp bonfire" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </div>
          <div>
            <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand">Upcoming</span>
            <h2 className="text-display mt-4 text-5xl sm:text-6xl">Ignite <span className="text-brand">2026</span></h2>
            <p className="mt-3 text-lg text-muted-foreground">Theme: <span className="font-semibold text-foreground">Unshakable — Rooted in Christ, ready for anything.</span></p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-brand" /> 10 – 13 April 2026</li>
              <li className="flex items-center gap-3"><MapPin className="h-5 w-5 text-brand" /> Lake Naivasha Resort, Nakuru</li>
              <li className="flex items-center gap-3"><Users className="h-5 w-5 text-brand" /> Open to all youth 13+</li>
              <li className="flex items-center gap-3"><Ticket className="h-5 w-5 text-brand" /> KES 6,500 · Early bird until 15 Feb: KES 5,500</li>
              <li className="flex items-center gap-3"><Clock className="h-5 w-5 text-brand" /> Registration closes 25 March</li>
            </ul>
            <a href="#register" className="mt-8 inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 font-semibold text-brand-foreground shadow-glow hover:brightness-110">
              Register Now <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section id="register" className="bg-muted py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-display text-4xl sm:text-5xl">Registration form</h2>
          <p className="mt-3 text-muted-foreground">Takes 60 seconds. We'll follow up with payment details and your camp pack.</p>
          {done ? (
            <div className="mt-8 rounded-2xl border border-brand bg-background p-8 text-center">
              <h3 className="text-display text-3xl">You're in! 🔥</h3>
              <p className="mt-2 text-muted-foreground">Check your email for the confirmation and camp pack in the next few minutes.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
              <Field name="full_name" label="Full name" required />
              <Field name="email" type="email" label="Email" required />
              <Field name="phone" label="Phone" required />
              <Field name="age" type="number" label="Age" min={10} max={99} />
              <Field name="ministry" label="Ministry (MYF / MYA / Campus)" />
              <Field name="emergency_contact" label="Emergency contact name" />
              <Field name="emergency_phone" label="Emergency contact phone" />
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Additional notes</label>
                <textarea name="notes" rows={4} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-6 py-3.5 font-semibold text-ink-foreground transition hover:bg-black disabled:opacity-60 sm:w-auto">
                  {loading ? "Submitting…" : "Submit registration"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-display text-4xl sm:text-5xl">Past camps</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { y: "2025", t: "Refined", loc: "Naivasha" },
              { y: "2024", t: "Anchor", loc: "Machakos" },
              { y: "2023", t: "Awakening", loc: "Naivasha" },
            ].map((c) => (
              <article key={c.y} className="group overflow-hidden rounded-2xl border border-border bg-card">
                <div className="aspect-[16/10] bg-gradient-to-br from-ink to-brand" />
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand">Camp {c.y}</p>
                  <h3 className="text-display mt-2 text-3xl">{c.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.loc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ name, label, type = "text", required, min, max }: { name: string; label: string; type?: string; required?: boolean; min?: number; max?: number }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">{label}{required ? " *" : ""}</label>
      <input id={name} name={name} type={type} required={required} min={min} max={max} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none" />
    </div>
  );
}