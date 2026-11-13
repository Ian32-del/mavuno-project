import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* Server functions for the Daily verse and Bible trivia admin pages */

type Role = "super_admin" | "pastor" | "ministry_leader";

async function ensureAdmin(ctx: { supabase: any; userId: string }, allowed?: Role[]) {
  const { data, error } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  const roles: Role[] = (data ?? []).map((r: any) => r.role);
  if (roles.length === 0) throw new Error("Forbidden");
  if (allowed && !roles.some((r) => allowed.includes(r))) throw new Error("Forbidden");
  return roles;
}

const FULL_ADMIN: Role[] = ["super_admin", "pastor"];

/* ---------- Daily verse ---------- */

export type VerseRow = {
  id: string
  verse_date: string
  reference: string
  verse_text: string
  challenge: string | null
};

export const listVerses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context, FULL_ADMIN);
    const { data, error } = await (context.supabase as any)
      .from("daily_verses")
      .select("*")
      .order("verse_date", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as VerseRow[];
  });

export const upsertVerse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      verse_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      reference: z.string().trim().min(1).max(80),
      verse_text: z.string().trim().min(1).max(1000),
      challenge: z.string().max(300).optional().nullable(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context, FULL_ADMIN);
    const row = {
      verse_date: data.verse_date,
      reference: data.reference,
      verse_text: data.verse_text,
      challenge: data.challenge?.trim() || null,
    };
    const db = context.supabase as any;
    const { error } = data.id
      ? await db.from("daily_verses").update(row).eq("id", data.id)
      : await db.from("daily_verses").insert(row);
    if (error) {
      if (error.code === "23505") throw new Error("There is already a verse for that date. Edit that one instead.");
      throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteVerse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context, FULL_ADMIN);
    const { error } = await (context.supabase as any).from("daily_verses").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- Trivia ---------- */

export type QuizRow = {
  id: string
  title: string
  description: string | null
  is_published: boolean
  created_at: string
  question_count: number
};

export type QuestionRow = {
  id: string
  quiz_id: string
  question: string
  options: string[]
  correct_index: number
  explanation: string | null
};

export const listQuizzes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context, FULL_ADMIN);
    const { data, error } = await (context.supabase as any)
      .from("trivia_quizzes")
      .select("*, trivia_questions(count)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((q: any) => ({
      id: q.id,
      title: q.title,
      description: q.description,
      is_published: q.is_published,
      created_at: q.created_at,
      question_count: q.trivia_questions?.[0]?.count ?? 0,
    })) as QuizRow[];
  });

export const upsertQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      title: z.string().trim().min(1).max(120),
      description: z.string().max(300).optional().nullable(),
      is_published: z.boolean(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context, FULL_ADMIN);
    const row = {
      title: data.title,
      description: data.description?.trim() || null,
      is_published: data.is_published,
    };
    const db = context.supabase as any;
    if (data.id) {
      const { error } = await db.from("trivia_quizzes").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: created, error } = await db.from("trivia_quizzes").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    return { id: created.id as string };
  });

export const deleteQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context, FULL_ADMIN);
    const { error } = await (context.supabase as any).from("trivia_quizzes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listQuestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context, FULL_ADMIN);
    const { data, error } = await (context.supabase as any)
      .from("trivia_questions")
      .select("*")
      .order("created_at");
    if (error) throw new Error(error.message);
    return (data ?? []) as QuestionRow[];
  });

export const upsertQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      quiz_id: z.string().uuid(),
      question: z.string().trim().min(1).max(300),
      options: z.array(z.string().trim().min(1).max(150)).min(2).max(4),
      correct_index: z.number().int().min(0).max(3),
      explanation: z.string().max(300).optional().nullable(),
    }).refine((v) => v.correct_index < v.options.length, { message: "Pick which answer is correct" }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context, FULL_ADMIN);
    const row = {
      quiz_id: data.quiz_id,
      question: data.question,
      options: data.options,
      correct_index: data.correct_index,
      explanation: data.explanation?.trim() || null,
    };
    const db = context.supabase as any;
    const { error } = data.id
      ? await db.from("trivia_questions").update(row).eq("id", data.id)
      : await db.from("trivia_questions").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context, FULL_ADMIN);
    const { error } = await (context.supabase as any).from("trivia_questions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });