import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listUsersWithRoles, inviteUser, setUserRole, deleteUser } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Role = "super_admin" | "pastor" | "ministry_leader";
// Two roles only. Super admins manage everything. Leaders get Events, Messages and their prayer requests.
const ROLES: Role[] = ["super_admin", "ministry_leader"];
const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super admin",
  pastor: "Pastor",
  ministry_leader: "Leader",
};

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

function UsersPage() {
  const list = useServerFn(listUsersWithRoles);
  const set = useServerFn(setUserRole);
  const del = useServerFn(deleteUser);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-users"], queryFn: () => list() });
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  const toggle = useMutation({
    mutationFn: (v: { userId: string; role: Role; grant: boolean }) => set({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (userId: string) => del({ data: { userId } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Users & roles</h1><p className="text-neutral-500">Add leaders here and choose what they can do. Only super admins can manage users.</p></div>
        <Button onClick={() => setOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-black"><Plus className="h-4 w-4 mr-2" /> Add user</Button>
      </div>
      <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase tracking-wider">
          <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th>{ROLES.map((r) => <th key={r} className="text-left p-3">{ROLE_LABEL[r]}</th>)}<th className="p-3"></th></tr>
        </thead>
        <tbody>
          {data.map((u: any) => (
            <tr key={u.id} className="border-t border-neutral-100">
              <td className="p-3 font-medium">{u.full_name || <span className="text-neutral-400">No name</span>}</td>
              <td className="p-3 text-neutral-600">{u.email}</td>
              {ROLES.map((r) => (
                <td key={r} className="p-3">
                  <Checkbox
                    checked={u.roles.includes(r)}
                    disabled={u.id === me && r === "super_admin"}
                    onCheckedChange={(v) => toggle.mutate({ userId: u.id, role: r, grant: !!v })}
                  />
                </td>
              ))}
              <td className="p-3 text-right"><Button size="sm" variant="ghost" disabled={u.id === me} onClick={() => confirm(`Delete ${u.email}?`) && remove.mutate(u.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></td>
            </tr>
          ))}
        </tbody>
      </table></div></Card>
      <InviteDialog open={open} setOpen={setOpen} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-users"] })} />
    </div>
  );
}

function InviteDialog({ open, setOpen, onSaved }: any) {
  const invite = useServerFn(inviteUser);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "ministry_leader" as Role });
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add user</DialogTitle></DialogHeader>
        <form onSubmit={async (e) => {
          e.preventDefault(); setBusy(true);
          try { await invite({ data: form }); toast.success("User created. Share the password with them securely."); setOpen(false); setForm({ full_name: "", email: "", password: "", role: "ministry_leader" }); onSaved(); }
          catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
        }} className="space-y-4">
          <div><Label>Full name</Label><Input required maxLength={120} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label>Temporary password</Label><Input type="text" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div><Label>Role</Label>
            <Select value={form.role} onValueChange={(v: Role) => setForm({ ...form, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={busy} className="bg-orange-500 hover:bg-orange-600 text-black">Create user</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}