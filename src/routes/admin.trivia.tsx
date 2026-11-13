import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listQuizzes, upsertQuiz, deleteQuiz, listQuestions, upsertQuestion, deleteQuestion,
  type QuizRow, type QuestionRow,
} from "@/lib/admin.games.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/trivia")({ component: TriviaAdminPage });

function TriviaAdminPage() {
  const listQ = useServerFn(listQuizzes);
  const listQs = useServerFn(listQuestions);
  const saveQuiz = useServerFn(upsertQuiz);
  const delQuiz = useServerFn(deleteQuiz);
  const delQuestion = useServerFn(deleteQuestion);
  const qc = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quizDialog, setQuizDialog] = useState<{ open: boolean; editing: QuizRow | null }>({ open: false, editing: null });
  const [questionDialog, setQuestionDialog] = useState<{ open: boolean; editing: QuestionRow | null }>({ open: false, editing: null });

  const quizzes = useQuery({ queryKey: ["admin-quizzes"], queryFn: () => listQ() });
  const questions = useQuery({ queryKey: ["admin-questions"], queryFn: () => listQs() });

  const quizList: QuizRow[] = quizzes.data ?? [];
  const selected = quizList.find((q) => q.id === selectedId) ?? quizList[0] ?? null;
  const selectedQuestions: QuestionRow[] = (questions.data ?? []).filter((q: QuestionRow) => q.quiz_id === selected?.id);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-quizzes"] });
    qc.invalidateQueries({ queryKey: ["admin-questions"] });
  };

  const togglePublish = useMutation({
    mutationFn: (q: QuizRow) => saveQuiz({ data: { id: q.id, title: q.title, description: q.description, is_published: !q.is_published } }),
    onSuccess: (_r, q) => { toast.success(q.is_published ? "Quiz hidden from the website" : "Quiz is live on the website"); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  const removeQuiz = useMutation({
    mutationFn: (id: string) => delQuiz({ data: { id } }),
    onSuccess: () => { toast.success("Quiz deleted"); setSelectedId(null); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  const removeQuestion = useMutation({
    mutationFn: (id: string) => delQuestion({ data: { id } }),
    onSuccess: () => { toast.success("Question deleted"); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bible trivia</h1>
          <p className="text-neutral-500">Create quizzes for camp, a sermon series or just for fun. Only published quizzes show on the website.</p>
        </div>
        <Button onClick={() => setQuizDialog({ open: true, editing: null })} className="bg-orange-500 text-black hover:bg-orange-600">
          <Plus className="mr-2 h-4 w-4" /> New quiz
        </Button>
      </div>

      {quizzes.isLoading && <p className="text-neutral-500">Loading...</p>}
      {quizzes.error && <p className="text-sm text-red-600">Could not load quizzes. Run games.sql in Supabase first. ({(quizzes.error as Error).message})</p>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {quizList.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => setSelectedId(q.id)}
            className={`rounded-lg border p-4 text-left transition ${selected?.id === q.id ? "border-orange-500 bg-orange-50" : "border-neutral-200 bg-white hover:border-neutral-400"}`}
          >
            <div className="font-semibold">{q.title}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
              <span>{q.question_count} question{q.question_count === 1 ? "" : "s"}</span>
              <span className={`rounded-full px-2 py-0.5 font-semibold ${q.is_published ? "bg-green-100 text-green-700" : "bg-neutral-200 text-neutral-600"}`}>
                {q.is_published ? "Published" : "Draft"}
              </span>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <Card className="space-y-5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{selected.title}</h2>
              {selected.description && <p className="text-sm text-neutral-500">{selected.description}</p>}
              <p className="mt-1 text-xs text-neutral-500">Players get up to 10 random questions from this quiz. Add 10 or more for variety.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={togglePublish.isPending} onClick={() => togglePublish.mutate(selected)}>
                {selected.is_published ? <><EyeOff className="mr-1 h-4 w-4" /> Unpublish</> : <><Eye className="mr-1 h-4 w-4" /> Publish</>}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setQuizDialog({ open: true, editing: selected })}>
                <Pencil className="mr-1 h-4 w-4" /> Rename
              </Button>
              <Button size="sm" variant="ghost" onClick={() => confirm("Delete this quiz and all its questions?") && removeQuiz.mutate(selected.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="sm" onClick={() => setQuestionDialog({ open: true, editing: null })} className="bg-orange-500 text-black hover:bg-orange-600">
              <Plus className="mr-1 h-4 w-4" /> Add question
            </Button>
          </div>

          {selectedQuestions.length === 0 && <p className="py-6 text-center text-sm text-neutral-500">No questions yet. Add your first one.</p>}

          <ol className="space-y-3">
            {selectedQuestions.map((q, n) => (
              <li key={q.id} className="rounded-lg border border-neutral-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{n + 1}. {q.question}</div>
                    <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                      {q.options.map((o, i) => (
                        <li key={i} className={`flex items-center gap-1 ${i === q.correct_index ? "font-semibold text-green-700" : "text-neutral-600"}`}>
                          {i === q.correct_index ? <Check className="h-4 w-4" /> : <span className="w-4" />} {o}
                        </li>
                      ))}
                    </ul>
                    {q.explanation && <p className="mt-2 text-xs text-neutral-500">{q.explanation}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setQuestionDialog({ open: true, editing: q })}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => confirm("Delete this question?") && removeQuestion.mutate(q.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      <QuizDialog
        open={quizDialog.open}
        editing={quizDialog.editing}
        onOpenChange={(o) => setQuizDialog((s) => ({ ...s, open: o }))}
        onSaved={(id) => { setSelectedId(id); refresh(); }}
      />
      {selected && (
        <QuestionDialog
          open={questionDialog.open}
          editing={questionDialog.editing}
          quizId={selected.id}
          onOpenChange={(o) => setQuestionDialog((s) => ({ ...s, open: o }))}
          onSaved={refresh}
        />
      )}
    </div>
  );
}

function QuizDialog({
  open, onOpenChange, editing, onSaved,
}: { open: boolean; onOpenChange: (o: boolean) => void; editing: QuizRow | null; onSaved: (id: string) => void }) {
  const save = useServerFn(upsertQuiz);
  const [form, setForm] = useState({ title: "", description: "" });

  useEffect(() => {
    if (!open) return;
    setForm({ title: editing?.title ?? "", description: editing?.description ?? "" });
  }, [open, editing]);

  const mutation = useMutation({
    mutationFn: () =>
      save({ data: { id: editing?.id, title: form.title, description: form.description || null, is_published: editing?.is_published ?? false } }),
    onSuccess: (r) => {
      toast.success(editing ? "Quiz updated" : "Quiz created as a draft. Add questions, then publish.");
      onSaved(r.id);
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Rename quiz" : "New quiz"}</DialogTitle></DialogHeader>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
          <div>
            <Label>Title</Label>
            <Input required maxLength={120} placeholder="Camp Fearless 2026" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>Short description (optional)</Label>
            <Input maxLength={300} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <Button type="submit" disabled={mutation.isPending} className="w-full bg-orange-500 text-black hover:bg-orange-600">
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function QuestionDialog({
  open, onOpenChange, editing, quizId, onSaved,
}: { open: boolean; onOpenChange: (o: boolean) => void; editing: QuestionRow | null; quizId: string; onSaved: () => void }) {
  const save = useServerFn(upsertQuestion);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuestion(editing?.question ?? "");
    const opts = [...(editing?.options ?? [])];
    while (opts.length < 4) opts.push("");
    setOptions(opts);
    setCorrect(editing?.correct_index ?? 0);
    setExplanation(editing?.explanation ?? "");
  }, [open, editing]);

  const mutation = useMutation({
    mutationFn: () => {
      // Keep only filled answers, and move the "correct" marker with them
      const kept = options.map((text, i) => ({ text: text.trim(), i })).filter((o) => o.text);
      if (kept.length < 2) throw new Error("Add at least two answers");
      const newIndex = kept.findIndex((o) => o.i === correct);
      if (newIndex === -1) throw new Error("The correct answer cannot be empty");
      return save({
        data: {
          id: editing?.id,
          quiz_id: quizId,
          question,
          options: kept.map((o) => o.text),
          correct_index: newIndex,
          explanation: explanation || null,
        },
      });
    },
    onSuccess: () => {
      toast.success(editing ? "Question updated" : "Question added");
      onSaved();
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "Edit question" : "Add question"}</DialogTitle></DialogHeader>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
          <div>
            <Label>Question</Label>
            <Textarea required rows={2} maxLength={300} value={question} onChange={(e) => setQuestion(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Answers (2 to 4). Tick the correct one.</Label>
            {options.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct"
                  aria-label={`Answer ${i + 1} is correct`}
                  checked={correct === i}
                  onChange={() => setCorrect(i)}
                  className="h-4 w-4 accent-orange-500"
                />
                <Input maxLength={150} placeholder={`Answer ${i + 1}${i < 2 ? "" : " (optional)"}`} value={o} onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value : x)))} />
              </div>
            ))}
          </div>
          <div>
            <Label>Explanation shown after answering (optional)</Label>
            <Input maxLength={300} placeholder="Genesis 6" value={explanation} onChange={(e) => setExplanation(e.target.value)} />
          </div>
          <Button type="submit" disabled={mutation.isPending} className="w-full bg-orange-500 text-black hover:bg-orange-600">
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}