import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardStats } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { CalendarDays, Mic2, FileText, ImageIcon } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const fn = useServerFn(getDashboardStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn() });

  const cards = [
    { label: "Events", value: data?.totals.events ?? 0, icon: CalendarDays },
    { label: "Media files", value: data?.totals.media ?? 0, icon: ImageIcon },
    { label: "Sermons", value: data?.totals.sermons ?? 0, icon: Mic2 },
    { label: "Resources", value: data?.totals.resources ?? 0, icon: FileText },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-neutral-500 mt-1">Overview of ministry content.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-500 font-medium">{c.label}</div>
              <c.icon className="h-4 w-4 text-orange-500" />
            </div>
            <div className="mt-2 text-3xl font-bold">{isLoading ? "—" : c.value}</div>
          </Card>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold text-lg">Upcoming events</h2>
          <div className="mt-4 space-y-3">
            {(data?.upcoming ?? []).length === 0 && <p className="text-sm text-neutral-500">None scheduled.</p>}
            {(data?.upcoming ?? []).map((e: any) => (
              <div key={e.id} className="flex items-start justify-between gap-4 pb-3 border-b border-neutral-100 last:border-0">
                <div>
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-neutral-500">{e.location}</div>
                </div>
                <div className="text-xs text-neutral-500 whitespace-nowrap">
                  {new Date(e.event_date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold text-lg">Recent uploads</h2>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(data?.recentMedia ?? []).length === 0 && <p className="text-sm text-neutral-500 col-span-3">No media yet.</p>}
            {(data?.recentMedia ?? []).map((m: any) => (
              <div key={m.id} className="aspect-square rounded overflow-hidden bg-neutral-100">
                {m.type === "image" ? (
                  <img src={m.url} alt={m.title ?? ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">Video</div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}