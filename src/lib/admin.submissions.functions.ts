import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/*
  Server functions for salvation decisions and prayer requests.
  Any signed in admin can read and update them. Only super admins and pastors can delete,
  and the database enforces that as well.
*/

type Role = "super_admin" | "pastor" | "ministry_leader";

async function ensureAdmin(ctx: { supabase: any; userId: string }, allowed?: Role[]) {
  const { data, error } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  const roles: Role[] = (data ?? []).map((r: any) => r.role);
  if (roles.length === 0) throw new Error("Forbidden");
  if (allowed && !roles.some((r) => allowed.includes(r))) throw new Error("Forbidden");
  return roles;
}

export type SalvationStatus = "new" | "contacted" | "followed_up";
export type PrayerStatus = "new" | "prayed";

export type SalvationRow = {
  id: string
  created_at: string
  name: string
  email: string
  phone: string | null
  ministry_interest: string | null
  notes: string | null
  status: SalvationStatus
  follow_up_notes: string | null
  handled_at: string | null
};

export type PrayerRow = {
  id: string
  created_at: string
  name: string
  email: string | null
  phone: string | null
  request: string
  is_praise: boolean
  is_public: boolean
  approved_public: boolean
  status: PrayerStatus
  handled_at: string | null
};

// SALVATION DECISIONS
export const listSalvationDecisions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await (context.supabase as any)
      .from("salvation_decisions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as SalvationRow[];
  });

export const updateSalvationDecision = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["new", "contacted", "followed_up"]),
      follow_up_notes: z.string().max(2000).optional().nullable(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await (context.supabase as any)
      .from("salvation_decisions")
      .update({
        status: data.status,
        follow_up_notes: data.follow_up_notes || null,
        handled_by: data.status === "new" ? null : context.userId,
        handled_at: data.status === "new" ? null : new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSalvationDecision = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context, ["super_admin", "pastor"]);
    const { error } = await context.supabase.from("salvation_decisions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// PRAYER REQUESTS
export const listPrayerRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await (context.supabase as any)
      .from("prayer_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as PrayerRow[];
  });

export const updatePrayerRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["new", "prayed"]),
      approved_public: z.boolean(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await (context.supabase as any)
      .from("prayer_requests")
      .update({
        status: data.status,
        approved_public: data.approved_public,
        handled_by: data.status === "new" ? null : context.userId,
        handled_at: data.status === "new" ? null : new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePrayerRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context, ["super_admin", "pastor"]);
    const { error } = await context.supabase.from("prayer_requests").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// DASHBOARD
export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const db = context.supabase as any;
    const [events, photos, messagesNew, salvationNew, prayerNew, upcoming, recentMessages, recentSalvation, recentPrayer] = await Promise.all([
      db.from("events").select("id", { count: "exact", head: true }),
      db.from("site_images").select("slot", { count: "exact", head: true }).not("image_url", "is", null),
      db.from("contact_submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
      db.from("salvation_decisions").select("id", { count: "exact", head: true }).eq("status", "new"),
      db.from("prayer_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
      db.from("events").select("id,title,event_date,location").gte("event_date", new Date().toISOString()).order("event_date").limit(5),
      db.from("contact_submissions").select("id,name,subject,status,created_at").order("created_at", { ascending: false }).limit(5),
      db.from("salvation_decisions").select("id,name,ministry_interest,status,created_at").order("created_at", { ascending: false }).limit(5),
      db.from("prayer_requests").select("id,name,is_praise,status,created_at").order("created_at", { ascending: false }).limit(5),
    ]);
    return {
      totals: {
        events: events.count ?? 0,
        photos: photos.count ?? 0,
        messagesNew: messagesNew.count ?? 0,
        salvationNew: salvationNew.count ?? 0,
        prayerNew: prayerNew.count ?? 0,
      },
      upcoming: upcoming.data ?? [],
      recentMessages: recentMessages.data ?? [],
      recentSalvation: recentSalvation.data ?? [],
      recentPrayer: recentPrayer.data ?? [],
    };
  });