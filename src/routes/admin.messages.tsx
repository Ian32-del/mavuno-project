import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Mail, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  deleteContactMessage,
  listContactMessages,
  updateContactMessage,
  type MessageRow,
  type MessageStatus,
} from "@/lib/admin.messages.functions";

export const Route = createFileRoute("/admin/messages")({
  component: MessagesAdmin,
});

const STATUS_LABEL: Record<MessageStatus, string> = { new: "New", replied: "Replied", archived: "Archived" };
const STATUS_STYLE: Record<MessageStatus, string> = {
  new: "bg-orange-100 text-orange-700",
  replied: "bg-green-100 text-green-700",
  archived: "bg-neutral-100 text-neutral-600",
};

const selectClass = "h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500";

const formatDate = (value: string) => new Date(value).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });

function MessagesAdmin() {
  const list = useServerFn(listContactMessages);
  const update = useServerFn(updateContactMessage);
  const remove = useServerFn(deleteContactMessage);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({ queryKey: ["admin-messages"], queryFn: () => list() });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<MessageRow | null>(null);
  const [status, setStatus] = useState<MessageStatus>("new");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const rows = data ?? [];
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return [r.name, r.email, r.subject ?? "", r.message].some((v) => v.toLowerCase().includes(q));
    });
  }, [rows, search, statusFilter]);

  const newCount = rows.filter((r) => r.status === "new").length;

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
  }

  const save = useMutation({
    mutationFn: () => update({ data: { id: selected!.id, status } }),
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

  function open(row: MessageRow) {
    setSelected(row);
    setStatus(row.status);
    setConfirmDelete(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Mail className="h-7 w-7 text-orange-500" />
          Messages
        </h1>
        <p className="mt-1 text-neutral-500">
          Messages sent through the Contact page. {newCount > 0 ? `${newCount} not answered yet.` : "Everything has been answered."}
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input className="pl-8" placeholder="Search name, email, subject, message" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Status">
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Message</th>
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
                  {rows.length === 0 ? "No messages yet." : "Nothing matches your search."}
                </td>
              </tr>
            )}
            {shown.map((r) => (
              <tr key={r.id} onClick={() => open(r)} className="cursor-pointer border-t border-neutral-100 hover:bg-neutral-50">
                <td className="whitespace-nowrap px-4 py-3 text-neutral-500">{formatDate(r.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-neutral-500">{r.email}</div>
                </td>
                <td className="px-4 py-3">{r.subject || "No subject"}</td>
                <td className="max-w-xs truncate px-4 py-3 text-neutral-600">{r.message}</td>
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
                <DialogTitle>{selected.subject || "Message"} from {selected.name}</DialogTitle>
                <DialogDescription>Sent on {formatDate(selected.created_at)}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <p className="whitespace-pre-wrap rounded-md bg-neutral-50 p-3">{selected.message}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-neutral-500">Email</div>
                    <a className="text-orange-600 hover:underline" href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject || "Your message to Mavuno Youth"}`)}`}>
                      {selected.email}
                    </a>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">Phone</div>
                    {selected.phone ? <a className="text-orange-600 hover:underline" href={`tel:${selected.phone}`}>{selected.phone}</a> : "Not given"}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message-status">Status</Label>
                  <select id="message-status" className={`${selectClass} w-full`} value={status} onChange={(e) => setStatus(e.target.value as MessageStatus)}>
                    <option value="new">New</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:justify-between">
                {confirmDelete ? (
                  <Button type="button" variant="destructive" disabled={del.isPending} onClick={() => del.mutate()}>
                    Yes, delete this message
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