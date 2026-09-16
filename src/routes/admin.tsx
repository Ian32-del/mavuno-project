import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyRoles } from "@/lib/admin.functions";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Role = "super_admin" | "pastor" | "ministry_leader";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Mavuno Youth" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminGate,
});

function AdminGate() {
  const [session, setSession] = useState<{ email: string } | null | undefined>(undefined);
  const [roles, setRoles] = useState<Role[] | null>(null);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();
  const fetchRoles = useServerFn(getMyRoles);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ? { email: data.session.user.email ?? "" } : null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setSession(s ? { email: s.user.email ?? "" } : null);
        setRoles(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    setChecking(true);
    fetchRoles()
      .then((r) => {
        if (r.roles.length === 0) {
          toast.error("Your account has no admin access.");
          supabase.auth.signOut().then(() => navigate({ to: "/", replace: true }));
          return;
        }
        setRoles(r.roles);
      })
      .catch((err) => {
        console.error('fetchRoles failed:', err);
        toast.error(err?.message ?? 'Auth check failed');
        supabase.auth.signOut().then(() => navigate({ to: "/", replace: true }));
        })
      .finally(() => setChecking(false));
  }, [session, fetchRoles, navigate]);

  if (session === undefined) {
    return <div className="flex min-h-dvh items-center justify-center bg-neutral-950 text-white"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (!session) return <LoginForm />;
  if (!roles || checking) {
    return <div className="flex min-h-dvh items-center justify-center bg-neutral-950 text-white"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  return (
    <AdminShell roles={roles} email={session.email}>
      <Outlet />
    </AdminShell>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-950 px-4">
      <Card className="w-full max-w-md p-8 bg-black border-neutral-800 text-white">
        <div className="text-xs uppercase tracking-widest text-orange-500 font-bold">Mavuno Youth</div>
        <h1 className="mt-1 text-2xl font-bold">Admin sign in</h1>
        <p className="mt-1 text-sm text-neutral-400">Authorized personnel only.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-neutral-300">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-neutral-900 border-neutral-700 text-white" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-neutral-300">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-neutral-900 border-neutral-700 text-white" />
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}