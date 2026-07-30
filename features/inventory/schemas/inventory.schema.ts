import { z } from "zod";
import { LOW_STOCK_DEFAULT } from "@/features/inventory/types/inventory.types";

export const createInventorySchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  low_stock_threshold: z.coerce
    .number()
    .int()
    .min(1, "Low stock threshold must be at least 1"),
});

export const updateInventorySchema = createInventorySchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateInventoryFormData = z.infer<typeof createInventorySchema>;
export type UpdateInventoryFormData = z.infer<typeof updateInventorySchema>;

export { LOW_STOCK_DEFAULT };
