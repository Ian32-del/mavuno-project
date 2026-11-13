import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Check, RotateCcw, Share2, Trophy, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/trivia")({
  head: () => ({
    meta: [
      { title: "Bible Trivia | Mavuno Youth" },
      { name: "description", content: "Test your Bible knowledge with Mavuno Youth trivia, then challenge your friends." },
      { property: "og:title", content: "Bible Trivia" },
      { property: "og:url", content: "/trivia" },
    ],
    links: [{ rel: "canonical", href: "/trivia" }],
  }),
  component: TriviaPage,
});

type Quiz = { id: string; title: string; description: string | null };
type Question = { id: string; question: string; options: string[]; correct_index: number; explanation: string | null };
/* A question ready to play: options shuffled, and the right answer tracked */
type Playable = { id: string; question: string; options: string[]; correct: number; explanation: string | null };

const QUESTIONS_PER_GAME = 10;

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function prepare(rows: Question[]): Playable[] {
  return shuffle(rows)
    .slice(0, QUESTIONS_PER_GAME)
    .map((q) => {
      const order = shuffle(q.options.map((text, i) => ({ text, right: i === q.correct_index })));
      return {
        id: q.id,
        question: q.question,
        options: order.map((o) => o.text),
        correct: order.findIndex((o) => o.right),
        explanation: q.explanation,
      };
    });
}

function TriviaPage() {
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Playable[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  useEffect(() => {
    (supabase as any)
      .from("trivia_quizzes")
      .select("id,title,description")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .then(({ data }: { data: Quiz[] | null }) => setQuizzes(data ?? []));
  }, []);

  async function start(q: Quiz) {
    setLoadingQuiz(true);
    const { data, error } = await (supabase as any)
      .from("trivia_questions")
      .select("id,question,options,correct_index,explanation")
      .eq("quiz_id", q.id);
    setLoadingQuiz(false);
    if (error || !data || data.length === 0) {
      toast.error("This quiz has no questions yet");
      return;
    }
    setQuestions(prepare(data as Question[]));
    setQuiz(q);
  }

  function replay() {
    if (quiz) start(quiz);
  }

  return (
    <>
      <section className="bg-ink pb-16 pt-28 text-ink-foreground">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">Mavuno Youth</p>
          <h1 className="text-display mt-3 text-5xl sm:text-6xl">Bible trivia</h1>
          <p className="mt-4 text-lg text-white/75">How well do you know the Word? Play, learn and challenge your friends.</p>
        </div>
      </section>

      <section className="bg-background py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {!quiz && (
            <QuizPicker quizzes={quizzes} loading={loadingQuiz} onPick={start} />
          )}
          {quiz && (
            <Game
              key={questions.map((q) => q.id).join("")}
              quiz={quiz}
              questions={questions}
              onReplay={replay}
              onPickAnother={() => setQuiz(null)}
            />
          )}
        </div>
      </section>
    </>
  );
}

function QuizPicker({ quizzes, loading, onPick }: { quizzes: Quiz[] | null; loading: boolean; onPick: (q: Quiz) => void }) {
  if (quizzes === null) return <p className="text-muted-foreground">Loading quizzes...</p>;
  if (quizzes.length === 0) return <p className="py-10 text-center text-muted-foreground">No quizzes yet. Check back soon.</p>;
  return (
    <div className="space-y-4">
      <h2 className="text-display text-3xl">Pick a quiz</h2>
      {quizzes.map((q) => (
        <button
          key={q.id}
          type="button"
          disabled={loading}
          onClick={() => onPick(q)}
          className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 text-left transition hover:border-brand"
        >
          <div>
            <div className="text-xl font-semibold">{q.title}</div>
            {q.description && <div className="mt-1 text-sm text-muted-foreground">{q.description}</div>}
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-brand transition group-hover:translate-x-1" />
        </button>
      ))}
    </div>
  );
}

function Game({
  quiz, questions, onReplay, onPickAnother,
}: { quiz: Quiz; questions: Playable[]; onReplay: () => void; onPickAnother: () => void }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = questions.length;
  const q = questions[index];

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correct) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 >= total) {
      setFinished(true);
    } else {
      setIndex(index + 1);
      setPicked(null);
    }
  }

  async function share() {
    const url = `${window.location.origin}/trivia`;
    const text = `I scored ${score}/${total} on the Mavuno Youth Bible trivia. Can you beat me?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Mavuno Youth Bible Trivia", text, url });
        return;
      }
    } catch {
      return; // the person closed the share sheet
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast.success("Copied. Paste it to a friend.");
    } catch {
      toast.error("Could not copy. Please share the link manually.");
    }
  }

  if (finished) {
    const pct = score / total;
    const message =
      pct === 1 ? "Perfect score. You really know your Bible."
      : pct >= 0.7 ? "Great job. You know the Word well."
      : pct >= 0.4 ? "Good effort. Keep reading and try again."
      : "Every expert started here. Play again and see how much you grow.";
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center sm:p-12">
        <Trophy className="mx-auto h-12 w-12 text-brand" />
        <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">{quiz.title}</p>
        <div className="text-display mt-2 text-7xl text-brand">{score}<span className="text-4xl text-muted-foreground"> / {total}</span></div>
        <p className="mt-4 text-lg">{message}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={share} className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 font-semibold text-brand-foreground shadow-glow transition hover:brightness-110">
            <Share2 className="h-4 w-4" /> Share my score
          </button>
          <button type="button" onClick={onReplay} className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 font-semibold hover:border-brand">
            <RotateCcw className="h-4 w-4" /> Play again
          </button>
          <button type="button" onClick={onPickAnother} className="inline-flex items-center gap-2 rounded-md px-6 py-3 font-semibold text-muted-foreground hover:text-foreground">
            Other quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
        <span>Question {index + 1} of {total}</span>
        <span>Score {score}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${((index + (picked !== null ? 1 : 0)) / total) * 100}%` }} />
      </div>

      <h2 className="mt-8 text-2xl font-semibold leading-snug sm:text-3xl">{q.question}</h2>

      <div className="mt-6 space-y-3">
        {q.options.map((opt, i) => {
          const isRight = picked !== null && i === q.correct;
          const isWrong = picked !== null && i === picked && i !== q.correct;
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              disabled={picked !== null}
              className={[
                "flex w-full items-center justify-between gap-3 rounded-xl border-2 p-4 text-left font-medium transition",
                picked === null ? "border-border bg-card hover:border-brand" : "",
                isRight ? "border-emerald-500 bg-emerald-500/10" : "",
                isWrong ? "border-red-500 bg-red-500/10" : "",
                picked !== null && !isRight && !isWrong ? "border-border bg-card opacity-60" : "",
              ].join(" ")}
            >
              <span>{opt}</span>
              {isRight && <Check className="h-5 w-5 shrink-0 text-emerald-500" />}
              {isWrong && <X className="h-5 w-5 shrink-0 text-red-500" />}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-6">
          <p className="font-semibold">{picked === q.correct ? "Correct!" : "Not quite."}</p>
          {q.explanation && <p className="mt-1 text-muted-foreground">{q.explanation}</p>}
          <button type="button" onClick={next} className="mt-5 inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 font-semibold text-brand-foreground shadow-glow transition hover:brightness-110">
            {index + 1 >= total ? "See my score" : "Next question"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}