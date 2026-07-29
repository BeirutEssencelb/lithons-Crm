"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { MAX_LEAD_IMAGE_BYTES } from "@/features/leads/types/lead-image.types";
import { cn } from "@/lib/utils";

export interface PickedLeadImage {
  id: string;
  file: File;
  previewUrl: string;
}

interface LeadImagePickerProps {
  files: PickedLeadImage[];
  onChange: (files: PickedLeadImage[]) => void;
  className?: string;
  disabled?: boolean;
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

/** Multi-select image picker with previews (mobile / tablet / desktop). */
export function LeadImagePicker({
  files,
  onChange,
  className,
  disabled,
}: LeadImagePickerProps) {
  const inputId = useId();
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revoke on unmount only
  }, []);

  const addFiles = useCallback(
    (list: FileList | File[]) => {
      const next: PickedLeadImage[] = [];
      const nextErrors: string[] = [];

      Array.from(list).forEach((file) => {
        if (!isImageFile(file)) {
          nextErrors.push(`"${file.name}" is not an image`);
          return;
        }
        if (file.size > MAX_LEAD_IMAGE_BYTES) {
          nextErrors.push(`"${file.name}" exceeds 10MB`);
          return;
        }
        next.push({
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
          file,
          previewUrl: URL.createObjectURL(file),
        });
      });

      setErrors(nextErrors);
      if (next.length) onChange([...files, ...next]);
    },
    [files, onChange]
  );

  function removeFile(id: string) {
    const target = files.find((f) => f.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(files.filter((f) => f.id !== id));
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor={inputId}
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-slate-200",
            disabled
              ? "pointer-events-none opacity-50"
              : "hover:border-brand-500/40"
          )}
        >
          <ImagePlus className="h-4 w-4 text-brand-400" />
          Add photos
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          disabled={disabled}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="text-[11px] text-slate-500">
          Multiple images · max 10MB · stored in B2
        </p>
      </div>

      {errors.length > 0 ? (
        <ul className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-2 text-xs text-amber-200">
          {errors.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      ) : null}

      {files.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {files.map((item) => (
            <li
              key={item.id}
              className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.previewUrl}
                alt={item.file.name}
                className="aspect-square w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(item.id)}
                disabled={disabled}
                aria-label="Remove photo"
                className="absolute top-1 right-1 rounded-md bg-slate-950/80 p-1 text-slate-300 hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
