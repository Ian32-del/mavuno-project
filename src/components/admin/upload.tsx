import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { createUploadPath } from "@/lib/admin.functions";
import { toast } from "sonner";

type Bucket = "event-images" | "ministry-gallery" | "sermons" | "resources";

export function FileUpload({ bucket, accept, onUploaded, label = "Upload file" }: {
  bucket: Bucket;
  accept?: string;
  onUploaded: (publicUrl: string, path: string) => void;
  label?: string;
}) {
  const createPath = useServerFn(createUploadPath);
  const [progress, setProgress] = useState<number | null>(null);

  async function handleFile(file: File) {
    setProgress(1);
    try {
      const { signedUrl, publicUrl, path } = await createPath({ data: { bucket, filename: file.name } });
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100));
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed")));
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
      });
      onUploaded(publicUrl, path);
      toast.success("Uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm" type="button">
          <span className="cursor-pointer"><Upload className="h-4 w-4 mr-2" />{label}</span>
        </Button>
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </label>
      {progress !== null && <Progress value={progress} className="h-1" />}
    </div>
  );
}

// Wrap in label for click behavior