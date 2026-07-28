"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import {
  createLeadSchema,
  type CreateLeadFormData,
} from "@/features/leads/schemas/lead.schema";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InventoryOption {
  id: string;
  name: string;
}

export function AddLeadButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryOption[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      follow_up_at: null,
      status: "active",
    },
  });

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase
      .from("inventory")
      .select("id, name")
      .order("name")
      .then(({ data }) => setInventory((data as InventoryOption[]) ?? []));
  }, [open]);

  async function onSubmit(data: CreateLeadFormData) {
    setSubmitError(null);
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = await response.json();
    if (!response.ok) {
      setSubmitError(payload.error || "Failed to add lead");
      return;
    }
    form.reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Header — visible on all breakpoints */}
      <DialogTrigger
        render={<Button className="shrink-0 gap-2" type="button" />}
      >
        <Plus className="h-4 w-4" />
        Add Lead
      </DialogTrigger>

      {/* FAB above bottom nav on mobile / tablet (lg+ uses sidebar) */}
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label="Add Lead"
            className={
              open
                ? "hidden"
                : "fixed right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/30 transition-colors hover:bg-brand-400 active:scale-95 lg:hidden"
            }
            style={{
              bottom:
                "calc(5.5rem + env(safe-area-inset-bottom, 0px))",
            }}
          />
        }
      >
        <Plus className="h-6 w-6" />
      </DialogTrigger>

      <DialogContent className="max-h-[85dvh] overflow-y-auto border-slate-800 bg-slate-900 text-slate-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Add Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {submitError ? (
            <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {submitError}
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                First Name
              </label>
              <Input className="mt-1.5" {...form.register("first_name")} />
            </div>
            <div>
              <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                Last Name
              </label>
              <Input className="mt-1.5" {...form.register("last_name")} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                Email
              </label>
              <Input
                className="mt-1.5"
                type="email"
                {...form.register("email")}
              />
            </div>
            <div>
              <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                Phone
              </label>
              <Input className="mt-1.5" {...form.register("phone")} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">
              Location
            </label>
            <Input className="mt-1.5" {...form.register("location")} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                Slab product
              </label>
              <select
                className="mt-1.5 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                value={form.watch("inventory_item_id") ?? ""}
                onChange={(e) =>
                  form.setValue(
                    "inventory_item_id",
                    e.target.value ? e.target.value : null
                  )
                }
              >
                <option value="">Select product</option>
                {inventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                Order qty
              </label>
              <Input
                className="mt-1.5"
                type="number"
                min={1}
                {...form.register("order_quantity", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">
              Note
            </label>
            <Textarea className="mt-1.5" rows={3} {...form.register("note")} />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Add Lead"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
