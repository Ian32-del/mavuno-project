import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Leader = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  photo_url: string | null;
};

type Fallback = { name: string; role?: string };

/*
  Leadership section for a ministry page.
  Usage: <MinistryLeaders slug="myf" fallback={[{ name: "Kevin", role: "Discipleship Lead" }]} />
  Leaders added in Admin, Ministries show here. The fallback list only shows
  while no leader has been added for that ministry yet.
*/
export function MinistryLeaders({
  slug,
  fallback = [],
}: {
  slug: "myf" | "mya" | "campus";
  fallback?: Fallback[];
}) {
  const [leaders, setLeaders] = useState<Leader[] | null>(null);

  useEffect(() => {
    (supabase as any)
      .from("ministry_leaders")
      .select("id,name,role,bio,photo_url")
      .eq("ministry_slug", slug)
      .order("sort_order")
      .order("created_at")
      .then(({ data }: { data: Leader[] | null }) => setLeaders(data ?? []));
  }, [slug]);

  // Show the fallback while loading and when the admin has not added anyone yet
  const items: Leader[] =
    leaders && leaders.length > 0
      ? leaders
      : fallback.map((f, i) => ({ id: `fb-${i}`, name: f.name, role: f.role ?? null, bio: null, photo_url: null }));

  if (items.length === 0) return null;

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-display text-4xl sm:text-5xl">Leadership</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((l) => (
            <div key={l.id} className="rounded-xl border border-border bg-card p-6">
              {l.photo_url ? (
                <img src={l.photo_url} alt={l.name} loading="lazy" className="aspect-square w-full rounded-md object-cover" />
              ) : (
                <div className="aspect-square w-full rounded-md bg-gradient-to-br from-brand to-ember" />
              )}
              <h3 className="text-display mt-4 text-2xl">{l.name}</h3>
              {l.role && <div className="text-sm text-muted-foreground">{l.role}</div>}
              {l.bio && <p className="mt-2 text-sm text-muted-foreground">{l.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}