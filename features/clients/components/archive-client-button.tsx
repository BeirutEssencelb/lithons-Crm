"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Loader2 } from "lucide-react";
import { archiveClient } from "@/features/clients/services/archive-client";
import { Button } from "@/components/ui/button";

interface ArchiveClientButtonProps {
  clientId: string;
  clientName: string;
  className?: string;
}

export function ArchiveClientButton({
  clientId,
  clientName,
  className,
}: ArchiveClientButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleArchive() {
    const ok = window.confirm(
      `Archive client "${clientName}"? They will be hidden from the clients and orders lists.`
    );
    if (!ok) return;

    setLoading(true);
    setError(null);
    try {
      await archiveClient(clientId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive client");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void handleArchive()}
        disabled={loading}
        className="gap-1.5 border-slate-700 text-slate-300 hover:bg-slate-800"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Archive className="h-3.5 w-3.5" />
        )}
        {loading ? "Archiving..." : "Archive"}
      </Button>
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
