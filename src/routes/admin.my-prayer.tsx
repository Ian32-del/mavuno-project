import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyPrayer, updateMyPrayer, type PrayerAdminRow, type PrayerStatus } from "@/lib/admin.prayer.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/my-prayer")({ component: MyPrayerPage });

type WorkStatus = Exclude<PrayerStatus, "new">;

const STATUS_OPTIONS: { value: WorkStatus; label: string }[] = [
  { value: "assigned", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

/* 0712 345 678 or +254712345678 becomes 254712345678 for a WhatsApp link */
function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
}

function MyPrayerPage() {
  const list = useServerFn(listMyPrayer);
  const { data = [], isLoading, error } = useQuery({ queryKey: ["my-prayer"], queryFn: () => list() });

  const open = data.filter((r: PrayerAdminRow) => r.status !== "done");
  const done = data.filter((r: PrayerAdminRow) => r.status === "done");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My prayer requests</h1>
        <p className="text-neutral-500">People you are walking with. Reach out, pray with them, and keep a short note of how it is going.</p>
      </div>

      {isLoading && <p className="text-neutral-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">Could not load your requests. ({(error as Error).message})</p>}

      {!isLoading && data.length === 0 && (
        <p className="py-10 text-center text-neutral-500">Nothing has been assigned to you yet.</p>
      )}

      <div className="space-y-4">
        {open.map((r: PrayerAdminRow) => <RequestCard key={r.id} row={r} />)}
      </div>

      {done.length > 0 && (
        <>
          <h2 className="pt-4 text-lg font-semibold text-neutral-600">Done ({done.length})</h2>
          <div className="space-y-4">
            {done.map((r: PrayerAdminRow) => <RequestCard key={r.id} row={r} />)}
          </div>
        </>
      )}
    </div>
  );
}

function RequestCard({ row }: { row: PrayerAdminRow }) {
  const save = useServerFn(updateMyPrayer);
  const qc = useQueryClient();
  const [status, setStatus] = useState<WorkStatus>((row.status === "new" ? "assigned" : row.status) as WorkStatus);
  const [notes, setNotes] = useState(row.leader_notes ?? "");

  const update = useMutation({
    mutationFn: () => save({ data: { id: row.id, status, leader_notes: notes } }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["my-prayer"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{row.name}</div>
          <div className="text-xs text-neutral-500">
            {row.is_praise ? "Praise report" : "Prayer request"} · received{" "}
            {new Date(row.created_at).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        </div>
        {row.phone && (
          <div className="flex gap-2">
            <a href={`tel:${row.phone}`} className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50">
              <Phone className="h-4 w-4" /> Call
            </a>
            <a
              href={`https://wa.me/${whatsappNumber(row.phone)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        )}
      </div>

      <div className="text-xs text-neutral-500">{row.phone}{row.email ? ` · ${row.email}` : ""}</div>
      <p className="whitespace-pre-wrap text-sm text-neutral-700">{row.request}</p>

      <div className="space-y-3 border-t border-neutral-100 pt-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as WorkStatus)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <Textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes: when you called, what you prayed about, next steps"
        />
        <Button disabled={update.isPending} onClick={() => update.mutate()} className="bg-orange-500 text-black hover:bg-orange-600">
          Save update
        </Button>
      </div>
    </Card>
  );
}