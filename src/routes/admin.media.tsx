import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listSiteImages, setSiteImage, type SiteImageRow } from "@/lib/admin.featured.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageIcon, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "@/components/admin/upload";

export const Route = createFileRoute("/admin/media")({ component: FeaturedPhotosPage });

function FeaturedPhotosPage() {
  const list = useServerFn(listSiteImages);
  const save = useServerFn(setSiteImage);
  const qc = useQueryClient();
  const { data = [], isLoading, error } = useQuery({ queryKey: ["admin-site-images"], queryFn: () => list() });

  const update = useMutation({
    mutationFn: (v: { slot: string; image_url: string | null }) => save({ data: v }),
    onSuccess: (_r, v) => {
      toast.success(v.image_url ? "Photo updated. It is live on the site." : "Back to the default photo");
      qc.invalidateQueries({ queryKey: ["admin-site-images"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Featured photos</h1>
        <p className="text-neutral-500">
          Change the main photos on the website. Upload a new one and it goes live straight away. Remove it to go back to the original.
        </p>
      </div>

      {isLoading && <p className="text-neutral-500">Loading...</p>}
      {error && (
        <p className="text-red-600 text-sm">
          Could not load the photo spots. Run the site_images.sql script in Supabase first. ({(error as Error).message})
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.map((row: SiteImageRow) => (
          <Card key={row.slot} className="overflow-hidden">
            <div className="aspect-video bg-neutral-100">
              {row.image_url ? (
                <img src={row.image_url} alt={row.alt ?? row.label} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-neutral-400">
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-xs">Using the original photo</span>
                </div>
              )}
            </div>
            <div className="space-y-3 p-4">
              <div>
                <div className="font-semibold">{row.label}</div>
                {row.hint && <div className="text-xs text-neutral-500">{row.hint}</div>}
              </div>
              <div className="flex items-center gap-2">
                <FileUpload
                  bucket="ministry-gallery"
                  accept="image/*"
                  label={row.image_url ? "Change photo" : "Upload photo"}
                  onUploaded={(url) => update.mutate({ slot: row.slot, image_url: url })}
                />
                {row.image_url && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={update.isPending}
                    onClick={() => confirm("Go back to the original photo?") && update.mutate({ slot: row.slot, image_url: null })}
                  >
                    <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}