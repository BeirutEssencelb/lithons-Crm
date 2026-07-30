"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createLeadSchema,
  type CreateLeadFormData,
} from "@/features/leads/schemas/lead.schema";
import { uploadLeadImagesToB2 } from "@/features/leads/services/upload-lead-images";
import {
  LeadImagePicker,
  type PickedLeadImage,
} from "@/features/leads/components/lead-image-picker";
import {
  ProductCombobox,
  type ProductOption,
} from "@/features/leads/components/product-combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ProductOption[];
}

export function AddLeadDialog({
  open,
  onOpenChange,
  products,
}: AddLeadDialogProps) {
  const router = useRouter();
  const [images, setImages] = useState<PickedLeadImage[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const form = useForm<CreateLeadFormData>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      location: "",
      inventory_item_id: null,
      order_quantity: 1,
      note: "",
      follow_up_at: "",
      created_at: today,
      status: "active",
    },
  });

  const inventoryItemId = useWatch({
    control: form.control,
    name: "inventory_item_id",
  });

  function clearImages() {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
  }

  async function onSubmit(data: CreateLeadFormData) {
    setSubmitError(null);
    setUploadStatus(null);
    setSaving(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to add lead");
      }

      const leadId = payload.id as string;

      if (images.length > 0 && leadId) {
        setUploadStatus(`Uploading 0/${images.length} photos…`);
        const result = await uploadLeadImagesToB2(
          leadId,
          images,
          (done, total) => {
            setUploadStatus(`Uploading ${done}/${total} photos…`);
          }
        );

        if (result.failed > 0 && result.uploaded === 0) {
          setSubmitError(
            `Lead saved, but photos failed: ${result.errors.join("; ")}`
          );
          setSaving(false);
          router.refresh();
          return;
        }

        if (result.failed > 0) {
          setUploadStatus(
            `Lead saved · ${result.uploaded} photos uploaded · ${result.failed} failed`
          );
        }
      }

      form.reset({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        location: "",
        inventory_item_id: null,
        order_quantity: 1,
        note: "",
        follow_up_at: "",
        created_at: new Date().toISOString().slice(0, 10),
        status: "active",
      });
      clearImages();
      onOpenChange(false);
      router.refresh();
      if (leadId) router.push(`/leads/${leadId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to add lead");
    } finally {
      setSaving(false);
      setUploadStatus(null);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (saving) return;
        if (!next) clearImages();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[85dvh] overflow-y-auto border-slate-800 bg-slate-900 text-slate-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Add Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {submitError ? (
            <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {submitError}
            </p>
          ) : null}
          {uploadStatus ? (
            <p className="rounded-lg border border-brand-500/25 bg-brand-500/10 px-3 py-2 text-sm text-brand-200">
              {uploadStatus}
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">First name</label>
              <Input
                className="mt-1"
                disabled={saving}
                {...form.register("first_name")}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Last name</label>
              <Input
                className="mt-1"
                disabled={saving}
                {...form.register("last_name")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">Email</label>
              <Input
                className="mt-1"
                type="email"
                disabled={saving}
                {...form.register("email")}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Phone</label>
              <Input
                className="mt-1"
                disabled={saving}
                {...form.register("phone")}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400">Location</label>
            <Input
              className="mt-1"
              disabled={saving}
              {...form.register("location")}
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Product</label>
            <ProductCombobox
              options={products}
              value={inventoryItemId ?? null}
              disabled={saving}
              onChange={(id) =>
                form.setValue("inventory_item_id", id, {
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Qty</label>
            <Input
              className="mt-1"
              type="number"
              min={1}
              disabled={saving}
              {...form.register("order_quantity", { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">Lead date</label>
              <Input
                className="mt-1"
                type="date"
                disabled={saving}
                {...form.register("created_at")}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Follow-up date</label>
              <Input
                className="mt-1"
                type="date"
                disabled={saving}
                {...form.register("follow_up_at")}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400">Note</label>
            <Textarea
              className="mt-1"
              rows={2}
              disabled={saving}
              {...form.register("note")}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-slate-400">Photos</label>
            <LeadImagePicker
              files={images}
              onChange={setImages}
              disabled={saving}
            />
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving
              ? images.length
                ? "Saving lead & photos…"
                : "Saving…"
              : images.length
                ? `Add Lead (${images.length} photo${images.length === 1 ? "" : "s"})`
                : "Add Lead"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
