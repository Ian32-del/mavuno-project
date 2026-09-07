import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Clock, Sparkles, Coffee, Users, HelpCircle } from "lucide-react";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/visit")({
  head: () => ({
    meta: [
      { title: "First Time Visiting? — Mavuno Youth" },
      { name: "description", content: "What to expect, when we meet, and how to make Sunday feel like home even if it's your first time." },
      { property: "og:title", content: "Plan Your Visit — Mavuno Youth" },
      { property: "og:description", content: "New here? Start with us." },
      { property: "og:url", content: "/visit" },
    ],
    links: [{ rel: "canonical", href: "/visit" }],
  }),
  component: VisitPage,
});

const faqs = [
  { q: "What should I wear?", a: "Come as you are. Jeans, dresses, sneakers — no dress code, no judgment." },
  { q: "Is there anything for my kids?", a: "Kids ministry runs alongside every service. Safe, fun, Jesus-centered." },
  { q: "How long is the service?", a: "About 90 minutes. Powerful worship, honest teaching." },
  { q: "Do I have to give?", a: "No. Giving is an act of worship for our members — first-time guests are our guests." },
  { q: "How do I join a ministry?", a: "Fill in the connect form after service or hit the button on any ministry page." },
];

function VisitPage() {
  return (
    <>
      <PageHero
        eyebrow="Plan Your Visit"
        title={<>New here? <span className="text-brand">Welcome home.</span></>}
        subtitle="Whatever you believe, wherever you're from — there's a seat with your name on it this Sunday."
      />
      <section className="bg-background py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <Info icon={Clock} title="Service times" body={<>Sundays<br />9:30 AM · 11:30 AM · 4:00 PM (MYA)</>} />
          <Info icon={MapPin} title="Location" body={<>Mavuno Bellevue Campus<br />Mombasa Road, Nairobi</>} />
          <Info icon={Coffee} title="Arrive early" body={<>Free coffee & connect points open 30 minutes before every service.</>} />
        </div>
      </section>
      <section className="bg-muted py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-display text-4xl sm:text-5xl">What to expect</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { icon: Sparkles, t: "Worship", d: "Loud, honest, Spirit-led. Come to encounter God, not perform." },
              { icon: Users, t: "Community", d: "Real people, real conversations. We'd love to meet you at the guest tent." },
              { icon: HelpCircle, t: "Word", d: "Practical, Bible-based teaching that meets you where you are." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-xl border border-border bg-background p-6">
                <Icon className="h-6 w-6 text-brand" />
                <h3 className="mt-3 font-display text-xl">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
          <h2 className="text-display mt-16 text-4xl sm:text-5xl">Frequently asked</h2>
          <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-background">
            {faqs.map((f) => (
              <details key={f.q} className="group px-6 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {f.q}<span className="text-brand transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Info({ icon: Icon, title, body }: { icon: React.ComponentType<{ className?: string }>; title: string; body: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <Icon className="h-6 w-6 text-brand" />
      <h3 className="mt-3 font-display text-2xl">{title}</h3>
      <p className="mt-2 text-muted-foreground">{body}</p>
    </div>
  );
}