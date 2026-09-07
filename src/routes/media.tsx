import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import worship from "@/assets/hero-worship.jpeg";
import myf from "@/assets/ministry-myf.jpeg";
import mya from "@/assets/ministry-mya.jpeg";
import campus from "@/assets/ministry-campus.jpeg";
import bonfire from "@/assets/camp-bonfire.jpeg";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "Media Center — Mavuno Youth" },
      { name: "description", content: "Photos and videos from Mavuno Youth camps, worship nights, outreaches and conferences." },
      { property: "og:title", content: "Media Center — Mavuno Youth" },
      { property: "og:description", content: "Camp highlights, worship, outreach and more." },
      { property: "og:url", content: "/media" },
    ],
    links: [{ rel: "canonical", href: "/media" }],
  }),
  component: MediaPage,
});

const gallery = [
  { img: worship, cat: "Worship" },
  { img: bonfire, cat: "Camps" },
  { img: myf, cat: "MYF" },
  { img: mya, cat: "MYA" },
  { img: campus, cat: "Campus" },
  { img: worship, cat: "Conferences" },
  { img: bonfire, cat: "Camps" },
  { img: myf, cat: "Outreach" },
];
const categories = ["All", "Camps", "Worship", "MYF", "MYA", "Campus", "Outreach", "Conferences"];

function MediaPage() {
  const [cat, setCat] = useState("All");
  const items = cat === "All" ? gallery : gallery.filter(g => g.cat === cat);
  return (
    <>
      <PageHero
        eyebrow="Media"
        title={<>Moments that <span className="text-brand">remind us</span> what God is doing.</>}
        subtitle="Photos and videos from every gathering, camp and worship night."
      />
      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${cat === c ? "border-brand bg-brand text-brand-foreground" : "border-border bg-card hover:border-brand"}`}>{c}</button>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {items.map((g, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                <img src={g.img} alt={g.cat} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-x-2 bottom-2 rounded bg-ink/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white opacity-0 backdrop-blur transition group-hover:opacity-100">{g.cat}</div>
              </div>
            ))}
          </div>
          <h2 className="text-display mt-20 text-4xl sm:text-5xl">Videos</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {["Ignite 2025 — Aftermovie", "MYA Night of Worship", "Campus Missions Highlights"].map((v) => (
              <div key={v} className="group overflow-hidden rounded-2xl border border-border bg-card">
                <div className="relative grid aspect-video place-items-center bg-gradient-to-br from-ink to-brand">
                  <Play className="h-14 w-14 text-white/90 transition group-hover:scale-110" />
                </div>
                <div className="p-5"><h3 className="font-display text-xl">{v}</h3></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}