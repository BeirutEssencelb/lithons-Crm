export type LeadStatus = "active" | "won" | "lost";

export interface Lead {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  location: string;
  inventory_item_id: string | null;
  order_quantity: number;
  note: string;
  follow_up_at: string | null;
  status: LeadStatus;
  pushed_to_sct: boolean;
  created_at: string;
  inventory?: { name: string } | null;
}

export type CreateLeadInput = Omit<
  Lead,
  "id" | "user_id" | "created_at" | "pushed_to_sct" | "inventory"
>;
export type UpdateLeadInput = Partial<CreateLeadInput> & { id: string };
