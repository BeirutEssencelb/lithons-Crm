"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createLeadSchema,
  type CreateLeadFormData,
} from "@/features/leads/schemas/lead.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function LeadForm() {
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

  const onSubmit = async (data: CreateLeadFormData) => {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      form.reset();
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <h2 className="mb-4 text-lg font-semibold">Add New Lead</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-400">
              First Name
            </label>
            <Input {...form.register("first_name")} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-400">
              Last Name
            </label>
            <Input {...form.register("last_name")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-400">Email</label>
            <Input type="email" {...form.register("email")} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-400">Phone</label>
            <Input {...form.register("phone")} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-400">Location</label>
          <Input {...form.register("location")} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-400">Note</label>
          <Textarea {...form.register("note")} />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Add Lead"}
        </Button>
      </form>
    </div>
  );
}
