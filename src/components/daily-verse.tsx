import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Verse = { reference: string; text: string; challenge: string };

/*
  Used when the admin has not scheduled a verse for today.
  One is picked by day of the year so the card is never empty.
*/
const FALLBACK: Verse[] = [
  { reference: "Joshua 1:9", text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.", challenge: "Do one brave thing today that you have been putting off." },
  { reference: "Philippians 4:13", text: "I can do all things through Christ which strengtheneth me.", challenge: "Pray before you start your hardest task today." },
  { reference: "Proverbs 3:5", text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.", challenge: "Hand one worry over to God in prayer right now." },
  { reference: "Psalm 46:1", text: "God is our refuge and strength, a very present help in trouble.", challenge: "Text a friend who is going through a hard time and tell them you are praying." },
  { reference: "1 Timothy 4:12", text: "Let no man despise thy youth; but be thou an example of the believers, in word, in conversation, in charity, in spirit, in faith, in purity.", challenge: "Be an example today: say one kind and honest thing to someone." },
  { reference: "Jeremiah 29:11", text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.", challenge: "Write down one thing you are hoping God will do in your life." },
  { reference: "Romans 8:28", text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.", challenge: "Thank God for something that did not go the way you planned." },
  { reference: "Isaiah 41:10", text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.", challenge: "Name one fear out loud and tell God you are not facing it alone." },
  { reference: "Psalm 119:105", text: "Thy word is a lamp unto my feet, and a light unto my path.", challenge: "Read one chapter of the Bible today, even a short one." },
  { reference: "Matthew 5:16", text: "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.", challenge: "Do one good deed today without telling anyone." },
  { reference: "Psalm 23:1", text: "The LORD is my shepherd; I shall not want.", challenge: "Take two quiet minutes today with no phone, just you and God." },
  { reference: "John 3:16", text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", challenge: "Share this verse with one friend today." },
  { reference: "Romans 12:2", text: "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.", challenge: "Notice what you watch and listen to today. Does it build you up?" },
  { reference: "2 Timothy 1:7", text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.", challenge: "Speak up for something right today, even if your voice shakes." },
];

const STORAGE_KEY = "mavuno_verse_streak";

type Streak = { last: string; count: number };

/* Local date as YYYY-MM-DD, so "today" follows the person's own clock */
function dateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

function readStreak(): Streak {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { last: "", count: 0 };
    const s = JSON.parse(raw);
    return { last: String(s.last || ""), count: Number(s.count) || 0 };
  } catch {
    return { last: "", count: 0 };
  }
}

function writeStreak(s: Streak) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* storage can be blocked, the card still works for this visit */
  }
}

export function DailyVerse() {
  const [today, setToday] = useState<string | null>(null);
  const [verse, setVerse] = useState<Verse | null>(null);
  const [streak, setStreak] = useState<Streak>({ last: "", count: 0 });

  useEffect(() => {
    const now = new Date();
    const key = dateKey(now);
    setToday(key);
    setStreak(readStreak());
    setVerse(FALLBACK[dayOfYear(now) % FALLBACK.length]);

    // If the admin scheduled a verse for today, show that one instead
    (supabase as any)
      .from("daily_verses")
      .select("reference,verse_text,challenge")
      .eq("verse_date", key)
      .maybeSingle()
      .then(({ data }: { data: any }) => {
        if (data) {
          setVerse({ reference: data.reference, text: data.verse_text, challenge: data.challenge || "" });
        }
      });
  }, []);

  if (!today || !verse) {
    return <section className="bg-background py-16"><div className="mx-auto h-64 max-w-7xl px-4" /></section>;
  }

  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return dateKey(d);
  })();

  const doneToday = streak.last === today;
  const alive = streak.last === today || streak.last === yesterday;
  const shownStreak = alive ? streak.count : 0;

  function markDone() {
    if (doneToday) return;
    const next: Streak = { last: today!, count: streak.last === yesterday ? streak.count + 1 : 1 };
    writeStreak(next);
    setStreak(next);
  }

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-ink p-8 text-ink-foreground sm:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-brand">Verse of the day</p>
              <blockquote className="mt-5 text-2xl font-medium leading-snug sm:text-3xl">
                "{verse.text}"
              </blockquote>
              <p className="mt-4 text-lg font-semibold text-brand">{verse.reference}</p>
              {verse.challenge && (
                <div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Today's challenge</p>
                  <p className="mt-1 text-white/90">{verse.challenge}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 lg:col-span-4">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-6 text-center">
                <Flame className={`mx-auto h-8 w-8 ${shownStreak > 0 ? "text-brand" : "text-white/30"}`} />
                <div className="text-display mt-2 text-5xl text-brand">{shownStreak}</div>
                <div className="text-xs font-medium uppercase tracking-widest text-white/60">
                  day streak
                </div>
              </div>
              <button
                type="button"
                onClick={markDone}
                disabled={doneToday}
                className={
                  doneToday
                    ? "inline-flex items-center justify-center gap-2 rounded-md border border-brand/50 bg-brand/10 px-6 py-3.5 font-semibold text-brand"
                    : "inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 font-semibold text-brand-foreground shadow-glow transition hover:brightness-110"
                }
              >
                {doneToday ? <><Check className="h-4 w-4" /> Done for today</> : "I read it and did it"}
              </button>
              <Link to="/trivia" className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white/80 hover:text-brand">
                Play Bible trivia <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}