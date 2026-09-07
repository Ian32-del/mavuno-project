import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-ink text-ink-foreground">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">{eyebrow}</p>
        ) : null}
        <h1 className="text-display mt-4 max-w-4xl text-5xl sm:text-6xl lg:text-8xl">
          {title}
        </h1>
        {subtitle ? <p className="mt-6 max-w-2xl text-lg text-white/75">{subtitle}</p> : null}
        {children}
      </div>
    </section>
  );
}