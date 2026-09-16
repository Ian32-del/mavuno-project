import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listEvents, upsertEvent, deleteEvent } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "@/components/admin/upload";

export const Route = createFileRoute("/admin/events")({ component: EventsPage });

function EventsPage() {
  const list = useServerFn(listEvents);
  const del = useServerFn(deleteEvent);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-events"], queryFn: () => list() });
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-events"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-neutral-500">Create and manage church events.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-black">
          <Plus className="h-4 w-4 mr-2" /> New event
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Location</th>
                <th className="text-left p-3">Ministry</th>
                <th className="text-left p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((e: any) => (
                <tr key={e.id} className="border-t border-neutral-100">
                  <td className="p-3 font-medium">{e.title}</td>
                  <td className="p-3 text-neutral-600">{new Date(e.event_date).toLocaleString()}</td>
                  <td className="p-3 text-neutral-600">{e.location}</td>
                  <td className="p-3 text-neutral-600">{e.ministry_slug || "—"}</td>
                  <td className="p-3"><span className={e.published ? "text-green-600" : "text-neutral-400"}>{e.published ? "Published" : "Draft"}</span></td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(e); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => confirm("Delete this event?") && remove.mutate(e.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-neutral-500">No events yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <EventDialog open={open} setOpen={setOpen} editing={editing} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-events"] })} />
    </div>
  );
}

function EventDialog({ open, setOpen, editing, onSaved }: any) {
  const save = useServerFn(upsertEvent);
  const [form, setForm] = useState(() => defaults(editing));
  const [busy, setBusy] = useState(false);

  function defaults(e: any) {
    return {
      id: e?.id,
      title: e?.title ?? "",
      description: e?.description ?? "",
      event_date: e?.event_date ? new Date(e.event_date).toISOString().slice(0, 16) : "",
      location: e?.location ?? "",
      registration_url: e?.registration_url ?? "",
      image_url: e?.image_url ?? "",
      ministry_slug: e?.ministry_slug ?? "",
      published: e?.published ?? true,
    };
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setForm(defaults(editing)); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "Edit event" : "New event"}</DialogTitle></DialogHeader>
        <form
          onSubmit={async (ev) => {
            ev.preventDefault();
            setBusy(true);
            try {
              await save({ data: { ...form, event_date: new Date(form.event_date).toISOString() } });
              toast.success("Saved");
              setOpen(false);
              onSaved();
            } catch (e: any) { toast.error(e.message); }
            finally { setBusy(false); }
          }}
          className="space-y-4"
        >
          <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date & time</Label><Input type="datetime-local" required value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          </div>
          <div><Label>Registration link</Label><Input type="url" value={form.registration_url} onChange={(e) => setForm({ ...form, registration_url: e.target.value })} /></div>
          <div>
            <Label>Ministry</Label>
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
          <div>
            <Label>Featured image</Label>
            {form.image_url && <img src={form.image_url} alt="" className="w-full max-h-40 object-cover rounded mt-2" />}
            <div className="mt-2 flex items-center gap-2">
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="URL or upload" />
              <FileUpload bucket="event-images" accept="image/*" onUploaded={(url) => setForm({ ...form, image_url: url })} label="Upload" />
            </div>
          </div>
          <div className="flex items-center gap-3"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label>Published</Label></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={busy} className="bg-orange-500 hover:bg-orange-600 text-black">Save</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}