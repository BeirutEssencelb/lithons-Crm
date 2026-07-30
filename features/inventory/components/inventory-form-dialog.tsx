"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createInventorySchema,
  type CreateInventoryFormData,
  LOW_STOCK_DEFAULT,
} from "@/features/inventory/schemas/inventory.schema";
import { inventoryService } from "@/features/inventory/services/inventory.service";
import type { InventoryItem } from "@/features/inventory/types/inventory.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InventoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
}

export function InventoryFormDialog({
  open,
  onOpenChange,
  item = null,
}: InventoryFormDialogProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(item);

  const form = useForm<CreateInventoryFormData>({
    resolver: zodResolver(createInventorySchema),
    defaultValues: {
      name: "",
      quantity: 50,
      low_stock_threshold: LOW_STOCK_DEFAULT,
    },
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (item) {
      form.reset({
        name: item.name,
        quantity: item.quantity,
        low_stock_threshold: item.low_stock_threshold,
      });
    } else {
      form.reset({
        name: "",
        quantity: 50,
        low_stock_threshold: LOW_STOCK_DEFAULT,
      });
    }
  }, [open, item, form]);

  async function onSubmit(data: CreateInventoryFormData) {
    setSaving(true);
    setError(null);
    try {
      if (item) {
        await inventoryService.update({ id: item.id, ...data });
      } else {
        await inventoryService.create(data);
      }
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEdit
            ? "Failed to update product"
            : "Failed to add product"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-100">
            {isEdit ? "Edit product" : "Add product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {error ? (
            <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          ) : null}

          <div>
            <label className="text-xs text-slate-400">Product name</label>
            <Input
              className="mt-1"
              disabled={saving}
              placeholder="e.g. Grainy White"
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="mt-1 text-xs text-red-400">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">Quantity</label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                disabled={saving}
                {...form.register("quantity")}
              />
              {form.formState.errors.quantity ? (
                <p className="mt-1 text-xs text-red-400">
                  {form.formState.errors.quantity.message}
                </p>
              ) : null}
            </div>
            <div>
              <label className="text-xs text-slate-400">Low stock at</label>
              <Input
                className="mt-1"
                type="number"
                min={1}
                disabled={saving}
                {...form.register("low_stock_threshold")}
              />
              {form.formState.errors.low_stock_threshold ? (
                <p className="mt-1 text-xs text-red-400">
                  {form.formState.errors.low_stock_threshold.message}
                </p>
              ) : null}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving
              ? isEdit
                ? "Saving…"
                : "Adding…"
              : isEdit
                ? "Save changes"
                : "Add product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
