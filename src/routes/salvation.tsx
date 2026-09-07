import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Flame } from "lucide-react";
import { submitSalvationDecision } from "@/lib/forms.functions";

export const Route = createFileRoute("/salvation")({
  head: () => ({
    meta: [
      { title: "I Have Decided to Follow Jesus — Mavuno Youth" },
      { name: "description", content: "Made the most important decision of your life? Let us walk with you from here." },
      { property: "og:title", content: "I Follow Jesus" },
      { property: "og:description", content: "The biggest yes you'll ever say. Let us know so we can walk with you." },
      { property: "og:url", content: "/salvation" },
    ],
    links: [{ rel: "canonical", href: "/salvation" }],
  }),
  component: SalvationPage,
});

function SalvationPage() {
  const submit = useServerFn(submitSalvationDecision);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await submit({
        data: {
          name: String(fd.get("name") || ""),
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          ministry_interest: String(fd.get("ministry_interest") || ""),
          notes: String(fd.get("notes") || ""),
        },
      });
      setDone(true);
      toast.success("Welcome to the family of God!");
    } catch (err) {
      toast.error("Something went wrong", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="relative isolate overflow-hidden bg-dawn text-white">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
          <Flame className="mx-auto h-10 w-10 text-brand" />
          <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-brand">Today is the day</p>
          <h1 className="text-display mt-4 text-5xl sm:text-7xl lg:text-8xl">I have decided to <span className="text-brand">follow Jesus.</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/85">
            You just said the most important yes of your life. Tell us who you are — a leader will personally reach out
            this week to help you take your next steps in Christ.
          </p>
        </div>
      </section>
      <section className="bg-background py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {done ? (
            <div className="rounded-2xl border border-brand bg-card p-10 text-center">
              <h2 className="text-display text-4xl">Welcome home 🔥</h2>
              <p className="mt-3 text-muted-foreground">Heaven is celebrating. So are we. A leader will reach out within 48 hours.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <h2 className="text-display text-3xl">Tell us who you are</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="text-sm font-medium">Name *</label><input required name="name" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
                <div><label className="text-sm font-medium">Email *</label><input required type="email" name="email" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
                <div><label className="text-sm font-medium">Phone</label><input name="phone" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
                <div>
                  <label className="text-sm font-medium">Ministry you'd fit best</label>
                  <select name="ministry_interest" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none">
                    <option value="">Not sure</option>
                    <option>MYF (Teens 13–19)</option>
                    <option>MYA (Young Adults 20s)</option>
                    <option>Campus Trends (Uni/College)</option>
                  </select>
                </div>
              </div>
              <div><label className="text-sm font-medium">Anything you'd like us to know?</label><textarea name="notes" rows={4} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
              <button disabled={loading} className="w-full rounded-md bg-brand px-6 py-3.5 font-semibold text-brand-foreground shadow-glow hover:brightness-110 disabled:opacity-60">
                {loading ? "Sending…" : "I have decided to follow Jesus"}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}