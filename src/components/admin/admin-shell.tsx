import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, CalendarDays, ImageIcon, Users, Church, LogOut, Flame, HeartHandshake, Mail, BookOpen, HandHeart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Role = "super_admin" | "pastor" | "ministry_leader";

/*
  roles    : which roles see the item. Leave out for everyone allowed in.
  leaderOk : ministry leaders may see it. Leaders get Dashboard, Events, Messages and My prayer requests only.
*/
const NAV: { to: string; label: string; icon: typeof LayoutDashboard; roles?: Role[]; leaderOk?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, leaderOk: true },
  { to: "/admin/events", label: "Events", icon: CalendarDays, leaderOk: true },
  { to: "/admin/messages", label: "Messages", icon: Mail, leaderOk: true },
  { to: "/admin/my-prayer", label: "My prayer requests", icon: HandHeart, roles: ["pastor", "ministry_leader"], leaderOk: true },
  { to: "/admin/media", label: "Featured photos", icon: ImageIcon },
  { to: "/admin/ministries", label: "Ministries", icon: Church },
  { to: "/admin/salvation", label: "Salvation", icon: Flame },
  { to: "/admin/stories", label: "Stories", icon: BookOpen },
  { to: "/admin/prayer", label: "Prayer requests", icon: HeartHandshake },
  { to: "/admin/users", label: "Users", icon: Users, roles: ["super_admin"] },
];

const isActive = (pathname: string, to: string) => (to === "/admin" ? pathname === "/admin" : pathname.startsWith(to));

export function AdminShell({ children, roles, email }: { children: ReactNode; roles: Role[]; email: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const isFullAdmin = roles.includes("super_admin") || roles.includes("pastor");
  const items = NAV.filter((n) => (isFullAdmin || n.leaderOk) && (!n.roles || n.roles.some((r) => roles.includes(r))));

  // If someone types an address they are not allowed to open, send them back to the dashboard
  useEffect(() => {
    if (pathname !== "/admin" && !items.some((i) => isActive(pathname, i.to))) {
      navigate({ to: "/admin", replace: true });
    }
  }, [pathname, items, navigate]);

  return (
    <div className="flex min-h-dvh bg-neutral-50 text-neutral-900">
      <aside className="hidden md:flex w-64 flex-col border-r border-neutral-200 bg-black text-white">
        <div className="p-6 border-b border-neutral-800">
          <div className="text-xs uppercase tracking-widest text-orange-500 font-semibold">Mavuno Youth</div>
          <div className="text-lg font-bold">Admin</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map(({ to, label, icon: Icon }) => {
            const active = isActive(pathname, to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-orange-500 text-black" : "text-neutral-300 hover:bg-neutral-900 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-neutral-800 space-y-2">
          <div className="px-3 text-xs text-neutral-400 truncate">{email}</div>
          <div className="px-3 text-[10px] uppercase tracking-widest text-orange-500">{roles.join(" · ")}</div>
          <Button onClick={signOut} variant="ghost" className="w-full justify-start text-neutral-300 hover:text-white hover:bg-neutral-900">
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-neutral-200 bg-white">
          <div className="font-bold">Mavuno Admin</div>
          <Button size="sm" variant="ghost" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
        </header>
        <div className="md:hidden overflow-x-auto border-b border-neutral-200 bg-white">
          <div className="flex gap-1 p-2 whitespace-nowrap">
            {items.map(({ to, label }) => {
              const active = isActive(pathname, to);
              return (
                <Link key={to} to={to} className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium",
                  active ? "bg-orange-500 text-black" : "text-neutral-700 hover:bg-neutral-100",
                )}>{label}</Link>
              );
            })}
          </div>
        </div>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}