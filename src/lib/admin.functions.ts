import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Role = "super_admin" | "pastor" | "ministry_leader";

async function ensureAdmin(ctx: { supabase: any; userId: string }, allowed?: Role[]) {
  const { data, error } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  const roles: Role[] = (data ?? []).map((r: any) => r.role);
  if (roles.length === 0) throw new Error("Forbidden");
  if (allowed && !roles.some((r) => allowed.includes(r))) throw new Error("Forbidden");
  return roles;
}

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ set' : '❌ missing');
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { roles: (data ?? []).map((r: any) => r.role) as Role[], userId: context.userId };
  });
  
export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const [events, media, sermons, resources, upcoming, recentMedia] = await Promise.all([
      context.supabase.from("events").select("id", { count: "exact", head: true }),
      context.supabase.from("media").select("id", { count: "exact", head: true }),
      context.supabase.from("sermons").select("id", { count: "exact", head: true }),
      context.supabase.from("resources").select("id", { count: "exact", head: true }),
      context.supabase.from("events").select("id,title,event_date,location").gte("event_date", new Date().toISOString()).order("event_date").limit(5),
      context.supabase.from("media").select("id,title,url,type,created_at").order("created_at", { ascending: false }).limit(6),
    ]);
    return {
      totals: {
        events: events.count ?? 0,
        media: media.count ?? 0,
        sermons: sermons.count ?? 0,
        resources: resources.count ?? 0,
      },
      upcoming: upcoming.data ?? [],
      recentMedia: recentMedia.data ?? [],
    };
  });

// EVENTS
const eventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  event_date: z.string().min(1),
  location: z.string().max(300).optional().nullable(),
  registration_url: z.string().url().max(500).optional().nullable().or(z.literal("")),
  image_url: z.string().max(500).optional().nullable().or(z.literal("")),
  ministry_slug: z.string().max(50).optional().nullable(),
  published: z.boolean().optional().default(true),
});

export const listEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase.from("events").select("*").order("event_date", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => eventSchema.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const row = {
      title: data.title,
      description: data.description || null,
      event_date: data.event_date,
      location: data.location || null,
      registration_url: data.registration_url || null,
      image_url: data.image_url || null,
      ministry_slug: data.ministry_slug || null,
      published: data.published ?? true,
      created_by: context.userId,
    };
    if (data.id) {
      const { error } = await context.supabase.from("events").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("events").insert(row);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("events").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// SERMONS
const sermonSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  speaker: z.string().max(150).optional().nullable(),
  sermon_date: z.string().min(1),
  video_url: z.string().max(500).optional().nullable().or(z.literal("")),
  notes: z.string().max(10000).optional().nullable(),
  resource_urls: z.array(z.string()).optional().default([]),
  published: z.boolean().optional().default(true),
});

export const listSermons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context, ["super_admin", "pastor"]);
    const { data, error } = await context.supabase.from("sermons").select("*").order("sermon_date", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertSermon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => sermonSchema.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context, ["super_admin", "pastor"]);
    const row = {
      title: data.title,
      speaker: data.speaker || null,
      sermon_date: data.sermon_date,
      video_url: data.video_url || null,
      notes: data.notes || null,
      resource_urls: data.resource_urls ?? [],
      published: data.published ?? true,
      created_by: context.userId,
    };
    if (data.id) {
      const { error } = await context.supabase.from("sermons").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("sermons").insert(row);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteSermon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context, ["super_admin", "pastor"]);
    const { error } = await context.supabase.from("sermons").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// RESOURCES
const resourceSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(["pdf", "doc", "faq", "link"]),
  file_url: z.string().max(500).optional().nullable().or(z.literal("")),
  faq_answer: z.string().max(5000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  published: z.boolean().optional().default(true),
});

export const listResources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context, ["super_admin", "pastor"]);
    const { data, error } = await context.supabase.from("resources").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => resourceSchema.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context, ["super_admin", "pastor"]);
    const row = {
      title: data.title,
      description: data.description || null,
      type: data.type,
      file_url: data.file_url || null,
      faq_answer: data.faq_answer || null,
      category: data.category || null,
      published: data.published ?? true,
      created_by: context.userId,
    };
    if (data.id) {
      const { error } = await context.supabase.from("resources").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("resources").insert(row);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context, ["super_admin", "pastor"]);
    const { error } = await context.supabase.from("resources").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// MEDIA
const mediaSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().max(200).optional().nullable(),
  url: z.string().min(1).max(500),
  type: z.enum(["image", "video"]),
  ministry_slug: z.string().max(50).optional().nullable(),
  event_id: z.string().uuid().optional().nullable(),
});

export const listMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase.from("media").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => mediaSchema.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const row = {
      title: data.title || null,
      url: data.url,
      type: data.type,
      ministry_slug: data.ministry_slug || null,
      event_id: data.event_id || null,
      uploaded_by: context.userId,
    };
    if (data.id) {
      const { error } = await context.supabase.from("media").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("media").insert(row);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("media").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// MINISTRIES
const ministrySchema = z.object({
  slug: z.string().min(1).max(50),
  name: z.string().min(1).max(150),
  description: z.string().max(5000).optional().nullable(),
  leader_name: z.string().max(150).optional().nullable(),
  leader_bio: z.string().max(2000).optional().nullable(),
  leader_photo_url: z.string().max(500).optional().nullable().or(z.literal("")),
  hero_image_url: z.string().max(500).optional().nullable().or(z.literal("")),
  meet_time: z.string().max(200).optional().nullable(),
  meet_location: z.string().max(300).optional().nullable(),
});

export const listMinistries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase.from("ministries").select("*").order("slug");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateMinistry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => ministrySchema.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("ministries").update({
      name: data.name,
      description: data.description || null,
      leader_name: data.leader_name || null,
      leader_bio: data.leader_bio || null,
      leader_photo_url: data.leader_photo_url || null,
      hero_image_url: data.hero_image_url || null,
      meet_time: data.meet_time || null,
      meet_location: data.meet_location || null,
    }).eq("slug", data.slug);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// USERS (super_admin only)
export const listUsersWithRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context, ["super_admin"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: userList, error: uErr } = await supabaseAdmin.auth.admin.listUsers();
    if (uErr) throw new Error(uErr.message);
    const { data: rolesData } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const byUser = new Map<string, string[]>();
    (rolesData ?? []).forEach((r: any) => {
      const arr = byUser.get(r.user_id) ?? [];
      arr.push(r.role);
      byUser.set(r.user_id, arr);
    });
    return (userList.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? "",
      created_at: u.created_at,
      roles: byUser.get(u.id) ?? [],
    }));
  });

export const inviteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({
      email: z.string().email(),
      role: z.enum(["super_admin", "pastor", "ministry_leader"]),
      password: z.string().min(8).max(100),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context, ["super_admin"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    if (!created.user) throw new Error("User not created");
    const { error: rErr } = await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: data.role });
    if (rErr) throw new Error(rErr.message);
    return { ok: true, userId: created.user.id };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({
      userId: z.string().uuid(),
      role: z.enum(["super_admin", "pastor", "ministry_leader"]),
      grant: z.boolean(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context, ["super_admin"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.grant) {
      const { error } = await supabaseAdmin.from("user_roles").upsert({ user_id: data.userId, role: data.role });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context, ["super_admin"]);
    if (data.userId === context.userId) throw new Error("You cannot delete yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// STORAGE — create signed upload URL then client uploads directly
export const createUploadPath = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({
      bucket: z.enum(["event-images", "ministry-gallery", "sermons", "resources"]),
      filename: z.string().min(1).max(200),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const ext = data.filename.split(".").pop() || "bin";
    const path = `${context.userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { data: signed, error } = await context.supabase.storage.from(data.bucket).createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    const { data: pub } = context.supabase.storage.from(data.bucket).getPublicUrl(path);
    return { path, token: signed.token, signedUrl: signed.signedUrl, publicUrl: pub.publicUrl };
  });