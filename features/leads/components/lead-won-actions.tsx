"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Trophy, Loader2 } from "lucide-react";
import {
  markLeadSctWon,
  markLeadWon,
} from "@/features/leads/services/mark-lead-won";
import { Button } from "@/components/ui/button";
import type { Lead } from "@/features/leads/types/lead.types";

interface LeadWonActionsProps {
  lead: Lead;
  /** @deprecated FABs removed for a lighter UI */
  showFabs?: boolean;
}

export function LeadWonActions({ lead }: LeadWonActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"sct" | "other" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (lead.status === "won") {
    return (
      <span className="text-sm text-emerald-400">
        Slab sold{lead.pushed_to_sct ? " · SCT" : ""}
      </span>
    );
  }

  if (lead.status !== "active") return null;

  async function run(kind: "sct" | "other") {
    setLoading(kind);
    setError(null);
    try {
      if (kind === "sct") await markLeadSctWon(lead);
      else await markLeadWon(lead);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => void run("sct")}
          disabled={loading !== null}
          className="gap-1.5 bg-violet-600 hover:bg-violet-500"
        >
          {loading === "sct" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          SCT won
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => void run("other")}
          disabled={loading !== null}
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-500"
        >
          {loading === "other" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trophy className="h-3.5 w-3.5" />
          )}
          Other won
        </Button>
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
