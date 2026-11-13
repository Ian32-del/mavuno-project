import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listVerses, upsertVerse, deleteVerse, type VerseRow } from "@/lib/admin.games.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/daily-verse")({ component: DailyVersePage });

function localDateKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function prettyDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-KE", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

function DailyVersePage() {
  const list = useServerFn(listVerses);
  const del = useServerFn(deleteVerse);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VerseRow | null>(null);
  const { data = [], isLoading, error } = useQuery({ queryKey: ["admin-verses"], queryFn: () => list() });

  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Verse removed"); qc.invalidateQueries({ queryKey: ["admin-verses"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const today = localDateKey();
  const upcoming = data.filter((v: VerseRow) => v.verse_date >= today).sort((a: VerseRow, b: VerseRow) => a.verse_date.localeCompare(b.verse_date));
  const past = data.filter((v: VerseRow) => v.verse_date < today);

  const row = (v: VerseRow) => (
    <Card key={v.id} className="flex flex-wrap items-start justify-between gap-4 p-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">{prettyDate(v.verse_date)}</span>
          {v.verse_date === today && <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-black">Today</span>}
        </div>
        <div className="mt-1 font-semibold text-orange-600">{v.reference}</div>
        <p className="mt-1 text-sm text-neutral-700">{v.verse_text}</p>
        {v.challenge && <p className="mt-2 text-sm text-neutral-500">Challenge: {v.challenge}</p>}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => { setEditing(v); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
        <Button size="sm" variant="ghost" onClick={() => confirm("Remove this verse?") && remove.mutate(v.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Daily verse</h1>
          <p className="text-neutral-500">Schedule the verse and challenge for any day. On days with nothing scheduled, the website shows a built-in verse.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-orange-500 text-black hover:bg-orange-600">
          <Plus className="mr-2 h-4 w-4" /> Add verse
        </Button>
      </div>

      {isLoading && <p className="text-neutral-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">Could not load verses. Run games.sql in Supabase first. ({(error as Error).message})</p>}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Today and upcoming</h2>
        {upcoming.length === 0 && !isLoading && <p className="text-sm text-neutral-500">Nothing scheduled. The built-in verse will show.</p>}
        {upcoming.map(row)}
      </section>

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Past</h2>
          {past.map(row)}
        </section>
      )}

      <VerseDialog open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function VerseDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: VerseRow | null }) {
  const save = useServerFn(upsertVerse);
  const qc = useQueryClient();
  const [form, setForm] = useState({ verse_date: "", reference: "", verse_text: "", challenge: "" });

  useEffect(() => {
    if (!open) return;
    setForm({
      verse_date: editing?.verse_date ?? localDateKey(1),
      reference: editing?.reference ?? "",
      verse_text: editing?.verse_text ?? "",
      challenge: editing?.challenge ?? "",
    });
  }, [open, editing]);

  const mutation = useMutation({
    mutationFn: () => save({ data: { id: editing?.id, ...form, challenge: form.challenge || null } }),
    onSuccess: () => {
      toast.success(editing ? "Verse updated" : "Verse scheduled");
      qc.invalidateQueries({ queryKey: ["admin-verses"] });
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Edit verse" : "Add verse"}</DialogTitle></DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
        >
          <div>
            <Label>Date it shows</Label>
            <Input type="date" required value={form.verse_date} onChange={(e) => setForm({ ...form, verse_date: e.target.value })} />
          </div>
          <div>
            <Label>Reference</Label>
            <Input required placeholder="Joshua 1:9" maxLength={80} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
          </div>
          <div>
            <Label>Verse</Label>
            <Textarea required rows={4} maxLength={1000} value={form.verse_text} onChange={(e) => setForm({ ...form, verse_text: e.target.value })} />
          </div>
          <div>
            <Label>Today's challenge (optional)</Label>
            <Input maxLength={300} placeholder="One small action for the day" value={form.challenge} onChange={(e) => setForm({ ...form, challenge: e.target.value })} />
          </div>
          <Button type="submit" disabled={mutation.isPending} className="w-full bg-orange-500 text-black hover:bg-orange-600">
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}