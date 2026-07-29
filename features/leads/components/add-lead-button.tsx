"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const AddLeadDialog = dynamic(
  () =>
    import("@/features/leads/components/add-lead-dialog").then((m) => ({
      default: m.AddLeadDialog,
    })),
  { ssr: false }
);

/** Lightweight trigger — dialog/form JS loads only when opened. */
export function AddLeadButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Prefetch is handled by dynamic(); keep open state controlled.
  }, [open]);

  return (
    <>
      <Button
        type="button"
        size="sm"
        className="shrink-0 gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Add
      </Button>
      {open ? <AddLeadDialog open={open} onOpenChange={setOpen} /> : null}
    </>
  );
}
