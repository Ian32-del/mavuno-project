import { createFileRoute } from "@tanstack/react-router";
import { Play, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { PageHero } from "@/components/page-hero";
import { fetchAdultsSermons } from "@/lib/youtube";

export const Route = createFileRoute("/sermons")({
  head: () => ({
    meta: [
      { title: "Sermons — Mavuno Youth" },
      { name: "description", content: "Watch the latest messages from Mavuno Church Adults Service." },
      { property: "og:title", content: "Sermons — Mavuno Youth" },
    ],
    links: [{ rel: "canonical", href: "/sermons" }],
  }),
  component: SermonsPage,
});

function SermonsPage() {
  const [sermons, setSermons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchAdultsSermons(18)
      .then(setSermons)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = sermons.filter(s =>
    (s.title + s.description).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <PageHero
        eyebrow="Sermons Library"
        title={<>Teaching that <span className="text-brand">travels with you.</span></>}
        subtitle="Every Sunday message from Mavuno Adults Service — always free."
      />
      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sermons, speakers, series…"
              className="w-full rounded-md border border-input bg-background py-3 pl-10 pr-4 text-sm focus:border-brand focus:outline-none"
            />
          </div>

          {loading && (
            <div className="mt-16 text-center text-muted-foreground">Loading sermons...</div>
          )}

          {error && (
            <div className="mt-16 text-center text-red-500">Failed to load sermons: {error}</div>
          )}

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <a
                key={s.id}
                href={s.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-brand"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={s.thumbnail}
                    alt={s.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand">
                    {new Date(s.publishedAt).toLocaleDateString("en-KE", { month: "long", year: "numeric" })}
                  </p>
                  <h3 className="text-display mt-2 text-xl line-clamp-2">{s.title}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}