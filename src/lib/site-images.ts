import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/*
  Public side of featured photos.
  useSiteImage("mya_hero", fallbackImage) returns the photo an admin chose,
  or the fallback you pass in when none has been set.
*/

type SlotMap = Record<string, string>;

let cache: SlotMap | null = null;
let inflight: Promise<SlotMap> | null = null;

function loadSlots(): Promise<SlotMap> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = (supabase as any)
      .from("site_images")
      .select("slot,image_url")
      .not("image_url", "is", null)
      .then(({ data }: { data: { slot: string; image_url: string }[] | null }) => {
        const map: SlotMap = {};
        (data ?? []).forEach((r) => { map[r.slot] = r.image_url; });
        cache = map;
        return map;
      })
      .catch(() => ({} as SlotMap))
      .finally(() => { inflight = null; });
  }
  return inflight as Promise<SlotMap>;
}

export function useSiteImage(slot: string, fallback: string): string {
  const [src, setSrc] = useState<string>(cache?.[slot] ?? fallback);

  useEffect(() => {
    let alive = true;
    loadSlots().then((map) => {
      if (alive && map[slot]) setSrc(map[slot]);
    });
    return () => { alive = false; };
  }, [slot]);

  return src;
}