"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { leadService } from "@/features/leads/services/lead.service";
import { Button } from "@/components/ui/button";

interface DeleteLeadButtonProps {
  leadId: string;
  leadName: string;
}

export function DeleteLeadButton({ leadId, leadName }: DeleteLeadButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const ok = window.confirm(
      `Delete lead "${leadName}"? This cannot be undone. Photos for this lead will also be removed.`
    );
    if (!ok) return;

    setLoading(true);
    setError(null);
    try {
      await leadService.delete(leadId);
      router.push("/leads");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete lead");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-1 sm:items-end">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => void handleDelete()}
        disabled={loading}
        className="gap-1.5"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
        {loading ? "Deleting..." : "Delete lead"}
      </Button>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
