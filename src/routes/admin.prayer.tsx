import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { HeartHandshake, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  deletePrayerRequest,
  listPrayerRequests,
  updatePrayerRequest,
  type PrayerRow,
  type PrayerStatus,
} from "@/lib/admin.submissions.functions";

export const Route = createFileRoute("/admin/prayer")({
  component: PrayerAdmin,
});

const STATUS_LABEL: Record<PrayerStatus, string> = { new: "New", prayed: "Prayed for" };
const STATUS_STYLE: Record<PrayerStatus, string> = {
  new: "bg-orange-100 text-orange-700",
  prayed: "bg-green-100 text-green-700",
};

const selectClass = "h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500";

const formatDate = (value: string) => new Date(value).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });

function PrayerAdmin() {
  const list = useServerFn(listPrayerRequests);
  const update = useServerFn(updatePrayerRequest);
  const remove = useServerFn(deletePrayerRequest);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({ queryKey: ["admin-prayer"], queryFn: () => list() });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<PrayerRow | null>(null);
  const [status, setStatus] = useState<PrayerStatus>("new");
  const [approved, setApproved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const rows = data ?? [];
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (typeFilter === "prayer" && r.is_praise) return false;
      if (typeFilter === "praise" && !r.is_praise) return false;
      if (!q) return true;
      return [r.name, r.email ?? "", r.phone ?? "", r.request].some((v) => v.toLowerCase().includes(q));
    });
  }, [rows, search, statusFilter, typeFilter]);

  const newCount = rows.filter((r) => r.status === "new").length;

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["admin-prayer"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  }

  const save = useMutation({
    mutationFn: () => update({ data: { id: selected!.id, status, approved_public: approved } }),
    onSuccess: () => {
      toast.success("Saved");
      setSelected(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: () => remove({ data: { id: selected!.id } }),
    onSuccess: () => {
      toast.success("Deleted");
      setSelected(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message === "Forbidden" ? "Only a super admin or pastor can delete this." : e.message),
  });

  function open(row: PrayerRow) {
    setSelected(row);
    setStatus(row.status);
    setApproved(row.approved_public);
    setConfirmDelete(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <HeartHandshake className="h-7 w-7 text-orange-500" />
          Prayer requests
        </h1>
        <p className="mt-1 text-neutral-500">
          Prayer requests and praise reports. {newCount > 0 ? `${newCount} not prayed for yet.` : "All have been prayed for."}
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input className="pl-8" placeholder="Search name or request" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className={selectClass} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Type">
            <option value="all">Requests and praise</option>
            <option value="prayer">Prayer requests</option>
            <option value="praise">Praise reports</option>
          </select>
          <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Status">
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="prayed">Prayed for</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Request</th>
              <th className="px-4 py-3">Prayer wall</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">Loading...</td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-red-600">{(error as Error).message}</td>
              </tr>
            )}
            {!isLoading && !error && shown.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  {rows.length === 0 ? "No requests yet." : "Nothing matches your search."}
                </td>
              </tr>
            )}
            {shown.map((r) => (
              <tr key={r.id} onClick={() => open(r)} className="cursor-pointer border-t border-neutral-100 hover:bg-neutral-50">
                <td className="whitespace-nowrap px-4 py-3 text-neutral-500">{formatDate(r.created_at)}</td>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3">{r.is_praise ? "Praise" : "Prayer"}</td>
                <td className="max-w-xs truncate px-4 py-3 text-neutral-600">{r.request}</td>
                <td className="px-4 py-3 text-xs">
                  {r.approved_public ? "Approved" : r.is_public ? "Asked to share" : "Private"}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog open={selected !== null} onOpenChange={(next) => { if (!next) setSelected(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.is_praise ? "Praise report" : "Prayer request"} from {selected.name}</DialogTitle>
                <DialogDescription>Sent on {formatDate(selected.created_at)}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <p className="whitespace-pre-wrap rounded-md bg-neutral-50 p-3">{selected.request}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-neutral-500">Email</div>
                    {selected.email ? <a className="text-orange-600 hover:underline" href={`mailto:${selected.email}`}>{selected.email}</a> : "Not given"}
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">Phone</div>
                    {selected.phone ? <a className="text-orange-600 hover:underline" href={`tel:${selected.phone}`}>{selected.phone}</a> : "Not given"}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prayer-status">Status</Label>
                  <select id="prayer-status" className={`${selectClass} w-full`} value={status} onChange={(e) => setStatus(e.target.value as PrayerStatus)}>
                    <option value="new">New</option>
                    <option value="prayed">Prayed for</option>
                  </select>
                </div>
                <label className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1" checked={approved} disabled={!selected.is_public} onChange={(e) => setApproved(e.target.checked)} />
                  <span>
                    Approved for the prayer wall
                    <span className="block text-xs text-neutral-500">
                      {selected.is_public
                        ? "They asked for this to be shared anonymously. It only appears once you approve it."
                        : "They asked to keep this private, so it cannot be shared."}
                    </span>
                  </span>
                </label>
              </div>
              <DialogFooter className="gap-2 sm:justify-between">
                {confirmDelete ? (
                  <Button type="button" variant="destructive" disabled={del.isPending} onClick={() => del.mutate()}>
                    Yes, delete this request
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" className="text-red-600" onClick={() => setConfirmDelete(true)}>
                    Delete
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
                  <Button type="button" className="bg-orange-500 text-black hover:bg-orange-600" disabled={save.isPending} onClick={() => save.mutate()}>
                    {save.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}