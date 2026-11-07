import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Flame, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  deleteSalvationDecision,
  listSalvationDecisions,
  updateSalvationDecision,
  type SalvationRow,
  type SalvationStatus,
} from "@/lib/admin.submissions.functions";

export const Route = createFileRoute("/admin/salvation")({
  component: SalvationAdmin,
});

const STATUS_LABEL: Record<SalvationStatus, string> = {
  new: "New",
  contacted: "Contacted",
  followed_up: "Followed up",
};

const STATUS_STYLE: Record<SalvationStatus, string> = {
  new: "bg-orange-100 text-orange-700",
  contacted: "bg-blue-100 text-blue-700",
  followed_up: "bg-green-100 text-green-700",
};

const selectClass = "h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500";

const formatDate = (value: string) => new Date(value).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });

function SalvationAdmin() {
  const list = useServerFn(listSalvationDecisions);
  const update = useServerFn(updateSalvationDecision);
  const remove = useServerFn(deleteSalvationDecision);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({ queryKey: ["admin-salvation"], queryFn: () => list() });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<SalvationRow | null>(null);
  const [status, setStatus] = useState<SalvationStatus>("new");
  const [notes, setNotes] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const rows = data ?? [];
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return [r.name, r.email, r.phone ?? "", r.ministry_interest ?? ""].some((v) => v.toLowerCase().includes(q));
    });
  }, [rows, search, statusFilter]);

  const newCount = rows.filter((r) => r.status === "new").length;

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["admin-salvation"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  }

  const save = useMutation({
    mutationFn: () => update({ data: { id: selected!.id, status, follow_up_notes: notes } }),
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

  function open(row: SalvationRow) {
    setSelected(row);
    setStatus(row.status);
    setNotes(row.follow_up_notes ?? "");
    setConfirmDelete(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Flame className="h-7 w-7 text-orange-500" />
          Salvation decisions
        </h1>
        <p className="mt-1 text-neutral-500">
          People who said yes to following Jesus. {newCount > 0 ? `${newCount} waiting for a first contact.` : "Everyone has been contacted."}
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input className="pl-8" placeholder="Search by name, email, phone" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Status">
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="followed_up">Followed up</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Ministry</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">Loading...</td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-red-600">{(error as Error).message}</td>
              </tr>
            )}
            {!isLoading && !error && shown.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  {rows.length === 0 ? "No decisions yet." : "Nothing matches your search."}
                </td>
              </tr>
            )}
            {shown.map((r) => (
              <tr key={r.id} onClick={() => open(r)} className="cursor-pointer border-t border-neutral-100 hover:bg-neutral-50">
                <td className="whitespace-nowrap px-4 py-3 text-neutral-500">{formatDate(r.created_at)}</td>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3">
                  <div>{r.email}</div>
                  {r.phone && <div className="text-xs text-neutral-500">{r.phone}</div>}
                </td>
                <td className="px-4 py-3">{r.ministry_interest || "Not sure"}</td>
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
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>Decided on {formatDate(selected.created_at)}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-neutral-500">Email</div>
                    <a className="text-orange-600 hover:underline" href={`mailto:${selected.email}`}>{selected.email}</a>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">Phone</div>
                    {selected.phone ? <a className="text-orange-600 hover:underline" href={`tel:${selected.phone}`}>{selected.phone}</a> : "Not given"}
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-neutral-500">Ministry they would fit best</div>
                    {selected.ministry_interest || "Not sure"}
                  </div>
                </div>
                {selected.notes && (
                  <div>
                    <div className="text-xs text-neutral-500">What they wrote</div>
                    <p className="mt-1 whitespace-pre-wrap rounded-md bg-neutral-50 p-3">{selected.notes}</p>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="salvation-status">Status</Label>
                  <select id="salvation-status" className={`${selectClass} w-full`} value={status} onChange={(e) => setStatus(e.target.value as SalvationStatus)}>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="followed_up">Followed up</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="salvation-notes">Follow up notes</Label>
                  <textarea
                    id="salvation-notes"
                    rows={4}
                    maxLength={2000}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Who spoke to them, what was said, what happens next"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:justify-between">
                {confirmDelete ? (
                  <Button type="button" variant="destructive" disabled={del.isPending} onClick={() => del.mutate()}>
                    Yes, delete this record
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