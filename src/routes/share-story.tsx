import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/share-story")({
  head: () => ({
    meta: [
      { title: "Share Your Story | Mavuno Youth" },
      { name: "description", content: "Tell us what God has done in your life. Your story could encourage someone else." },
      { property: "og:title", content: "Share Your Story" },
      { property: "og:url", content: "/share-story" },
    ],
    links: [{ rel: "canonical", href: "/share-story" }],
  }),
  component: ShareStoryPage,
});

const inputClass =
  "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none";

function ShareStoryPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // Hidden field that only bots fill in. Pretend it worked and send nothing.
    if (String(fd.get("website") || "")) {
      setDone(true);
      return;
    }

    const story = String(fd.get("story") || "").trim();
    if (story.length < 20) {
      toast.error("Please write a little more", { description: "Your story needs at least 20 characters." });
      return;
    }

    setLoading(true);
    const { error } = await (supabase as any).from("story_submissions").insert({
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim() || null,
      ministry: String(fd.get("ministry") || "") || null,
      role_label: String(fd.get("role_label") || "").trim() || null,
      story,
      consent: fd.get("consent") === "on",
      status: "pending",
    });
    setLoading(false);

    if (error) {
      toast.error("Something went wrong", { description: "Please try again in a moment." });
      return;
    }
    setDone(true);
    toast.success("Thank you for sharing");
  }

  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <Quote className="mx-auto h-9 w-9 text-brand" />
          <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-brand">Stories</p>
          <h1 className="text-display mt-4 text-5xl sm:text-7xl">
            Tell us <span className="text-brand">your story.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            What has God done in your life? A salvation, a healing, a turning point at camp. Your story could be the
            encouragement someone else needs today.
          </p>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {done ? (
            <div className="rounded-2xl border border-brand bg-card p-10 text-center">
              <h2 className="text-display text-4xl">Thank you.</h2>
              <p className="mt-3 text-muted-foreground">
                We have received your story. A leader will read it, and if it is approved it will appear on the website.
              </p>
              <Link to="/" className="mt-6 inline-block font-semibold text-brand">Back to home</Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Your name *</label>
                  <input required maxLength={120} name="name" className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium">Email (private, optional)</label>
                  <input type="email" name="email" className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium">Ministry</label>
                  <select name="ministry" className={inputClass}>
                    <option value="">Not sure</option>
                    <option value="MYF">MYF (Teens 13 to 19)</option>
                    <option value="MYA">MYA (Young Adults 20s)</option>
                    <option value="Campus">Campus Trends (Uni and College)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Where are you from? (optional)</label>
                  <input maxLength={80} name="role_label" placeholder="e.g. UoN, Nairobi, Form 4" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Your story *</label>
                <textarea
                  required
                  name="story"
                  rows={8}
                  maxLength={2000}
                  onChange={(e) => setCount(e.target.value.length)}
                  placeholder="Where were you before? What happened? How are you different now?"
                  className={inputClass}
                />
                <div className="mt-1 text-right text-xs text-muted-foreground">{count} / 2000</div>
              </div>

              {/* Spam trap, hidden from people */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

              <label className="flex items-start gap-3 text-sm">
                <input required type="checkbox" name="consent" className="mt-1 h-4 w-4" />
                <span>
                  I agree that Mavuno Youth may share my story and name on the website. I understand it is reviewed
                  first and my email is never shown.
                </span>
              </label>

              <button
                disabled={loading}
                className="w-full rounded-md bg-brand px-6 py-3.5 font-semibold text-brand-foreground shadow-glow hover:brightness-110 disabled:opacity-60"
              >
                {loading ? "Sending..." : "Share my story"}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}