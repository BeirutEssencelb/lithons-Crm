"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductOption } from "@/features/leads/components/product-combobox";

const loadAddLeadDialog = () =>
  import("@/features/leads/components/add-lead-dialog").then((m) => ({
    default: m.AddLeadDialog,
  }));

const AddLeadDialog = dynamic(loadAddLeadDialog, { ssr: false });

interface AddLeadButtonProps {
  products: ProductOption[];
}

/** Prefetches dialog chunk so open feels instant; products come from the server. */
export function AddLeadButton({ products }: AddLeadButtonProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAddLeadDialog();
    }, 150);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <Button
        type="button"
        size="sm"
        className="shrink-0 gap-1.5"
        onMouseEnter={() => void loadAddLeadDialog()}
        onFocus={() => void loadAddLeadDialog()}
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
      >
        <Plus className="h-4 w-4" />
        Add
      </Button>
      {mounted ? (
        <AddLeadDialog
          open={open}
          onOpenChange={setOpen}
          products={products}
        />
      ) : null}
    </>
  );
}
