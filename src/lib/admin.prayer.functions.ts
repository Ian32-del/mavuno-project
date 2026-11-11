import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/*
  Prayer request assignment.
  Full admins (super_admin, pastor) see every request and assign it to a leader.
  Leaders only ever see the requests assigned to them. The database enforces that too.
*/

type Role = "super_admin" | "pastor" | "ministry_leader";

async function ensureRole(ctx: { supabase: any; userId: string }, allowed?: Role[]) {
  const { data, error } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  const roles: Role[] = (data ?? []).map((r: any) => r.role);
  if (roles.length === 0) throw new Error("Forbidden");
  if (allowed && !roles.some((r) => allowed.includes(r))) throw new Error("Forbidden");
  return roles;
}

export type PrayerStatus = "new" | "assigned" | "in_progress" | "done";

export type PrayerAdminRow = {
  id: string
  created_at: string
  name: string
  email: string | null
  phone: string | null
  request: string
  is_praise: boolean
  status: PrayerStatus
  assigned_to: string | null
  assigned_at: string | null
  leader_notes: string | null
  handled_at: string | null
};

export type AssignableLeader = {
  user_id: string
  email: string
  full_name: string | null
  role: string
};

// Roles of the signed in person, used to decide what the dashboard shows
export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return (await ensureRole(context)) as Role[];
  });

// FULL ADMINS
export const listAllPrayer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureRole(context, ["super_admin", "pastor"]);
    const { data, error } = await (context.supabase as any)
      .from("prayer_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as PrayerAdminRow[];
  });

export const listAssignableLeaders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureRole(context, ["super_admin", "pastor"]);
    const { data, error } = await (context.supabase as any).rpc("list_assignable_leaders");
    if (error) throw new Error(error.message);
    return (data ?? []) as AssignableLeader[];
  });

export const assignPrayer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      leader_id: z.string().uuid().nullable(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureRole(context, ["super_admin", "pastor"]);
    const assigning = !!data.leader_id;
    const { error } = await (context.supabase as any)
      .from("prayer_requests")
      .update({
        assigned_to: data.leader_id,
        assigned_by: assigning ? context.userId : null,
        assigned_at: assigning ? new Date().toISOString() : null,
        status: assigning ? "assigned" : "new",
        handled_at: null,
        handled_by: null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// LEADERS (and anyone with a role): only their own assigned requests
export const listMyPrayer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureRole(context);
    const { data, error } = await (context.supabase as any)
      .from("prayer_requests")
      .select("*")
      .eq("assigned_to", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as PrayerAdminRow[];
  });

export const updateMyPrayer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["assigned", "in_progress", "done"]),
      leader_notes: z.string().max(2000).optional().nullable(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureRole(context);
    const { error } = await (context.supabase as any)
      .from("prayer_requests")
      .update({
        status: data.status,
        leader_notes: data.leader_notes || null,
        handled_by: context.userId,
        handled_at: data.status === "done" ? new Date().toISOString() : null,
      })
      .eq("id", data.id)
      .eq("assigned_to", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });