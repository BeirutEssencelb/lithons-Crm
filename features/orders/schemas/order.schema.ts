import { z } from "zod";

export const orderStatusValues = [
  "draft",
  "confirmed",
  "delivered",
  "invoiced",
  "paid",
] as const;

export const orderItemSchema = z.object({
  inventory_id: z.string().uuid(),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unit_price: z.number().min(0, "Price cannot be negative"),
});

export const createOrderSchema = z.object({
  client_id: z.string().uuid(),
  order_number: z.string().min(1, "Order number is required"),
  status: z.enum(orderStatusValues).default("draft"),
  total_amount: z.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export const updateOrderSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(orderStatusValues).optional(),
  notes: z.string().optional(),
  total_amount: z.number().min(0).optional(),
});

export const generateInvoiceSchema = z.object({
  order_id: z.string().uuid(),
  due_days: z.number().int().min(1).default(30),
});

export type CreateOrderFormData = z.input<typeof createOrderSchema>;
export type UpdateOrderFormData = z.input<typeof updateOrderSchema>;
export type GenerateInvoiceFormData = z.input<typeof generateInvoiceSchema>;
