"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Trophy, Loader2 } from "lucide-react";
import { markLeadSctWon, markLeadWon } from "@/features/leads/services/mark-lead-won";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Lead } from "@/features/leads/types/lead.types";

interface LeadWonActionsProps {
  lead: Lead;
  /** Show floating action buttons on mobile/tablet */
  showFabs?: boolean;
}

export function LeadWonActions({ lead, showFabs = false }: LeadWonActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"sct" | "other" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (lead.status === "won") {
    return (
      <span className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
        Slab sold
        {lead.pushed_to_sct ? " · SCT" : ""}
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
      setError(
        err instanceof Error
          ? err.message
          : kind === "sct"
            ? "Failed to mark SCT won"
            : "Failed to mark other won"
      );
    } finally {
      setLoading(null);
    }
  }

  const fabBase =
    "fixed z-[60] flex h-14 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-white shadow-lg transition-colors active:scale-95 lg:hidden";

  return (
    <>
      <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
        <div
          className={cn(
            "flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end",
            showFabs && "hidden lg:flex"
          )}
        >
          <Button
            type="button"
            onClick={() => void run("sct")}
            disabled={loading !== null}
            className="gap-2 bg-violet-600 text-white hover:bg-violet-500"
          >
            {loading === "sct" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            SCT won
          </Button>
          <Button
            type="button"
            onClick={() => void run("other")}
            disabled={loading !== null}
            className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500"
          >
            {loading === "other" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trophy className="h-4 w-4" />
            )}
            Other won
          </Button>
        </div>
        {error ? (
          <p className="text-xs text-red-400 sm:text-right">{error}</p>
        ) : null}
      </div>

      {showFabs ? (
        <>
          <button
            type="button"
            aria-label="SCT won"
            onClick={() => void run("sct")}
            disabled={loading !== null}
            className={cn(
              fabBase,
              "right-4 bg-violet-600 shadow-violet-600/30 hover:bg-violet-500 disabled:opacity-50"
            )}
            style={{
              bottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))",
            }}
          >
            {loading === "sct" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            SCT won
          </button>
          <button
            type="button"
            aria-label="Other won"
            onClick={() => void run("other")}
            disabled={loading !== null}
            className={cn(
              fabBase,
              "right-4 bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50"
            )}
            style={{
              bottom: "calc(9.25rem + env(safe-area-inset-bottom, 0px))",
            }}
          >
            {loading === "other" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trophy className="h-4 w-4" />
            )}
            Other won
          </button>
        </>
      ) : null}
    </>
  );
}
