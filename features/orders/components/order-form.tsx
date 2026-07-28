"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrderSchema, type CreateOrderFormData } from "@/features/orders/schemas/order.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import type { InventoryItem } from "@/features/inventory/types/inventory.types";
import type { Client } from "@/features/clients/types/client.types";

interface OrderFormProps {
  inventory: InventoryItem[];
  clients: Client[];
}

export function OrderForm({ inventory, clients }: OrderFormProps) {
  const [orderNumber, setOrderNumber] = useState(
    `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
  );

  const form = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      client_id: "",
      order_number: orderNumber,
      status: "draft",
      total_amount: 0,
      notes: "",
      items: [{ inventory_id: "", quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch("items");

  const totalAmount = watchItems.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unit_price || 0);
  }, 0);

  const handleInventorySelect = (index: number, inventoryId: string) => {
    const selectedItem = inventory.find((i) => i.id === inventoryId);
    if (selectedItem) {
      // Live inventory has no unit_price column — keep manual price entry.
      form.setValue(`items.${index}.inventory_id`, inventoryId);
      form.setValue(`items.${index}.unit_price`, 0);
    }
  };

  const onSubmit = async (data: CreateOrderFormData) => {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, total_amount: totalAmount }),
    });
    if (response.ok) {
      form.reset();
      setOrderNumber(
        `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Order Meta */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Order Number</label>
              <Input value={orderNumber} readOnly />
              <input
                type="hidden"
                {...form.register("order_number")}
                value={orderNumber}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Client</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...form.register("client_id")}
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                    {c.email ? ` — ${c.email}` : ""}
                  </option>
                ))}
              </select>
              {form.formState.errors.client_id && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.client_id.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input {...form.register("notes")} placeholder="Order notes..." />
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Order Items</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  append({ inventory_id: "", quantity: 1, unit_price: 0 })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="w-32">Quantity</TableHead>
                  <TableHead className="w-32">Unit Price</TableHead>
                  <TableHead className="w-32 text-right">Subtotal</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        {...form.register(`items.${index}.inventory_id`)}
                        onChange={(e) => {
                          form.setValue(
                            `items.${index}.inventory_id`,
                            e.target.value
                          );
                          handleInventorySelect(index, e.target.value);
                        }}
                      >
                        <option value="">Select product...</option>
                        {inventory.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.quantity} slabs)
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register(`items.${index}.unit_price`, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(
                        (watchItems[index]?.quantity || 0) *
                          (watchItems[index]?.unit_price || 0)
                      )}
                    </TableCell>
                    <TableCell>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Total & Submit */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-lg font-bold">
              Total: {formatCurrency(totalAmount)}
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
