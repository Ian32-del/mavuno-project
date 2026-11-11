import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Quote, Play } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { supabase } from "@/integrations/supabase/client";

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

type Story = { id: string; n: string; sub?: string; q: string };

/* The original stories. They stay on the page after the ones people share. */
const classicStories: Story[] = [
  { id: "c1", n: "Michael, 24", q: "I was drowning in depression. At Ignite 2024 I met Jesus for real. Two years later I lead a life group." },
  { id: "c2", n: "Grace, 17", q: "My parents' divorce broke me. MYF became my second home. God became my Father." },
  { id: "c3", n: "Kwame, 21", q: "I got sober because Jesus is better. Campus Trends walked with me week after week." },
  { id: "c4", n: "Amina, 19", q: "I was ashamed of my past. Grace found me at a Sunday service and hasn't let go." },
  { id: "c5", n: "Tim, 26", q: "I thought success was money. MYA taught me success is faithfulness. My whole career changed." },
  { id: "c6", n: "Njeri, 22", q: "I fell in love with the Word here. Now I'm training to plant a fellowship on my campus." },
];

function ShareButton() {
  return (
    <Link
      to="/share-story"
      className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3.5 font-semibold text-brand-foreground shadow-glow transition hover:brightness-110"
    >
      Tell us your story <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

function StoriesPage() {
  const [shared, setShared] = useState<Story[]>([]);

  useEffect(() => {
    (supabase as any)
      .from("approved_stories")
      .select("id,name,ministry,role_label,story,created_at")
      .order("created_at", { ascending: false })
      .limit(60)
      .then(({ data }: { data: any[] | null }) => {
        setShared(
          (data ?? []).map((s) => ({
            id: s.id,
            n: s.name,
            sub: [s.ministry, s.role_label].filter(Boolean).join(" · ") || undefined,
            q: s.story,
          })),
        );
      });
  }, []);

  const stories = [...shared, ...classicStories];

  return (
    <>
      <PageHero
        eyebrow="Salvation Stories"
        title={<>Jesus is <span className="text-brand">still</span> rewriting lives.</>}
        subtitle="Every story below is a real person from our community. Read them. Believe again. Then share yours."
      />
      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex justify-center">
            <ShareButton />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((s) => (
              <figure key={s.id} className="rounded-2xl border border-border bg-card p-8">
                <Quote className="h-8 w-8 text-brand" />
                <blockquote className="mt-4 whitespace-pre-line text-lg leading-snug">"{s.q}"</blockquote>
                <figcaption className="mt-6">
                  <div className="font-semibold">{s.n}</div>
                  {s.sub && <div className="text-sm text-muted-foreground">{s.sub}</div>}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-16 rounded-2xl border border-brand/40 bg-card p-10 text-center">
            <h2 className="text-display text-3xl sm:text-4xl">Your story matters too.</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              What has Jesus done in your life? Share it with us. A leader will read it, and with your permission it
              can encourage someone else.
            </p>
            <div className="mt-6 flex justify-center">
              <ShareButton />
            </div>
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