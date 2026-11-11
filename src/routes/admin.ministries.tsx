import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listLeaders, upsertLeader, deleteLeader, type LeaderRow } from "@/lib/admin.leaders.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "@/components/admin/upload";

export const Route = createFileRoute("/admin/ministries")({ component: MinistriesPage });

const MINISTRIES = [
  { slug: "myf", name: "MYF" },
  { slug: "mya", name: "MYA" },
  { slug: "campus", name: "Campus" },
] as const;

type Slug = (typeof MINISTRIES)[number]["slug"];

function MinistriesPage() {
  const list = useServerFn(listLeaders);
  const { data = [], isLoading, error } = useQuery({ queryKey: ["admin-leaders"], queryFn: () => list() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ministry leaders</h1>
        <p className="text-neutral-500">Add or remove the leaders shown on each ministry page. Change the ministry photos under Featured photos.</p>
      </div>
      {isLoading && <p className="text-neutral-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">Could not load leaders. Run ministry_leaders.sql in Supabase first. ({(error as Error).message})</p>}
      <Tabs defaultValue="myf">
        <TabsList>{MINISTRIES.map((m) => <TabsTrigger key={m.slug} value={m.slug}>{m.name}</TabsTrigger>)}</TabsList>
        {MINISTRIES.map((m) => (
          <TabsContent key={m.slug} value={m.slug}>
            <LeadersTab slug={m.slug} leaders={data.filter((l: LeaderRow) => l.ministry_slug === m.slug)} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function LeadersTab({ slug, leaders }: { slug: Slug; leaders: LeaderRow[] }) {
  const del = useServerFn(deleteLeader);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LeaderRow | null>(null);

  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Leader removed"); qc.invalidateQueries({ queryKey: ["admin-leaders"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4 pt-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-orange-500 text-black hover:bg-orange-600">
          <Plus className="mr-2 h-4 w-4" /> Add leader
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {leaders.map((l) => (
          <Card key={l.id} className="flex items-start gap-4 p-4">
            {l.photo_url ? (
              <img src={l.photo_url} alt={l.name} className="h-16 w-16 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-lg font-bold text-neutral-500">
                {l.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{l.name}</div>
              {l.role && <div className="text-sm text-orange-600">{l.role}</div>}
              {l.bio && <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{l.bio}</p>}
            </div>
            <div className="flex shrink-0 flex-col">
              <Button size="sm" variant="ghost" onClick={() => { setEditing(l); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => confirm(`Remove ${l.name}?`) && remove.mutate(l.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </Card>
        ))}
        {leaders.length === 0 && <div className="col-span-full py-12 text-center text-neutral-500">No leaders added yet.</div>}
      </div>

      <LeaderDialog
        open={open}
        setOpen={setOpen}
        slug={slug}
        editing={editing}
        onSaved={() => qc.invalidateQueries({ queryKey: ["admin-leaders"] })}
      />
    </div>
  );
}

function LeaderDialog({ open, setOpen, slug, editing, onSaved }: { open: boolean; setOpen: (v: boolean) => void; slug: Slug; editing: LeaderRow | null; onSaved: () => void }) {
  const save = useServerFn(upsertLeader);
  const defaults = (l: LeaderRow | null) => ({
    id: l?.id,
    name: l?.name ?? "",
    role: l?.role ?? "",
    bio: l?.bio ?? "",
    photo_url: l?.photo_url ?? "",
  });
  const [form, setForm] = useState(() => defaults(editing));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setForm(defaults(editing));
  }, [open, editing]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{editing ? "Edit leader" : "Add leader"}</DialogTitle></DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await save({ data: { ...form, ministry_slug: slug } });
              toast.success("Saved");
              setOpen(false);
              onSaved();
            } catch (err: any) { toast.error(err.message); }
            finally { setBusy(false); }
          }}
          className="space-y-4"
        >
          <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Role</Label><Input placeholder="Pastor, Coordinator, Worship lead" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
          <div><Label>Short bio (optional)</Label><Textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
          <div>
            <Label>Photo</Label>
            {form.photo_url && <img src={form.photo_url} alt="" className="mt-2 h-20 w-20 rounded-full object-cover" />}
            <div className="mt-2 flex gap-2">
              <Input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="URL or upload" />
              <FileUpload bucket="ministry-gallery" accept="image/*" label="Upload" onUploaded={(url) => setForm({ ...form, photo_url: url })} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={busy} className="bg-orange-500 text-black hover:bg-orange-600">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}