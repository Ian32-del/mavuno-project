import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Play, Flame, Heart, Users, Sparkles, Quote } from "lucide-react";
import heroImg from "@/assets/hero-worship.jpeg";
import myfImg from "@/assets/ministry-myf.jpeg";
import myaImg from "@/assets/ministry-mya.jpeg";
import campusImg from "@/assets/ministry-campus.jpeg";
import bonfireImg from "@/assets/camp-bonfire.jpeg";

export const Route = createFileRoute("/")({
  component: Index,
});

const stats = [
  { value: "12K+", label: "Lives Impacted" },
  { value: "450", label: "Active Leaders" },
  { value: "6", label: "Annual Camps" },
  { value: "220", label: "Small Groups" },
  { value: "28", label: "Universities Reached" },
];

const ministries = [
  {
    slug: "myf",
    tag: "Teens · 13–19",
    title: "Young & Fearless",
    desc: "For teenagers and high-schoolers. Discipleship, mentorship, worship experiences and camps that shape a bold generation.",
    img: myfImg,
  },
  {
    slug: "mya",
    tag: "Young Adults · 20s",
    title: "Young Adults",
    desc: "For young professionals stepping into purpose. Life transformation, leadership growth, networking and Christ-centered community.",
    img: myaImg,
  },
  {
    slug: "campus",
    tag: "Universities · Colleges",
    title: "Campus Trends",
    desc: "For university and college students. Campus fellowships, leadership training, missions and outreach across the nation.",
    img: campusImg,
  },
];

const testimonials = [
  { name: "Wanjiru K.", role: "Campus Trends · UoN", quote: "Camp changed my life. I walked in broken, I walked out called. I've never worshipped the same again." },
  { name: "Brian O.", role: "MYA · Nairobi", quote: "The community here carried me through my hardest year. I found brothers who pray, believe and dream with me." },
  { name: "Zawadi M.", role: "MYF · Form 4", quote: "I gave my life to Christ at MYF camp. Now I lead worship at my school fellowship. God is real." },
];

function Index() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-ink text-ink-foreground">
        <img
          src={heroImg}
          alt="Youth worshipping at Mavuno Youth conference"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-32 sm:px-6 lg:px-8">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand/50 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand">
            <Flame className="h-3.5 w-3.5" /> Mavuno Youth Ministries
          </span>
          <h1 className="text-display mt-6 max-w-5xl text-5xl leading-[0.95] text-white sm:text-7xl lg:text-[8rem]">
            Raising Christ-<span className="text-brand">Centered</span> Leaders for This Generation
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80 sm:text-xl">
            Empowering young people through discipleship, worship, leadership development,
            community and life-changing camp experiences.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/ministries/myf" className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3.5 text-base font-semibold text-brand-foreground shadow-glow transition hover:brightness-110">
              Join a Ministry <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/camps" className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/5 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10">
              Register for Camp
            </Link>
            <Link to="/sermons" className="inline-flex items-center gap-2 rounded-md px-6 py-3.5 text-base font-semibold text-white transition hover:text-brand">
              <Play className="h-4 w-4 fill-current" /> Watch Sermons
            </Link>
          </div>
        </div>
      </section>

      {/* WELCOME */}
      <section className="border-b border-border bg-background py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-5">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">Welcome home</p>
            <h2 className="text-display mt-4 text-4xl sm:text-5xl lg:text-6xl">
              A generation on fire for Jesus.
            </h2>
          </div>
          <div className="space-y-8 lg:col-span-7">
            <p className="text-lg text-muted-foreground">
              Whether you're a teenager finding your footing, a young adult chasing your calling, or a
              student rewriting the story of your campus — you belong here. Mavuno Youth is one movement
              across three ministries, united by a single mission: to raise fearless Christ-centered leaders.
            </p>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { icon: Heart, title: "Mission", body: "To turn ordinary young people into fearless followers of Christ." },
                { icon: Sparkles, title: "Vision", body: "A generation transforming families, campuses, nations." },
                { icon: Users, title: "Values", body: "Truth, community, worship, courage, generosity." },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-xl border border-border bg-card p-5">
                  <Icon className="h-6 w-6 text-brand" />
                  <h3 className="mt-3 font-display text-lg">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-ink py-14 text-ink-foreground">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-5 lg:px-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-display text-4xl text-brand sm:text-5xl">{s.value}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-widest text-white/60">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MINISTRIES */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand">Three ministries · One movement</p>
              <h2 className="text-display mt-3 text-4xl sm:text-5xl lg:text-6xl">Find your people.</h2>
            </div>
            <p className="max-w-md text-muted-foreground">
              Each ministry meets a distinct season of life with the same unchanging Gospel.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {ministries.map((m) => (
              <Link
                key={m.slug}
                to={`/ministries/${m.slug}` as "/ministries/myf"}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img src={m.img} alt={m.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <span className="inline-block rounded-full bg-brand/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-foreground">{m.tag}</span>
                    <h3 className="text-display mt-3 text-3xl">{m.title}</h3>
                    <p className="mt-2 text-sm text-white/80">{m.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CAMP BANNER */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <img src={bonfireImg} alt="Camp bonfire" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/20" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">Camp 2026 · Registration open</p>
            <h2 className="text-display mt-4 text-5xl sm:text-6xl lg:text-7xl">Ignite <span className="text-brand">2026</span></h2>
            <p className="mt-4 max-w-lg text-lg text-white/80">
              Four days. Thousands of young people. One radical encounter with Jesus. Nakuru, April 10–13.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/camps" className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 font-semibold text-brand-foreground shadow-glow transition hover:brightness-110">
                Register Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/camps" className="inline-flex items-center gap-2 rounded-md border border-white/25 px-6 py-3 font-semibold text-white hover:bg-white/10">
                See Details
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 self-end">
            {[{ v: "04", l: "Days" }, { v: "12", l: "Speakers" }, { v: "20+", l: "Sessions" }, { v: "1", l: "God" }].map((c) => (
              <div key={c.l} className="rounded-lg border border-white/15 bg-white/5 p-4 text-center backdrop-blur">
                <div className="text-display text-3xl text-brand">{c.v}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-white/70">{c.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">Stories</p>
          <h2 className="text-display mt-3 text-4xl sm:text-5xl lg:text-6xl">Lives being rewritten.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="relative rounded-2xl border border-border bg-card p-8">
                <Quote className="h-8 w-8 text-brand" />
                <blockquote className="mt-4 text-lg leading-snug">{t.quote}</blockquote>
                <figcaption className="mt-6 text-sm">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-muted-foreground">{t.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-10">
            <Link to="/stories" className="inline-flex items-center gap-2 font-semibold text-brand">Read more salvation stories <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* PRAYER + SALVATION CTA */}
      <section className="bg-ember text-brand-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2">
            <h2 className="text-display text-4xl sm:text-5xl lg:text-6xl">Take the next step.</h2>
            <p className="mt-4 max-w-2xl text-lg text-white/90">
              Whether you need someone to pray with you, you're ready to give your life to Christ,
              or you'd like a leader to reach out — we're here.
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:justify-end">
            <Link to="/salvation" className="inline-flex items-center justify-between rounded-md bg-ink px-5 py-4 font-semibold text-white hover:bg-black">
              I have decided to follow Jesus <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/prayer" className="inline-flex items-center justify-between rounded-md border-2 border-white bg-transparent px-5 py-4 font-semibold text-white hover:bg-white hover:text-ink">
              Submit a prayer request <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-between rounded-md px-5 py-4 font-semibold text-white/90 hover:text-white">
              Talk to a leader <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* EVENTS PREVIEW */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand">What's next</p>
              <h2 className="text-display mt-3 text-4xl sm:text-5xl">Upcoming.</h2>
            </div>
            <Link to="/events" className="hidden font-semibold text-brand sm:inline-flex sm:items-center sm:gap-1">All events <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { d: "Fri 14 Feb", t: "MYA Night of Worship", loc: "Bellevue Auditorium" },
              { d: "Sat 01 Mar", t: "Campus Leaders Summit", loc: "USIU Nairobi" },
              { d: "10–13 Apr", t: "Ignite Camp 2026", loc: "Nakuru" },
            ].map((e) => (
              <div key={e.t} className="group rounded-xl border border-border bg-card p-6 transition hover:border-brand">
                <Calendar className="h-5 w-5 text-brand" />
                <div className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{e.d}</div>
                <h3 className="text-display mt-2 text-2xl">{e.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{e.loc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
