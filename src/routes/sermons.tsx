import { createFileRoute } from "@tanstack/react-router";
import { Play, Search } from "lucide-react";
import { useState } from "react";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/sermons")({
  head: () => ({
    meta: [
      { title: "Sermons — Mavuno Youth" },
      { name: "description", content: "Watch and listen to the latest messages, worship sets and teaching series from Mavuno Youth." },
      { property: "og:title", content: "Sermons — Mavuno Youth" },
      { property: "og:description", content: "Latest teaching, worship and testimony." },
      { property: "og:url", content: "/sermons" },
    ],
    links: [{ rel: "canonical", href: "/sermons" }],
  }),
  component: SermonsPage,
});

const sermons = [
  { title: "Rooted — Standing firm when it's shaking", speaker: "Pastor Kevin Mwangi", series: "Unshakable", date: "Feb 2026" },
  { title: "Purpose is not a job title", speaker: "Pastor Aisha Kariuki", series: "20s on Purpose", date: "Feb 2026" },
  { title: "Freshers: don't waste your first year", speaker: "Pastor Brian Kiptoo", series: "Campus", date: "Jan 2026" },
  { title: "How to hear God", speaker: "Pastor M. Muriithi", series: "Foundations", date: "Jan 2026" },
  { title: "The mercy of God", speaker: "Pastor Aisha Kariuki", series: "Grace", date: "Dec 2025" },
  { title: "Fearless — study of Daniel", speaker: "Pastor Kevin Mwangi", series: "MYF", date: "Dec 2025" },
];

function SermonsPage() {
  const [q, setQ] = useState("");
  const filtered = sermons.filter(s => (s.title + s.speaker + s.series).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHero
        eyebrow="Sermons Library"
        title={<>Teaching that <span className="text-brand">travels with you.</span></>}
        subtitle="Every Sunday message, worship set and special teaching — searchable, downloadable, always free."
      />
      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sermons, speakers, series…" className="w-full rounded-md border border-input bg-background py-3 pl-10 pr-4 text-sm focus:border-brand focus:outline-none" />
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <article key={s.title} className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-brand">
                <div className="relative grid aspect-video place-items-center bg-gradient-to-br from-ink to-brand">
                  <Play className="h-12 w-12 text-white/90 transition group-hover:scale-110" />
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand">{s.series} · {s.date}</p>
                  <h3 className="text-display mt-2 text-xl">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.speaker}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}