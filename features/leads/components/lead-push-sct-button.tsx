"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatLeadForSummit, pushLeadToSct } from "@/lib/push-to-sct";
import { Button } from "@/components/ui/button";
import type { Lead } from "@/features/leads/types/lead.types";

interface LeadPushSctButtonProps {
  lead: Lead;
  className?: string;
}

export function LeadPushSctButton({ lead, className }: LeadPushSctButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (lead.pushed_to_sct) {
    return (
      <span className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
        Sent to SCT
      </span>
    );
  }

  async function handlePush() {
    setLoading(true);
    setError(null);

    try {
      const productName = lead.inventory?.name ?? "Unknown product";
      const payload = formatLeadForSummit(lead, productName);
      await pushLeadToSct(payload);

      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("leads")
        .update({ pushed_to_sct: true })
        .eq("id", lead.id);
      if (updateError) throw updateError;

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to push lead to SCT"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={handlePush}
        disabled={loading}
        className={className ?? "gap-2"}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {loading ? "Pushing..." : "Push SCT"}
      </Button>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
