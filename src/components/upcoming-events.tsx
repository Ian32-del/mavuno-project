import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  location: string | null;
  image_url: string | null;
};

const HOW_MANY = 3;

/* The "Upcoming" preview on the home page. It shows the next published events from Admin, Events. */
export function UpcomingEvents() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("events")
      .select("id,title,event_date,location,image_url")
      .eq("published", true)
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(HOW_MANY)
      .then(({ data }) => {
        setEvents((data ?? []) as EventRow[]);
        setLoading(false);
      });
  }, []);

  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">What's next</p>
            <h2 className="text-display mt-3 text-4xl sm:text-5xl">Upcoming.</h2>
          </div>
          <Link to="/events" className="hidden font-semibold text-brand sm:inline-flex sm:items-center sm:gap-1">
            All events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading && <p className="mt-10 text-muted-foreground">Loading events...</p>}

        {!loading && events.length === 0 && (
          <p className="mt-10 text-muted-foreground">
            No upcoming events right now. Check back soon, or see <Link to="/events" className="font-semibold text-brand">the events page</Link>.
          </p>
        )}

        {events.length > 0 && (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {events.map((e) => {
              const date = new Date(e.event_date).toLocaleDateString("en-KE", { weekday: "short", day: "2-digit", month: "short" });
              return (
                <Link key={e.id} to="/events" className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-brand">
                  {e.image_url && <img src={e.image_url} alt={e.title} loading="lazy" className="h-40 w-full object-cover" />}
                  <div className="p-6">
                  <Calendar className="h-5 w-5 text-brand" />
                  <div className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{date}</div>
                  <h3 className="text-display mt-2 text-2xl">{e.title}</h3>
                  {e.location && <p className="mt-1 text-sm text-muted-foreground">{e.location}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <Link to="/events" className="mt-8 inline-flex items-center gap-1 font-semibold text-brand sm:hidden">
          All events <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}