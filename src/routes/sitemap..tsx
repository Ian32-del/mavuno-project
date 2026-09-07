import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "";

const entries = [
  { path: "/", priority: "1.0", changefreq: "weekly" as const },
  { path: "/about", priority: "0.8", changefreq: "monthly" as const },
  { path: "/ministries/myf", priority: "0.9", changefreq: "monthly" as const },
  { path: "/ministries/mya", priority: "0.9", changefreq: "monthly" as const },
  { path: "/ministries/campus", priority: "0.9", changefreq: "monthly" as const },
  { path: "/camps", priority: "0.9", changefreq: "weekly" as const },
  { path: "/sermons", priority: "0.8", changefreq: "weekly" as const },
  { path: "/events", priority: "0.8", changefreq: "weekly" as const },
  { path: "/media", priority: "0.6", changefreq: "monthly" as const },
  { path: "/stories", priority: "0.7", changefreq: "monthly" as const },
  { path: "/visit", priority: "0.7", changefreq: "monthly" as const },
  { path: "/prayer", priority: "0.7", changefreq: "monthly" as const },
  { path: "/salvation", priority: "0.9", changefreq: "monthly" as const },
  { path: "/contact", priority: "0.6", changefreq: "monthly" as const },
];

export const Route = createFileRoute("/sitemap/")({
  server: {
    handlers: {
      GET: async () => {
        const urls = entries.map((e) =>
          `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});