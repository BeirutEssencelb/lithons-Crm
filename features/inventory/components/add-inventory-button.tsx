"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { InventoryFormDialog } from "@/features/inventory/components/inventory-form-dialog";
import { Button } from "@/components/ui/button";

export function AddInventoryButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size="sm"
        className="shrink-0 gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Add product
      </Button>
      <InventoryFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
