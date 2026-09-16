import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMedia, upsertMedia, deleteMedia } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "@/components/admin/upload";

export const Route = createFileRoute("/admin/media")({ component: MediaPage });

function MediaPage() {
  const list = useServerFn(listMedia);
  const del = useServerFn(deleteMedia);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-media"], queryFn: () => list() });
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-media"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = data.filter((m: any) => filter === "all" || m.ministry_slug === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div><h1 className="text-3xl font-bold">Media gallery</h1><p className="text-neutral-500">Images and videos organized by ministry.</p></div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ministries</SelectItem>
              <SelectItem value="myf">MYF</SelectItem>
              <SelectItem value="mya">MYA</SelectItem>
              <SelectItem value="campus">Campus</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-black"><Plus className="h-4 w-4 mr-2" /> Add media</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((m: any) => (
          <Card key={m.id} className="overflow-hidden group relative">
            <div className="aspect-square bg-neutral-100">
              {m.type === "image" ? (
                <img src={m.url} alt={m.title ?? ""} className="w-full h-full object-cover" />
              ) : (
                <video src={m.url} className="w-full h-full object-cover" muted />
              )}
            </div>
            <div className="p-2 text-xs">
              <div className="font-medium truncate">{m.title || "Untitled"}</div>
              <div className="text-neutral-500 uppercase tracking-wider">{m.ministry_slug || "—"} · {m.type}</div>
            </div>
            <Button size="sm" variant="destructive" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" onClick={() => confirm("Delete?") && remove.mutate(m.id)}><Trash2 className="h-3 w-3" /></Button>
          </Card>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center text-neutral-500 py-12">No media.</div>}
      </div>

      <MediaDialog open={open} setOpen={setOpen} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-media"] })} />
    </div>
  );
}

function MediaDialog({ open, setOpen, onSaved }: any) {
  const save = useServerFn(upsertMedia);
  const [form, setForm] = useState({ title: "", url: "", type: "image" as "image" | "video", ministry_slug: "" });
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setForm({ title: "", url: "", type: "image", ministry_slug: "" }); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add media</DialogTitle></DialogHeader>
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!form.url) return toast.error("Upload or paste a URL");
          setBusy(true);
          try { await save({ data: form }); toast.success("Saved"); setOpen(false); onSaved(); }
          catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
        }} className="space-y-4">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Type</Label>
              <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="image">Image</SelectItem><SelectItem value="video">Video</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Ministry</Label>
              <Select value={form.ministry_slug || "none"} onValueChange={(v) => setForm({ ...form, ministry_slug: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  <SelectItem value="myf">MYF</SelectItem>
                  <SelectItem value="mya">MYA</SelectItem>
                  <SelectItem value="campus">Campus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>File</Label>
            <div className="flex gap-2 mt-1">
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="URL or upload" />
              <FileUpload bucket="ministry-gallery" accept={form.type === "image" ? "image/*" : "video/*"} onUploaded={(url) => setForm({ ...form, url })} label="Upload" />
            </div>
            {form.url && form.type === "image" && <img src={form.url} className="mt-2 max-h-40 rounded" alt="" />}
          </div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={busy} className="bg-orange-500 hover:bg-orange-600 text-black">Save</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}