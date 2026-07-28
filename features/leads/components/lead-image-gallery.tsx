"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  LEAD_IMAGE_PAGE_SIZE,
  type LeadImage,
} from "@/features/leads/types/lead-image.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LeadImageGalleryProps {
  leadId: string;
  refreshKey?: number;
  className?: string;
}

function LazyLeadThumb({
  item,
  onDelete,
  deleting,
}: {
  item: LeadImage;
  onDelete: (item: LeadImage) => void;
  deleting: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || started.current) return;
        started.current = true;
        setLoading(true);

        fetch(`/api/file-url?key=${encodeURIComponent(item.storage_key)}`)
          .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to get URL");
            setUrl(data.url);
          })
          .catch((err) => {
            setError(err instanceof Error ? err.message : "Could not load");
          })
          .finally(() => setLoading(false));

        observer.disconnect();
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [item.storage_key]);

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50"
    >
      <div className="aspect-square">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={item.filename}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            {error || (loading ? "Loading…" : "…")}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-slate-800 px-2 py-1.5">
        <p className="truncate text-[11px] text-slate-400">{item.filename}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => onDelete(item)}
          disabled={deleting}
          aria-label={`Delete ${item.filename}`}
          className="text-slate-400 hover:text-red-400"
        >
          {deleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

export function LeadImageGallery({
  leadId,
  refreshKey = 0,
  className,
}: LeadImageGalleryProps) {
  const [items, setItems] = useState<LeadImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef(0);

  const loadPage = useCallback(
    async (reset = false) => {
      if (reset) {
        setLoading(true);
        offsetRef.current = 0;
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        const supabase = createClient();
        const from = reset ? 0 : offsetRef.current;
        const to = from + LEAD_IMAGE_PAGE_SIZE - 1;

        const { data, error: fetchError } = await supabase
          .from("lead_images")
          .select("*")
          .eq("lead_id", leadId)
          .order("uploaded_at", { ascending: false })
          .range(from, to);

        if (fetchError) throw fetchError;

        const page = (data as LeadImage[]) ?? [];
        offsetRef.current = from + page.length;
        setHasMore(page.length === LEAD_IMAGE_PAGE_SIZE);
        setItems((prev) => (reset ? page : [...prev, ...page]));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load images");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [leadId]
  );

  useEffect(() => {
    loadPage(true);
  }, [loadPage, refreshKey]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !loadingMore && !loading) {
          loadPage(false);
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, loadPage]);

  async function handleDelete(item: LeadImage) {
    if (!confirm(`Delete "${item.filename}"?`)) return;
    setDeletingId(item.id);

    try {
      const delRes = await fetch(
        `/api/file-url?key=${encodeURIComponent(item.storage_key)}`,
        { method: "DELETE" }
      );
      const delData = await delRes.json();
      if (!delRes.ok) throw new Error(delData.error || "Storage delete failed");

      const supabase = createClient();
      const { error: dbError } = await supabase
        .from("lead_images")
        .delete()
        .eq("id", item.id);

      if (dbError) throw dbError;
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading photos…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (!items.length) {
    return (
      <p className="py-6 text-sm text-slate-400">
        No photos yet. Upload images above.
      </p>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item) => (
          <LazyLeadThumb
            key={item.id}
            item={item}
            deleting={deletingId === item.id}
            onDelete={handleDelete}
          />
        ))}
      </div>
      <div ref={sentinelRef} className="h-4" />
      {loadingMore ? (
        <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading more…
        </div>
      ) : null}
    </div>
  );
}
