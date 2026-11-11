import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listAllPrayer,
  listAssignableLeaders,
  assignPrayer,
  type PrayerAdminRow,
  type PrayerStatus,
  type AssignableLeader,
} from "@/lib/admin.prayer.functions";
import { deletePrayerRequest } from "@/lib/admin.submissions.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/prayer")({ component: PrayerAdminPage });

const STATUS_LABEL: Record<PrayerStatus, string> = {
  new: "Not assigned",
  assigned: "Assigned",
  in_progress: "In progress",
  done: "Done",
};

const STATUS_STYLE: Record<PrayerStatus, string> = {
  new: "bg-orange-100 text-orange-700",
  assigned: "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700",
  done: "bg-green-100 text-green-700",
};

const FILTERS: { value: "all" | PrayerStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "Not assigned" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const leaderLabel = (l: AssignableLeader) => l.full_name || l.email;

function PrayerAdminPage() {
  const list = useServerFn(listAllPrayer);
  const leadersFn = useServerFn(listAssignableLeaders);
  const assign = useServerFn(assignPrayer);
  const del = useServerFn(deletePrayerRequest);
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | PrayerStatus>("all");

  const { data = [], isLoading, error } = useQuery({ queryKey: ["admin-prayer"], queryFn: () => list() });
  const { data: leaders = [] } = useQuery({ queryKey: ["assignable-leaders"], queryFn: () => leadersFn() });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-prayer"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const assignMut = useMutation({
    mutationFn: (v: { id: string; leader_id: string | null }) => assign({ data: v }),
    onSuccess: (_r, v) => { toast.success(v.leader_id ? "Assigned" : "Unassigned"); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  const leaderName = (id: string | null) => {
    const l = leaders.find((x: AssignableLeader) => x.user_id === id);
    return l ? leaderLabel(l) : null;
  };

  const rows = data.filter((r: PrayerAdminRow) => filter === "all" || r.status === filter);
  const count = (f: "all" | PrayerStatus) => (f === "all" ? data.length : data.filter((r: PrayerAdminRow) => r.status === f).length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Prayer requests</h1>
        <p className="text-neutral-500">Assign each request to a leader who will walk with the person, and watch how it is going.</p>
      </div>

      {isLoading && <p className="text-neutral-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">Could not load requests. Run prayer_assignment_and_roles.sql in Supabase first. ({(error as Error).message})</p>}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === f.value ? "bg-orange-500 text-black" : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-100"
            }`}
          >
            {f.label} ({count(f.value)})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {rows.length === 0 && !isLoading && <p className="py-10 text-center text-neutral-500">Nothing here.</p>}
        {rows.map((r: PrayerAdminRow) => (
          <Card key={r.id} className="space-y-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{r.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                  <span className="text-xs text-neutral-500">{r.is_praise ? "Praise report" : "Prayer request"}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                  <span>{new Date(r.created_at).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  {r.phone && (
                    <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 text-orange-600 hover:underline">
                      <Phone className="h-3 w-3" /> {r.phone}
                    </a>
                  )}
                  {r.email && <span>{r.email}</span>}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => confirm("Delete this request for good?") && remove.mutate(r.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>

            <p className="whitespace-pre-wrap text-sm text-neutral-700">{r.request}</p>

            <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-4">
              <label className="text-sm font-medium">Assigned to</label>
              <select
                value={r.assigned_to ?? ""}
                disabled={assignMut.isPending}
                onChange={(e) => assignMut.mutate({ id: r.id, leader_id: e.target.value || null })}
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
              >
                <option value="">Not assigned</option>
                {leaders.map((l: AssignableLeader) => (
                  <option key={l.user_id} value={l.user_id}>{leaderLabel(l)}</option>
                ))}
              </select>
              {r.assigned_to && r.assigned_at && (
                <span className="text-xs text-neutral-500">
                  {leaderName(r.assigned_to) ?? "Leader"} since {new Date(r.assigned_at).toLocaleDateString("en-KE", { day: "2-digit", month: "short" })}
                </span>
              )}
            </div>

            {r.leader_notes && (
              <div className="rounded-md bg-neutral-50 p-3 text-sm">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">Leader notes</div>
                <p className="whitespace-pre-wrap text-neutral-700">{r.leader_notes}</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {leaders.length === 0 && !isLoading && (
        <p className="text-sm text-neutral-500">No leaders to assign to yet. Add users with the leader role under Users.</p>
      )}
    </div>
  );
}