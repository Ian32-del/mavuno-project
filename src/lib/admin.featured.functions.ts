import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* Server functions for the featured photos page in the admin */

type Role = "super_admin" | "pastor" | "ministry_leader";

async function ensureAdmin(ctx: { supabase: any; userId: string }, allowed?: Role[]) {
  const { data, error } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  const roles: Role[] = (data ?? []).map((r: any) => r.role);
  if (roles.length === 0) throw new Error("Forbidden");
  if (allowed && !roles.some((r) => allowed.includes(r))) throw new Error("Forbidden");
  return roles;
}

// The only photo spots an admin can change
export const EDITABLE_SLOTS = ["home_hero", "myf_hero", "mya_hero", "campus_hero"] as const;

export type SiteImageRow = {
  slot: string
  label: string
  hint: string | null
  image_url: string | null
  alt: string | null
  sort_order: number
  updated_at: string
};

export const listSiteImages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await (context.supabase as any)
      .from("site_images")
      .select("*")
      .in("slot", [...EDITABLE_SLOTS])
      .order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []) as SiteImageRow[];
  });

export const setSiteImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({
      slot: z.enum(EDITABLE_SLOTS),
      image_url: z.string().url().nullable(),
      alt: z.string().max(200).optional().nullable(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await (context.supabase as any)
      .from("site_images")
      .update({
        image_url: data.image_url,
        alt: data.alt ?? null,
        updated_at: new Date().toISOString(),
        updated_by: context.userId,
      })
      .eq("slot", data.slot);
    if (error) throw new Error(error.message);
    return { ok: true };
  });