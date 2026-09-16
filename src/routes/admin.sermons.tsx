import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listSermons, upsertSermon, deleteSermon } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "@/components/admin/upload";

export const Route = createFileRoute("/admin/sermons")({ component: SermonsPage });

function SermonsPage() {
  const list = useServerFn(listSermons);
  const del = useServerFn(deleteSermon);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-sermons"], queryFn: () => list() });
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-sermons"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Sermons</h1><p className="text-neutral-500">Publish sermons and attached resources.</p></div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-black"><Plus className="h-4 w-4 mr-2" /> New sermon</Button>
      </div>
      <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase tracking-wider">
          <tr><th className="text-left p-3">Title</th><th className="text-left p-3">Speaker</th><th className="text-left p-3">Date</th><th className="text-left p-3">Status</th><th className="p-3"></th></tr>
        </thead>
        <tbody>
          {data.map((s: any) => (
            <tr key={s.id} className="border-t border-neutral-100">
              <td className="p-3 font-medium">{s.title}</td>
              <td className="p-3 text-neutral-600">{s.speaker}</td>
              <td className="p-3 text-neutral-600">{s.sermon_date}</td>
              <td className="p-3"><span className={s.published ? "text-green-600" : "text-neutral-400"}>{s.published ? "Published" : "Draft"}</span></td>
              <td className="p-3 text-right whitespace-nowrap">
                <Button size="sm" variant="ghost" onClick={() => { setEditing(s); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => confirm("Delete sermon?") && remove.mutate(s.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </td>
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-neutral-500">No sermons yet.</td></tr>}
        </tbody>
      </table></div></Card>
      <SermonDialog open={open} setOpen={setOpen} editing={editing} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-sermons"] })} />
    </div>
  );
}

function SermonDialog({ open, setOpen, editing, onSaved }: any) {
  const save = useServerFn(upsertSermon);
  const defaults = (s: any) => ({
    id: s?.id, title: s?.title ?? "", speaker: s?.speaker ?? "",
    sermon_date: s?.sermon_date ?? new Date().toISOString().slice(0, 10),
    video_url: s?.video_url ?? "", notes: s?.notes ?? "",
    resource_urls: (s?.resource_urls ?? []) as string[], published: s?.published ?? true,
  });
  const [form, setForm] = useState(() => defaults(editing));
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setForm(defaults(editing)); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "Edit sermon" : "New sermon"}</DialogTitle></DialogHeader>
        <form onSubmit={async (e) => {
          e.preventDefault(); setBusy(true);
          try { await save({ data: form }); toast.success("Saved"); setOpen(false); onSaved(); }
          catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
        }} className="space-y-4">
          <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Speaker</Label><Input value={form.speaker} onChange={(e) => setForm({ ...form, speaker: e.target.value })} /></div>
            <div><Label>Date</Label><Input type="date" required value={form.sermon_date} onChange={(e) => setForm({ ...form, sermon_date: e.target.value })} /></div>
          </div>
          <div><Label>Video URL (YouTube, Vimeo…)</Label><Input type="url" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} /></div>
          <div><Label>Notes</Label><Textarea rows={5} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div>
            <Label>Downloadable resources</Label>
            <div className="space-y-1 mt-1">
              {form.resource_urls.map((u, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={u} onChange={(e) => { const n = [...form.resource_urls]; n[i] = e.target.value; setForm({ ...form, resource_urls: n }); }} />
                  <Button type="button" size="sm" variant="ghost" onClick={() => setForm({ ...form, resource_urls: form.resource_urls.filter((_, j) => j !== i) })}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setForm({ ...form, resource_urls: [...form.resource_urls, ""] })}>Add URL</Button>
              <FileUpload bucket="sermons" onUploaded={(url) => setForm({ ...form, resource_urls: [...form.resource_urls, url] })} label="Upload file" />
            </div>
          </div>
          <div className="flex items-center gap-3"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label>Published</Label></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={busy} className="bg-orange-500 hover:bg-orange-600 text-black">Save</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}