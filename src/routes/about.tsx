import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { Heart, Sparkles, Users, BookOpen, Flame, Compass } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Mavuno Youth Ministries" },
      { name: "description", content: "Our mission, vision, values and story. Raising Christ-centered leaders for this generation." },
      { property: "og:title", content: "About — Mavuno Youth Ministries" },
      { property: "og:description", content: "Our mission, vision, values and story." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const values = [
  { icon: BookOpen, t: "Truth", d: "The Word of God is our anchor — non-negotiable, life-shaping, always relevant." },
  { icon: Users, t: "Community", d: "We were never meant to walk alone. We do life together, on purpose." },
  { icon: Flame, t: "Fire", d: "Passion for Jesus is not optional. We worship loud and live wholehearted." },
  { icon: Compass, t: "Courage", d: "Fearless in a world of compromise. We take ground, not opinions." },
  { icon: Heart, t: "Generosity", d: "We give what we have — time, love, resources — because we've received grace." },
  { icon: Sparkles, t: "Excellence", d: "Whatever we do, we do it heartily for the Lord." },
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title={<>A movement of <span className="text-brand">young people</span> who won't stay quiet.</>}
        subtitle="Mavuno Youth Ministries exists to raise Christ-centered leaders across three life-stages: teenagers, young adults, and university students."
      />
      <section className="bg-background py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">Mission</p>
            <h2 className="text-display mt-3 text-4xl sm:text-5xl">Turn ordinary young people into fearless followers of Christ.</h2>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">Vision</p>
            <h2 className="text-display mt-3 text-4xl sm:text-5xl">A generation transforming families, campuses and nations for the glory of God.</h2>
          </div>
        </div>
      </section>
      <section className="bg-muted py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">Our values</p>
          <h2 className="text-display mt-3 text-4xl sm:text-5xl">Six things we refuse to compromise.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {values.map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-2xl border border-border bg-background p-6">
                <div className="grid h-12 w-12 place-items-center rounded-md bg-ink text-ink-foreground">
                  <Icon className="h-5 w-5 text-brand" />
                </div>
                <h3 className="text-display mt-4 text-2xl">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}