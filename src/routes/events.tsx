import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, MapPin, Clock } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

const hardcodedEvents = [
  { id: "hc-1", event_date: "2026-02-14T19:00:00", title: "MYA Single's Night", location: "Hill City Grounds", ministry_slug: "MYA", registration_url: null },
  { id: "hc-2", event_date: "2026-02-22T10:00:00", title: "MYF Fashion Show", location: "Karura Grounds", ministry_slug: "MYF", registration_url: null },
  { id: "hc-3", event_date: "2026-03-01T09:00:00", title: "Campus Leaders Summit", location: "USIU Nairobi", ministry_slug: "Campus", registration_url: null },
  { id: "hc-4", event_date: "2026-03-21T20:00:00", title: "All-Youth Prayer Night", location: "Bellevue Campus", ministry_slug: "All", registration_url: null },
  { id: "hc-5", event_date: "2026-04-10T08:00:00", title: "Ignite Camp 2026", location: "Lake Naivasha", ministry_slug: "All", registration_url: null },
  { id: "hc-6", event_date: "2026-05-03T17:00:00", title: "MYF Cooking Night", location: "MYF Zone", ministry_slug: "MYF", registration_url: null },
];

function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("published", true)
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .then(({ data }) => {
        const dbEvents = data ?? [];
        const merged = [...hardcodedEvents, ...dbEvents].sort(
          (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        );
        setEvents(merged);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Events"
        title={<>Show up. <span className="text-brand">Something's happening.</span></>}
        subtitle="Worship nights, summits, camps, prayer meetings — the Mavuno Youth calendar is always full and always free."
      />
      <section className="bg-background py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

          {loading && (
            <div className="text-center text-muted-foreground py-16">Loading events...</div>
          )}

          {!loading && events.length === 0 && (
            <div className="text-center text-muted-foreground py-16">No upcoming events at the moment. Check back soon.</div>
          )}

          {!loading && events.length > 0 && (
            <div className="divide-y divide-border rounded-2xl border border-border bg-card">
              {events.map((e) => {
                const date = new Date(e.event_date);
                const day = date.toLocaleDateString("en-KE", { weekday: "short" });
                const dayNum = date.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
                const time = date.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });

                return (
                  <div key={e.id} className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-6">
                      <div className="w-24 shrink-0 rounded-md bg-ink px-3 py-3 text-center text-white">
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-brand">{day}</div>
                        <div className="text-display text-2xl leading-tight text-white">{dayNum}</div>
                      </div>
                      <div>
                        {e.ministry_slug && (
                          <span className="inline-block rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand">
                            {e.ministry_slug}
                          </span>
                        )}
                        <h3 className="text-display mt-2 text-2xl">{e.title}</h3>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {time}</span>
                          {e.location && (
                            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {e.location}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {e.registration_url ? (
                      <a
                        href={e.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold hover:border-brand hover:text-brand"
                      >
                        RSVP
                      </a>
                    ) : (
                      <button className="rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold hover:border-brand hover:text-brand">
                        RSVP
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" /> Add to your calendar — subscribe via ICS link (coming soon).
          </p>
        </div>
      </section>
    </>
  );
}