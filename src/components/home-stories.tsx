import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Story = { name: string; role: string; quote: string };

const HOW_MANY = 3;

/*
  The Stories section on the home page.
  Approved stories from the admin show first. Any empty places are filled
  from the fallback list you pass in, so the section is never empty.
*/
export function HomeStories({ fallback }: { fallback: Story[] }) {
  const [approved, setApproved] = useState<Story[]>([]);

  useEffect(() => {
    (supabase as any)
      .from("approved_stories")
      .select("name,ministry,role_label,story,created_at")
      .order("created_at", { ascending: false })
      .limit(HOW_MANY)
      .then(({ data }: { data: any[] | null }) => {
        setApproved(
          (data ?? []).map((s) => ({
            name: s.name,
            role: [s.ministry, s.role_label].filter(Boolean).join(" · "),
            quote: s.story.length > 220 ? `${s.story.slice(0, 220).trim()}...` : s.story,
          })),
        );
      });
  }, []);

  const stories = [...approved, ...fallback].slice(0, HOW_MANY);

  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">Stories</p>
        <h2 className="text-display mt-3 text-4xl sm:text-5xl lg:text-6xl">Lives being rewritten.</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {stories.map((t, i) => (
            <figure key={`${t.name}-${i}`} className="relative rounded-2xl border border-border bg-card p-8">
              <Quote className="h-8 w-8 text-brand" />
              <blockquote className="mt-4 text-lg leading-snug">{t.quote}</blockquote>
              <figcaption className="mt-6 text-sm">
                <div className="font-semibold">{t.name}</div>
                {t.role && <div className="text-muted-foreground">{t.role}</div>}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link to="/stories" className="inline-flex items-center gap-2 font-semibold text-brand">
            Read more salvation stories <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/share-story"
            className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-3 font-semibold text-brand-foreground shadow-glow transition hover:brightness-110"
          >
            Tell us your story <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}