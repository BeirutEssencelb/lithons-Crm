"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { inventoryService } from "@/features/inventory/services/inventory.service";
import { InventoryFormDialog } from "@/features/inventory/components/inventory-form-dialog";
import type { InventoryItem } from "@/features/inventory/types/inventory.types";
import { Button } from "@/components/ui/button";

interface InventoryRowActionsProps {
  item: InventoryItem;
}

export function InventoryRowActions({ item }: InventoryRowActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const ok = window.confirm(
      `Delete "${item.name}"? Leads using this product will keep their link cleared.`
    );
    if (!ok) return;

    setDeleting(true);
    setError(null);
    try {
      await inventoryService.delete(item.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1 border-slate-700 px-2 text-slate-300 hover:bg-slate-800"
          onClick={() => setEditOpen(true)}
          disabled={deleting}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="h-8 gap-1 px-2"
          onClick={() => void handleDelete()}
          disabled={deleting}
        >
          {deleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
          Delete
        </Button>
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <InventoryFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        item={item}
      />
    </div>
  );
}
