import { createFileRoute } from "@tanstack/react-router";
import { Quote, Play } from "lucide-react";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { title: "Salvation Stories — Mavuno Youth" },
      { name: "description", content: "Real transformation. Real people. Read and watch what Jesus is doing in the lives of young people at Mavuno." },
      { property: "og:title", content: "Salvation Stories" },
      { property: "og:description", content: "Written and video testimonies of lives changed by Jesus." },
      { property: "og:url", content: "/stories" },
    ],
    links: [{ rel: "canonical", href: "/stories" }],
  }),
  component: StoriesPage,
});

const stories = [
  { n: "Michael, 24", q: "I was drowning in depression. At Ignite 2024 I met Jesus for real. Two years later I lead a life group." },
  { n: "Grace, 17", q: "My parents' divorce broke me. MYF became my second home. God became my Father." },
  { n: "Kwame, 21", q: "I got sober because Jesus is better. Campus Trends walked with me week after week." },
  { n: "Amina, 19", q: "I was ashamed of my past. Grace found me at a Sunday service and hasn't let go." },
  { n: "Tim, 26", q: "I thought success was money. MYA taught me success is faithfulness. My whole career changed." },
  { n: "Njeri, 22", q: "I fell in love with the Word here. Now I'm training to plant a fellowship on my campus." },
];

function StoriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Salvation Stories"
        title={<>Jesus is <span className="text-brand">still</span> rewriting lives.</>}
        subtitle="Every story below is a real person from our community. Read them. Believe again. Then share yours."
      />
      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((s) => (
              <figure key={s.n} className="rounded-2xl border border-border bg-card p-8">
                <Quote className="h-8 w-8 text-brand" />
                <blockquote className="mt-4 text-lg leading-snug">"{s.q}"</blockquote>
                <figcaption className="mt-6 font-semibold">{s.n}</figcaption>
              </figure>
            ))}
          </div>
          <h2 className="text-display mt-20 text-4xl sm:text-5xl">Video testimonies</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group overflow-hidden rounded-2xl border border-border bg-card">
                <div className="relative grid aspect-video place-items-center bg-gradient-to-br from-ink to-brand">
                  <Play className="h-12 w-12 text-white/90 transition group-hover:scale-110" />
                </div>
                <div className="p-5"><h3 className="font-display text-xl">Testimony #{i}</h3></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}