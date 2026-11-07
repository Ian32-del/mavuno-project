import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Users } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import bonfire from "@/assets/camp-bonfire.jpeg";

/* Where camp registration lives. Change this one line if the address ever changes. */
const CAMP_SITE_URL = "https://campfearless.app";

export const Route = createFileRoute("/camps")({
  head: () => ({
    meta: [
      { title: "Camps — Mavuno Youth" },
      { name: "description", content: "Camp Fearless for teens (MYF) and young adults (MYA). Register on the Camp Fearless website." },
      { property: "og:title", content: "Camp Fearless — Mavuno Youth" },
      { property: "og:description", content: "Worship, teaching, community and encounters with God. Register for MYF or MYA." },
      { property: "og:url", content: "/camps" },
      { property: "og:image", content: bonfire },
    ],
    links: [{ rel: "canonical", href: "/camps" }],
  }),
  component: CampsPage,
});

const CAMPS = [
  { code: "MYF", name: "Mavuno Young and Fearless", ages: "Ages 14 to 17" },
  { code: "MYA", name: "Mavuno Young Adults", ages: "Ages 18 and above" },
];

function CampsPage() {
  return (
    <>
      <PageHero
        eyebrow="Camps · Fearless"
        title={<>Days that <span className="text-brand">rewrite</span> your year.</>}
        subtitle="Camp Fearless is Mavuno Youth's flagship gathering. Worship, teaching, community and encounters with God that mark you for life."
      />

      <section className="relative bg-background py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="overflow-hidden rounded-2xl">
            <img src={bonfire} alt="Camp Fearless bonfire" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </div>

          <div>
            <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand">Registration</span>
            <h2 className="text-display mt-4 text-5xl sm:text-6xl">
              Camp <span className="text-brand">Fearless</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Registration for both camps, MYF and MYA, is on the Camp Fearless website. Choose the camp that matches your age, see the dates, fees and what to bring,
              then register and pay with M-Pesa.
            </p>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {CAMPS.map((camp) => (
                <li key={camp.code} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-brand">
                    <Users className="h-4 w-4" />
                    {camp.code}
                  </div>
                  <div className="mt-1 font-semibold">{camp.name}</div>
                  <div className="text-sm text-muted-foreground">{camp.ages}</div>
                </li>
              ))}
            </ul>

            <a
              href={CAMP_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 font-semibold text-brand-foreground shadow-glow hover:brightness-110"
            >
              Go to Camp Fearless registration <ArrowUpRight className="h-4 w-4" />
            </a>
            <p className="mt-3 text-sm text-muted-foreground">You will be taken to campfearless.app to choose your camp and register.</p>
          </div>
        </div>
      </section>

      <section className="bg-muted py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-display text-4xl sm:text-5xl">Past camps</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { y: "2025", t: "Refined", loc: "Hill City" },
              { y: "2024", t: "Anchor", loc: "Hill City" },
              { y: "2023", t: "Awakening", loc: "Hill City" },
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