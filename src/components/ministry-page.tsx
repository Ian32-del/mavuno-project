import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { PageHero } from "@/components/page-hero";

export interface MinistryPageProps {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  image: string;
  vision: string;
  mission: string;
  activities: string[];
  leaders: { name: string; role: string }[];
  meetTime: string;
  meetLocation: string;
}

export function MinistryPage(p: MinistryPageProps) {
  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
      <section className="bg-background py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-2xl">
              <img src={p.image} alt={p.eyebrow} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </div>
          </div>
          <div className="space-y-8 lg:col-span-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand">Vision</p>
              <p className="mt-2 text-xl">{p.vision}</p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand">Mission</p>
              <p className="mt-2 text-xl">{p.mission}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">We meet</p>
              <p className="mt-2 text-lg font-semibold">{p.meetTime}</p>
              <p className="text-muted-foreground">{p.meetLocation}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-display text-4xl sm:text-5xl">Key activities</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {p.activities.map((a) => (
              <li key={a} className="flex items-start gap-3 rounded-lg border border-border bg-background p-4">
                <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-display text-4xl sm:text-5xl">Leadership</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {p.leaders.map((l) => (
              <div key={l.name} className="rounded-xl border border-border bg-card p-6">
                <div className="aspect-square rounded-md bg-ember" />
                <h3 className="mt-4 font-display text-xl">{l.name}</h3>
                <p className="text-sm text-muted-foreground">{l.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ember py-20 text-brand-foreground">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-display text-4xl sm:text-6xl">Ready to belong?</h2>
          <p className="mt-4 text-lg text-white/90">Fill in a quick form and a leader will personally reach out this week.</p>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 font-semibold text-white hover:bg-black">
            Get connected <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}