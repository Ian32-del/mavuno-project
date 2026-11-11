import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* Server functions for managing ministry leaders in the admin */

type Role = "super_admin" | "pastor" | "ministry_leader";

async function ensureAdmin(ctx: { supabase: any; userId: string }, allowed?: Role[]) {
  const { data, error } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  const roles: Role[] = (data ?? []).map((r: any) => r.role);
  if (roles.length === 0) throw new Error("Forbidden");
  if (allowed && !roles.some((r) => allowed.includes(r))) throw new Error("Forbidden");
  return roles;
}

export type LeaderRow = {
  id: string
  ministry_slug: "myf" | "mya" | "campus"
  name: string
  role: string | null
  bio: string | null
  photo_url: string | null
  sort_order: number
  created_at: string
};

export const listLeaders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await (context.supabase as any)
      .from("ministry_leaders")
      .select("*")
      .order("sort_order")
      .order("created_at");
    if (error) throw new Error(error.message);
    return (data ?? []) as LeaderRow[];
  });

export const upsertLeader = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      ministry_slug: z.enum(["myf", "mya", "campus"]),
      name: z.string().trim().min(1).max(120),
      role: z.string().max(120).optional().nullable(),
      bio: z.string().max(1000).optional().nullable(),
      photo_url: z.string().max(2000).optional().nullable(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const row = {
      ministry_slug: data.ministry_slug,
      name: data.name,
      role: data.role || null,
      bio: data.bio || null,
      photo_url: data.photo_url || null,
    };
    const db = context.supabase as any;
    const { error } = data.id
      ? await db.from("ministry_leaders").update(row).eq("id", data.id)
      : await db.from("ministry_leaders").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteLeader = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await (context.supabase as any).from("ministry_leaders").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });