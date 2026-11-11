import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardStats } from "@/lib/admin.submissions.functions";
import { getMyRoles, listMyPrayer } from "@/lib/admin.prayer.functions";
import { Card } from "@/components/ui/card";
import { CalendarDays, Flame, HandHeart, HeartHandshake, ImageIcon, Mail } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

const formatDate = (value: string) => new Date(value).toLocaleDateString("en-KE", { day: "2-digit", month: "short" });

/* What a ministry leader sees: only their own work */
function LeaderHome() {
  const mine = useServerFn(listMyPrayer);
  const { data = [] } = useQuery({ queryKey: ["my-prayer"], queryFn: () => mine() });
  const open = data.filter((r: any) => r.status !== "done").length;

  const links = [
    { label: "Events", note: "Create and update events", icon: CalendarDays, to: "/admin/events" },
    { label: "Messages", note: "Read messages sent through the website", icon: Mail, to: "/admin/messages" },
    { label: "My prayer requests", note: `${open} waiting for you`, icon: HandHeart, to: "/admin/my-prayer" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="mt-1 text-neutral-500">Here is what you can work on.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {links.map((l) => (
          <Link key={l.label} to={l.to}>
            <Card className="h-full border-l-4 border-l-orange-500 p-5 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold">{l.label}</div>
                <l.icon className="h-4 w-4 shrink-0 text-orange-500" />
              </div>
              <div className="mt-2 text-sm text-neutral-500">{l.note}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  const rolesFn = useServerFn(getMyRoles);
  const { data: roles, isLoading: rolesLoading } = useQuery({ queryKey: ["my-roles"], queryFn: () => rolesFn() });
  const isFullAdmin = !!roles?.some((r: string) => r === "super_admin" || r === "pastor");

  const fn = useServerFn(getDashboardStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn(), enabled: isFullAdmin });

  if (rolesLoading) return <p className="text-neutral-500">Loading...</p>;
  if (!isFullAdmin) return <LeaderHome />;

  const cards = [
    { label: "Events", value: data?.totals.events ?? 0, icon: CalendarDays, to: "/admin/events" },
    { label: "Featured photos set", value: data?.totals.photos ?? 0, icon: ImageIcon, to: "/admin/media" },
    { label: "New messages", value: data?.totals.messagesNew ?? 0, icon: Mail, to: "/admin/messages" },
    { label: "New salvation decisions", value: data?.totals.salvationNew ?? 0, icon: Flame, to: "/admin/salvation" },
    { label: "Prayer requests to assign", value: data?.totals.prayerNew ?? 0, icon: HeartHandshake, to: "/admin/prayer" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-neutral-500">Overview of ministry content and people waiting to hear from us.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <Link key={c.label} to={c.to}>
            <Card className="h-full border-l-4 border-l-orange-500 p-5 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium text-neutral-500">{c.label}</div>
                <c.icon className="h-4 w-4 shrink-0 text-orange-500" />
              </div>
              <div className="mt-2 text-3xl font-bold">{isLoading ? "..." : c.value}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent salvation decisions</h2>
            <Link to="/admin/salvation" className="text-sm text-orange-600 hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {(data?.recentSalvation ?? []).length === 0 && <p className="text-sm text-neutral-500">None yet.</p>}
            {(data?.recentSalvation ?? []).map((s: any) => (
              <div key={s.id} className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-3 last:border-0">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-neutral-500">{s.ministry_interest || "Not sure"}</div>
                </div>
                <div className="whitespace-nowrap text-right text-xs text-neutral-500">
                  <div>{formatDate(s.created_at)}</div>
                  {s.status === "new" && <div className="font-medium text-orange-600">New</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent prayer requests</h2>
            <Link to="/admin/prayer" className="text-sm text-orange-600 hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {(data?.recentPrayer ?? []).length === 0 && <p className="text-sm text-neutral-500">None yet.</p>}
            {(data?.recentPrayer ?? []).map((p: any) => (
              <div key={p.id} className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-3 last:border-0">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-neutral-500">{p.is_praise ? "Praise report" : "Prayer request"}</div>
                </div>
                <div className="whitespace-nowrap text-right text-xs text-neutral-500">
                  <div>{formatDate(p.created_at)}</div>
                  {p.status === "new" && <div className="font-medium text-orange-600">New</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Upcoming events</h2>
          <div className="mt-4 space-y-3">
            {(data?.upcoming ?? []).length === 0 && <p className="text-sm text-neutral-500">None scheduled.</p>}
            {(data?.upcoming ?? []).map((e: any) => (
              <div key={e.id} className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-3 last:border-0">
                <div>
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-neutral-500">{e.location}</div>
                </div>
                <div className="whitespace-nowrap text-xs text-neutral-500">{new Date(e.event_date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent messages</h2>
            <Link to="/admin/messages" className="text-sm text-orange-600 hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {(data?.recentMessages ?? []).length === 0 && <p className="text-sm text-neutral-500">No messages yet.</p>}
            {(data?.recentMessages ?? []).map((m: any) => (
              <div key={m.id} className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-3 last:border-0">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-neutral-500">{m.subject || "No subject"}</div>
                </div>
                <div className="whitespace-nowrap text-right text-xs text-neutral-500">
                  <div>{formatDate(m.created_at)}</div>
                  {m.status === "new" && <div className="font-medium text-orange-600">New</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}