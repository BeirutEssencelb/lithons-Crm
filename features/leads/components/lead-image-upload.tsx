"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadFileToB2 } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import {
  MAX_LEAD_IMAGE_BYTES,
  type LeadImage,
} from "@/features/leads/types/lead-image.types";
import { cn } from "@/lib/utils";

type UploadStatus = "pending" | "uploading" | "success" | "error";

interface SelectedFile {
  id: string;
  file: File;
  previewUrl: string;
  status: UploadStatus;
  progress: number;
  error?: string;
}

interface LeadImageUploadProps {
  leadId: string;
  onUploaded?: (image: LeadImage) => void;
  className?: string;
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

export function LeadImageUpload({
  leadId,
  onUploaded,
  className,
}: LeadImageUploadProps) {
  const inputId = useId();
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const hasPending = useMemo(
    () =>
      files.some(
        (f) => f.status === "pending" || (f.status === "error" && f.file.size > 0)
      ),
    [files]
  );

  useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revoke only on unmount
  }, []);

  const addFiles = useCallback((list: FileList | File[]) => {
    const next: SelectedFile[] = [];
    const errors: string[] = [];

    Array.from(list).forEach((file) => {
      if (!isImageFile(file)) {
        errors.push(`"${file.name}" is not an image`);
        return;
      }
      if (file.size > MAX_LEAD_IMAGE_BYTES) {
        errors.push(`"${file.name}" exceeds 10MB`);
        return;
      }
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        status: "pending",
        progress: 0,
      });
    });

    setValidationErrors(errors);
    if (next.length) setFiles((prev) => [...prev, ...next]);
  }, []);

  function removeFile(id: string) {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }

  async function uploadOne(item: SelectedFile) {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === item.id
          ? { ...f, status: "uploading", progress: 0, error: undefined }
          : f
      )
    );

    try {
      const { key } = await uploadFileToB2(
        item.file,
        `leads/${leadId}`,
        (progress) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, progress } : f))
          );
        }
      );

      const supabase = createClient();
      const { data, error } = await supabase
        .from("lead_images")
        .insert({
          lead_id: leadId,
          storage_key: key,
          filename: item.file.name,
          content_type: item.file.type || "application/octet-stream",
        })
        .select()
        .single();

      if (error) throw error;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: "success", progress: 100 } : f
        )
      );
      onUploaded?.(data as LeadImage);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: "error", error: message } : f
        )
      );
    }
  }

  async function uploadAll() {
    const queue = files.filter(
      (f) => f.status === "pending" || (f.status === "error" && f.file.size > 0)
    );
    if (!queue.length) return;

    setUploading(true);
    // Parallel uploads — partial failures don't block successes
    await Promise.all(queue.map((item) => uploadOne(item)));
    setUploading(false);
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:border-brand-500/40 hover:text-white"
        >
          <ImagePlus className="h-4 w-4 text-brand-400" />
          Select images
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          onClick={uploadAll}
          disabled={uploading || !hasPending}
          className="gap-2"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload selected
        </Button>
        <p className="text-xs text-slate-500">
          Images only · max 10MB each · uploads run in parallel
        </p>
      </div>

      {validationErrors.length > 0 ? (
        <ul className="space-y-1 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          {validationErrors.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      ) : null}

      {files.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {files.map((item) => (
            <li
              key={item.id}
              className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.previewUrl}
                alt={item.file.name}
                className="aspect-square w-full object-cover"
              />

              <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-2 text-[11px] text-slate-200">
                <p className="truncate">{item.file.name}</p>
                {item.status === "uploading" ? (
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full bg-brand-500 transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                ) : null}
                {item.status === "success" ? (
                  <p className="mt-1 flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Uploaded
                  </p>
                ) : null}
                {item.status === "error" ? (
                  <p className="mt-1 flex items-center gap-1 text-red-400">
                    <AlertCircle className="h-3 w-3" /> {item.error}
                  </p>
                ) : null}
              </div>

              {item.status === "pending" || item.status === "error" ? (
                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  className="absolute top-2 right-2 rounded-lg bg-slate-950/80 p-1 text-slate-300 hover:text-red-300"
                  aria-label="Remove"
                  disabled={uploading && item.status === "pending"}
                >
                  {item.status === "pending" ? (
                    <Trash2 className="h-3.5 w-3.5" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
