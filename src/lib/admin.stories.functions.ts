import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* Server functions for reviewing stories people share on the website */

type Role = "super_admin" | "pastor" | "ministry_leader";

async function ensureAdmin(ctx: { supabase: any; userId: string }, allowed?: Role[]) {
  const { data, error } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  const roles: Role[] = (data ?? []).map((r: any) => r.role);
  if (roles.length === 0) throw new Error("Forbidden");
  if (allowed && !roles.some((r) => allowed.includes(r))) throw new Error("Forbidden");
  return roles;
}

export type StoryStatus = "pending" | "approved" | "rejected";

export type StoryRow = {
  id: string
  created_at: string
  name: string
  email: string | null
  ministry: string | null
  role_label: string | null
  story: string
  status: StoryStatus
  handled_at: string | null
};

export const listStories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await (context.supabase as any)
      .from("story_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as StoryRow[];
  });

export const setStoryStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["pending", "approved", "rejected"]),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await (context.supabase as any)
      .from("story_submissions")
      .update({
        status: data.status,
        handled_by: data.status === "pending" ? null : context.userId,
        handled_at: data.status === "pending" ? null : new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteStory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context, ["super_admin", "pastor"]);
    const { error } = await (context.supabase as any).from("story_submissions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });