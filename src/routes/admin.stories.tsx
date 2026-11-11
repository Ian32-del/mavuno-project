import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listStories, setStoryStatus, deleteStory, type StoryRow, type StoryStatus } from "@/lib/admin.stories.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, Trash2, Undo2, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/stories")({ component: StoriesPage });

const TABS: { value: StoryStatus; label: string; empty: string }[] = [
  { value: "pending", label: "Waiting for review", empty: "Nothing waiting. New stories will appear here." },
  { value: "approved", label: "Published", empty: "No published stories yet." },
  { value: "rejected", label: "Rejected", empty: "No rejected stories." },
];

function StoriesPage() {
  const list = useServerFn(listStories);
  const setStatus = useServerFn(setStoryStatus);
  const del = useServerFn(deleteStory);
  const qc = useQueryClient();
  const { data = [], isLoading, error } = useQuery({ queryKey: ["admin-stories"], queryFn: () => list() });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-stories"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const change = useMutation({
    mutationFn: (v: { id: string; status: StoryStatus }) => setStatus({ data: v }),
    onSuccess: (_r, v) => {
      toast.success(v.status === "approved" ? "Published on the website" : v.status === "rejected" ? "Rejected" : "Moved back to review");
      refresh();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stories</h1>
        <p className="text-neutral-500">Read what people send in. Only the ones you publish appear on the website.</p>
      </div>

      {isLoading && <p className="text-neutral-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">Could not load stories. Run story_submissions.sql in Supabase first. ({(error as Error).message})</p>}

      <Tabs defaultValue="pending">
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label} ({data.filter((s: StoryRow) => s.status === t.value).length})
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => {
          const rows = data.filter((s: StoryRow) => s.status === t.value);
          return (
            <TabsContent key={t.value} value={t.value} className="space-y-4 pt-4">
              {rows.length === 0 && <p className="py-10 text-center text-neutral-500">{t.empty}</p>}
              {rows.map((s: StoryRow) => (
                <Card key={s.id} className="space-y-3 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-neutral-500">
                        {[s.ministry, s.role_label].filter(Boolean).join(" · ") || "No ministry given"}
                        {" · "}
                        {new Date(s.created_at).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}
                        {s.email && <> · {s.email}</>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {s.status !== "approved" && (
                        <Button size="sm" className="bg-orange-500 text-black hover:bg-orange-600" disabled={change.isPending} onClick={() => change.mutate({ id: s.id, status: "approved" })}>
                          <Check className="mr-1 h-4 w-4" /> Publish
                        </Button>
                      )}
                      {s.status === "pending" && (
                        <Button size="sm" variant="outline" disabled={change.isPending} onClick={() => change.mutate({ id: s.id, status: "rejected" })}>
                          <X className="mr-1 h-4 w-4" /> Reject
                        </Button>
                      )}
                      {s.status !== "pending" && (
                        <Button size="sm" variant="outline" disabled={change.isPending} onClick={() => change.mutate({ id: s.id, status: "pending" })}>
                          <Undo2 className="mr-1 h-4 w-4" /> {s.status === "approved" ? "Unpublish" : "Back to review"}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => confirm("Delete this story for good?") && remove.mutate(s.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-neutral-700">{s.story}</p>
                </Card>
              ))}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}