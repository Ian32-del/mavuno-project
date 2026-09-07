import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function getServerClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

const prayerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  request: z.string().trim().min(3).max(2000),
  is_praise: z.boolean().optional().default(false),
  is_public: z.boolean().optional().default(false),
});

export const submitPrayerRequest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => prayerSchema.parse(d))
  .handler(async ({ data }) => {
    const supabase = getServerClient();
    const { error } = await supabase.from("prayer_requests").insert({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      request: data.request,
      is_praise: data.is_praise ?? false,
      is_public: data.is_public ?? false,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const salvationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  ministry_interest: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const submitSalvationDecision = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => salvationSchema.parse(d))
  .handler(async ({ data }) => {
    const supabase = getServerClient();
    const { error } = await supabase.from("salvation_decisions").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      ministry_interest: data.ministry_interest || null,
      notes: data.notes || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const campSchema = z.object({
  camp_name: z.string().trim().min(1).max(200),
  full_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(30),
  age: z.number().int().min(10).max(99).optional(),
  ministry: z.string().max(100).optional().or(z.literal("")),
  emergency_contact: z.string().max(100).optional().or(z.literal("")),
  emergency_phone: z.string().max(30).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const submitCampRegistration = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => campSchema.parse(d))
  .handler(async ({ data }) => {
    const supabase = getServerClient();
    const { error } = await supabase.from("camp_registrations").insert({
      camp_name: data.camp_name,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      age: data.age ?? null,
      ministry: data.ministry || null,
      emergency_contact: data.emergency_contact || null,
      emergency_phone: data.emergency_phone || null,
      notes: data.notes || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(3).max(2000),
});

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    const supabase = getServerClient();
    const { error } = await supabase.from("contact_submissions").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const newsletterSchema = z.object({ email: z.string().trim().email().max(255) });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => newsletterSchema.parse(d))
  .handler(async ({ data }) => {
    const supabase = getServerClient();
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: data.email });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });