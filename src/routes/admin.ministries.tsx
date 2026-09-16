import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMinistries, updateMinistry } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FileUpload } from "@/components/admin/upload";

export const Route = createFileRoute("/admin/ministries")({ component: MinistriesPage });

function MinistriesPage() {
  const list = useServerFn(listMinistries);
  const { data = [] } = useQuery({ queryKey: ["admin-ministries"], queryFn: () => list() });

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Ministries</h1><p className="text-neutral-500">Edit content shown on the public ministry pages.</p></div>
      {data.length > 0 && (
        <Tabs defaultValue={data[0].slug}>
          <TabsList>{data.map((m: any) => <TabsTrigger key={m.slug} value={m.slug}>{m.name}</TabsTrigger>)}</TabsList>
          {data.map((m: any) => <TabsContent key={m.slug} value={m.slug}><MinistryForm ministry={m} /></TabsContent>)}
        </Tabs>
      )}
    </div>
  );
}

function MinistryForm({ ministry }: { ministry: any }) {
  const save = useServerFn(updateMinistry);
  const qc = useQueryClient();
  const [form, setForm] = useState(ministry);
  const [busy, setBusy] = useState(false);
  useEffect(() => setForm(ministry), [ministry]);

  return (
    <Card className="p-6">
      <form onSubmit={async (e) => {
        e.preventDefault(); setBusy(true);
        try { await save({ data: form }); toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-ministries"] }); }
        catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
      }} className="space-y-4">
        <div><Label>Name</Label><Input required value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>Description</Label><Textarea rows={4} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label>Leader name</Label><Input value={form.leader_name ?? ""} onChange={(e) => setForm({ ...form, leader_name: e.target.value })} /></div>
          <div><Label>Meet time</Label><Input value={form.meet_time ?? ""} onChange={(e) => setForm({ ...form, meet_time: e.target.value })} /></div>
        </div>
        <div><Label>Meet location</Label><Input value={form.meet_location ?? ""} onChange={(e) => setForm({ ...form, meet_location: e.target.value })} /></div>
        <div><Label>Leader bio</Label><Textarea rows={3} value={form.leader_bio ?? ""} onChange={(e) => setForm({ ...form, leader_bio: e.target.value })} /></div>
        <div>
          <Label>Leader photo</Label>
          {form.leader_photo_url && <img src={form.leader_photo_url} className="w-24 h-24 object-cover rounded-full mt-2" alt="" />}
          <div className="flex gap-2 mt-2">
            <Input value={form.leader_photo_url ?? ""} onChange={(e) => setForm({ ...form, leader_photo_url: e.target.value })} />
            <FileUpload bucket="ministry-gallery" accept="image/*" onUploaded={(url) => setForm({ ...form, leader_photo_url: url })} label="Upload" />
          </div>
        </div>
        <div>
          <Label>Hero image</Label>
          {form.hero_image_url && <img src={form.hero_image_url} className="w-full max-h-40 object-cover rounded mt-2" alt="" />}
          <div className="flex gap-2 mt-2">
            <Input value={form.hero_image_url ?? ""} onChange={(e) => setForm({ ...form, hero_image_url: e.target.value })} />
            <FileUpload bucket="ministry-gallery" accept="image/*" onUploaded={(url) => setForm({ ...form, hero_image_url: url })} label="Upload" />
          </div>
        </div>
        <div><Button type="submit" disabled={busy} className="bg-orange-500 hover:bg-orange-600 text-black">Save {ministry.name}</Button></div>
      </form>
    </Card>
  );
}