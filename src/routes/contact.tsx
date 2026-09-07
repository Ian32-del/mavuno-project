import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { submitContact } from "@/lib/forms.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Mavuno Youth" },
      { name: "description", content: "Reach out to Mavuno Youth Ministries. We'd love to hear from you." },
      { property: "og:title", content: "Contact — Mavuno Youth" },
      { property: "og:description", content: "Get in touch." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const submit = useServerFn(submitContact);
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
          subject: String(fd.get("subject") || ""),
          message: String(fd.get("message") || ""),
        },
      });
      setDone(true);
      toast.success("Message received!", { description: "We'll get back to you within 2 business days." });
    } catch (err) {
      toast.error("Something went wrong", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHero eyebrow="Contact" title={<>Say <span className="text-brand">hello.</span></>} subtitle="Questions, ideas, partnerships or just a hello — we'd love to hear from you." />
      <section className="bg-background py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="space-y-6 lg:col-span-2">
            <Row icon={MapPin} label="Address" value="Mavuno Bellevue Campus, Mombasa Road, Nairobi" />
            <Row icon={Mail} label="Email" value="youth@mavunochurch.org" />
            <Row icon={Phone} label="Phone" value="+254 700 000 000" />
          </div>
          <div className="lg:col-span-3">
            {done ? (
              <div className="rounded-2xl border border-brand bg-card p-8 text-center">
                <h2 className="text-display text-3xl">Thanks!</h2>
                <p className="mt-2 text-muted-foreground">We'll be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <F name="name" label="Name" required />
                  <F name="email" label="Email" type="email" required />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <F name="phone" label="Phone" />
                  <F name="subject" label="Subject" />
                </div>
                <div>
                  <label className="text-sm font-medium">Message *</label>
                  <textarea required name="message" rows={5} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                </div>
                <button disabled={loading} className="rounded-md bg-ink px-6 py-3 font-semibold text-ink-foreground disabled:opacity-60">
                  {loading ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-ink text-white"><Icon className="h-4 w-4 text-brand" /></div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="mt-1 font-medium">{value}</div>
      </div>
    </div>
  );
}
function F({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}{required ? " *" : ""}</label>
      <input name={name} type={type} required={required} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none" />
    </div>
  );
}