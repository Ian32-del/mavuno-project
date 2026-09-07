import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, MapPin, Clock } from "lucide-react";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Mavuno Youth" },
      { name: "description", content: "Upcoming worship nights, summits, camps and gatherings across Mavuno Youth ministries." },
      { property: "og:title", content: "Events — Mavuno Youth" },
      { property: "og:description", content: "What's happening this month." },
      { property: "og:url", content: "/events" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: EventsPage,
});

const events = [
  { d: "Fri 14 Feb", t: "MYA Night of Worship", time: "7:00 PM", loc: "Bellevue Auditorium", tag: "MYA" },
  { d: "Sat 22 Feb", t: "MYF Superbowl", time: "10:00 AM", loc: "Karura Grounds", tag: "MYF" },
  { d: "Sat 01 Mar", t: "Campus Leaders Summit", time: "9:00 AM", loc: "USIU Nairobi", tag: "Campus" },
  { d: "Fri 21 Mar", t: "All-Youth Prayer Night", time: "8:00 PM", loc: "Bellevue Campus", tag: "All" },
  { d: "10–13 Apr", t: "Ignite Camp 2026", time: "All day", loc: "Lake Naivasha", tag: "All" },
  { d: "Sat 03 May", t: "MYF Talent Night", time: "5:00 PM", loc: "MYF Zone", tag: "MYF" },
];

function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Events"
        title={<>Show up. <span className="text-brand">Something's happening.</span></>}
        subtitle="Worship nights, summits, camps, prayer meetings — the Mavuno Youth calendar is always full and always free."
      />
      <section className="bg-background py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {events.map((e) => (
              <div key={e.t} className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
                <div className="flex items-start gap-6">
                  <div className="w-24 shrink-0 rounded-md bg-ink px-3 py-3 text-center text-white">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-brand">{e.d.split(" ")[0]}</div>
                    <div className="text-display text-2xl leading-tight text-white">{e.d.replace(/^\S+\s/, "")}</div>
                  </div>
                  <div>
                    <span className="inline-block rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand">{e.tag}</span>
                    <h3 className="text-display mt-2 text-2xl">{e.t}</h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {e.time}</span>
                      <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {e.loc}</span>
                    </div>
                  </div>
                </div>
                <button className="rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold hover:border-brand hover:text-brand">RSVP</button>
              </div>
            ))}
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4" /> Add to your calendar — subscribe via ICS link (coming soon).</p>
        </div>
      </section>
    </>
  );
}