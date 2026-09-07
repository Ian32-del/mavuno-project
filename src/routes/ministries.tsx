import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ArrowLeft } from "lucide-react";

import myfImage from "@/assets/ministry-myf.jpeg";
import myaImage from "@/assets/ministry-mya.jpeg";
import campusImage from "@/assets/ministry-campus.jpeg";

const ministries = [
  {
    slug: "myf",
    title: "Mavuno Youth Fellowship",
    tag: "MYF",
    desc: "A community for young people growing together in faith, purpose, and Christ.",
    img: myfImage,
  },
  {
    slug: "mya",
    title: "Mavuno Young Adults",
    tag: "MYA",
    desc: "A space for young adults navigating faith, work, relationships, and life.",
    img: myaImage,
  },
  {
    slug: "campus",
    title: "Mavuno Campus",
    tag: "Campus",
    desc: "A ministry helping students encounter Jesus and live out their faith on campus.",
    img: campusImage,
  },
];

export const Route = createFileRoute("/ministries")({
  component: RouteComponent,
});

function RouteComponent() {
  const matchRoute = useMatchRoute();
  const isExact = matchRoute({ to: "/ministries", fuzzy: false });

  if (isExact) {
    return <MinistriesListPage />;
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          to="/ministries"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-brand transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Ministries
        </Link>
      </div>
      <Outlet />
    </>
  );
}



function MinistriesListPage() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">
              Three ministries · One movement
            </p>
            <h1 className="text-display mt-3 text-4xl sm:text-5xl lg:text-6xl">
              Find your people.
            </h1>
          </div>
          <p className="max-w-md text-muted-foreground">
            Each ministry meets a distinct season of life with the same
            unchanging Gospel.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {ministries.map((m) => (
            <Link
              key={m.slug}
              to={`/ministries/${m.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={m.img}
                  alt={m.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <span className="inline-block rounded-full bg-brand/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-foreground">
                    {m.tag}
                  </span>
                  <h2 className="text-display mt-3 text-3xl">{m.title}</h2>
                  <p className="mt-2 text-sm text-white/80">{m.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                    Learn more
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}