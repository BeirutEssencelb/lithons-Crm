export interface Client {
  id: string;
  user_id: string;
  lead_id: string | null;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  location: string;
  inventory_item_id: string | null;
  order_quantity: number;
  note: string;
  won_at: string;
  archived_at: string | null;
  inventory?: { name: string } | null;
}

export type CreateClientInput = Omit<
  Client,
  "id" | "user_id" | "won_at" | "archived_at" | "inventory"
>;
export type UpdateClientInput = Partial<CreateClientInput> & { id: string };
