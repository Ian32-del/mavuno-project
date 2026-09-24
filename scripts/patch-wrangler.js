import { readFileSync, writeFileSync } from "fs";

const path = ".output/server/wrangler.json";
const config = JSON.parse(readFileSync(path, "utf8"));

config.vars = {
  SUPABASE_URL: "https://wcnwamftynbxzanbnaou.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_v2Ih_4-IgzLBRHXyf5OBvA_1ms87wo4",
  VITE_SUPABASE_URL: "https://wcnwamftynbxzanbnaou.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_v2Ih_4-IgzLBRHXyf5OBvA_1ms87wo4",
  VITE_YOUTUBE_API_KEY: "your-youtube-api-key-here",
};

writeFileSync(path, JSON.stringify(config, null, 2));
console.log("✅ Wrangler config patched with env vars");