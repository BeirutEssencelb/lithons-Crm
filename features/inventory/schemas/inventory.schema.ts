import { z } from "zod";
import { LOW_STOCK_DEFAULT } from "@/features/inventory/types/inventory.types";

export const createInventorySchema = z.object({
  name: z.string().min(1, "Product name is required"),
  quantity: z.number().int().min(0).default(50),
  low_stock_threshold: z.number().int().min(1).default(LOW_STOCK_DEFAULT),
});

export const updateInventorySchema = createInventorySchema
  .partial()
  .extend({ id: z.string().uuid() });

export type CreateInventoryFormData = z.input<typeof createInventorySchema>;
export type UpdateInventoryFormData = z.input<typeof updateInventorySchema>;
