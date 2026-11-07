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

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  location: string | null;
  ministry_slug: string | null;
  registration_url: string | null;
};

function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  /* Everything here comes from Admin, Events. Only published events with a date still ahead are shown. */
  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("published", true)
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .then(({ data, error }) => {
        if (error) setFailed(true);
        setEvents((data ?? []) as EventRow[]);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Events"
        title={<>Show up. <span className="text-brand">Something's happening.</span></>}
        subtitle="Worship nights, summits, camps, prayer meetings. The Mavuno Youth calendar is always full and always free."
      />
      <section className="bg-background py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {loading && <div className="py-16 text-center text-muted-foreground">Loading events...</div>}

          {!loading && failed && (
            <div className="py-16 text-center text-muted-foreground">We could not load the events right now. Please try again shortly.</div>
          )}

          {!loading && !failed && events.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">No upcoming events at the moment. Check back soon.</div>
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
                    {e.registration_url && (
                      <a
                        href={e.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold hover:border-brand hover:text-brand"
                      >
                        RSVP
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" /> Add to your calendar: subscribe via ICS link (coming soon).
          </p>
        </div>
      </section>
    </>
  );
}