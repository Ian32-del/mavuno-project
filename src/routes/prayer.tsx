import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { HeartHandshake } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { submitPrayerRequest } from "@/lib/forms.functions";

export const Route = createFileRoute("/prayer")({
  head: () => ({
    meta: [
      { title: "Prayer Requests — Mavuno Youth" },
      { name: "description", content: "Submit a prayer request or praise report. Our team prays over every message." },
      { property: "og:title", content: "Prayer Requests" },
      { property: "og:description", content: "We'd love to pray with you." },
      { property: "og:url", content: "/prayer" },
    ],
    links: [{ rel: "canonical", href: "/prayer" }],
  }),
  component: PrayerPage,
});

function PrayerPage() {
  const submit = useServerFn(submitPrayerRequest);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [isPraise, setIsPraise] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await submit({
        data: {
          name: `${String(fd.get("first_name") || "").trim()} ${String(fd.get("surname") || "").trim()}`,
          email: String(fd.get("email") || "").trim(),
          phone: String(fd.get("phone") || "").trim(),
          request: String(fd.get("request") || ""),
          is_praise: isPraise,
          is_public: false,
        },
      });
      setDone(true);
      toast.success("We're praying with you.", { description: "Your request has been received." });
    } catch (err) {
      toast.error("Something went wrong", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Prayer"
        title={<>You don't have to <span className="text-brand">carry it alone.</span></>}
        subtitle="Share what's on your heart. Our prayer team will personally lift up your request this week."
      />
      <section className="bg-background py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {done ? (
            <div className="rounded-2xl border border-brand bg-card p-10 text-center">
              <HeartHandshake className="mx-auto h-10 w-10 text-brand" />
              <h2 className="text-display mt-4 text-3xl">Prayer received.</h2>
              <p className="mt-2 text-muted-foreground">Our team stands with you. A leader may reach out to you by phone.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="inline-flex rounded-md border border-border bg-card p-1">
                <button type="button" onClick={() => setIsPraise(false)} className={`rounded px-4 py-2 text-sm font-semibold ${!isPraise ? "bg-brand text-brand-foreground" : "text-foreground"}`}>Prayer request</button>
                <button type="button" onClick={() => setIsPraise(true)} className={`rounded px-4 py-2 text-sm font-semibold ${isPraise ? "bg-brand text-brand-foreground" : "text-foreground"}`}>Praise report</button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="text-sm font-medium">First name *</label><input required name="first_name" autoComplete="given-name" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
                <div><label className="text-sm font-medium">Surname *</label><input required name="surname" autoComplete="family-name" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="text-sm font-medium">Phone number *</label><input required type="tel" name="phone" autoComplete="tel" placeholder="e.g. 0712 345 678" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
                <div><label className="text-sm font-medium">Email</label><input type="email" name="email" autoComplete="email" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
              </div>
              <div><label className="text-sm font-medium">{isPraise ? "What is God doing?" : "How can we pray with you?"} *</label><textarea required name="request" rows={6} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
              <button disabled={loading} className="w-full rounded-md bg-ink px-6 py-3.5 font-semibold text-ink-foreground disabled:opacity-60 sm:w-auto">
                {loading ? "Sending…" : "Send prayer request"}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}