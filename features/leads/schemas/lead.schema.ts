import { z } from "zod";

export const leadStatusValues = ["active", "won", "lost"] as const;

export const createLeadSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").or(z.literal("")).default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  inventory_item_id: z.string().uuid().nullable().default(null),
  order_quantity: z.number().int().min(1).default(1),
  note: z.string().default(""),
  follow_up_at: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  /** YYYY-MM-DD or ISO datetime — maps to leads.created_at */
  created_at: z.string().min(1).optional(),
  status: z.enum(leadStatusValues).default("active"),
});

export const updateLeadSchema = createLeadSchema
  .partial()
  .extend({ id: z.string().uuid() });

export type CreateLeadFormData = z.input<typeof createLeadSchema>;
export type UpdateLeadFormData = z.input<typeof updateLeadSchema>;
