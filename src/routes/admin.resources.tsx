import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listResources, upsertResource, deleteResource } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "@/components/admin/upload";

export const Route = createFileRoute("/admin/resources")({ component: ResourcesPage });

function ResourcesPage() {
  const list = useServerFn(listResources);
  const del = useServerFn(deleteResource);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-resources"], queryFn: () => list() });
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-resources"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Resources & FAQ</h1><p className="text-neutral-500">Documents, downloads and frequently asked questions.</p></div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-black"><Plus className="h-4 w-4 mr-2" /> New</Button>
      </div>
      <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase tracking-wider">
          <tr><th className="text-left p-3">Title</th><th className="text-left p-3">Type</th><th className="text-left p-3">Category</th><th className="text-left p-3">Status</th><th className="p-3"></th></tr>
        </thead>
        <tbody>
          {data.map((r: any) => (
            <tr key={r.id} className="border-t border-neutral-100">
              <td className="p-3 font-medium">{r.title}</td>
              <td className="p-3 text-neutral-600 uppercase text-xs">{r.type}</td>
              <td className="p-3 text-neutral-600">{r.category || "—"}</td>
              <td className="p-3"><span className={r.published ? "text-green-600" : "text-neutral-400"}>{r.published ? "Published" : "Draft"}</span></td>
              <td className="p-3 text-right whitespace-nowrap">
                <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => confirm("Delete?") && remove.mutate(r.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </td>
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-neutral-500">No resources yet.</td></tr>}
        </tbody>
      </table></div></Card>
      <ResourceDialog open={open} setOpen={setOpen} editing={editing} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-resources"] })} />
    </div>
  );
}

function ResourceDialog({ open, setOpen, editing, onSaved }: any) {
  const save = useServerFn(upsertResource);
  const defaults = (r: any) => ({
    id: r?.id, title: r?.title ?? "", description: r?.description ?? "",
    type: (r?.type ?? "pdf") as "pdf" | "doc" | "faq" | "link",
    file_url: r?.file_url ?? "", faq_answer: r?.faq_answer ?? "",
    category: r?.category ?? "", published: r?.published ?? true,
  });
  const [form, setForm] = useState(() => defaults(editing));
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setForm(defaults(editing)); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "Edit resource" : "New resource"}</DialogTitle></DialogHeader>
        <form onSubmit={async (e) => {
          e.preventDefault(); setBusy(true);
          try { await save({ data: form }); toast.success("Saved"); setOpen(false); onSaved(); }
          catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
        }} className="space-y-4">
          <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Type</Label>
              <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="doc">Document</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="faq">FAQ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          </div>
          <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          {form.type === "faq" ? (
            <div><Label>Answer</Label><Textarea rows={5} value={form.faq_answer} onChange={(e) => setForm({ ...form, faq_answer: e.target.value })} /></div>
          ) : (
            <div>
              <Label>File URL</Label>
              <div className="flex gap-2 mt-1">
                <Input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} />
                <FileUpload bucket="resources" onUploaded={(url) => setForm({ ...form, file_url: url })} label="Upload" />
              </div>
            </div>
          )}
          <div className="flex items-center gap-3"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label>Published</Label></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={busy} className="bg-orange-500 hover:bg-orange-600 text-black">Save</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}