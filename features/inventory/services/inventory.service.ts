import { createClient } from "@/lib/supabase/client";
import type {
  InventoryItem,
  CreateInventoryInput,
  UpdateInventoryInput,
  StockAlert,
} from "@/features/inventory/types/inventory.types";

const supabase = createClient();

export const inventoryService = {
  async getAll(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async getLowStock(): Promise<StockAlert[]> {
    const { data, error } = await supabase
      .from("inventory")
      .select("id, name, quantity, low_stock_threshold")
      .order("quantity", { ascending: true });
    if (error) throw error;
    return (data ?? []).filter(
      (item) => item.quantity === 0 || item.quantity <= item.low_stock_threshold
    );
  },

  async create(input: CreateInventoryInput): Promise<InventoryItem> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be signed in");

    const { data, error } = await supabase
      .from("inventory")
      .insert({ ...input, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(input: UpdateInventoryInput): Promise<InventoryItem> {
    const { id, ...updates } = input;
    const { data, error } = await supabase
      .from("inventory")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("inventory").delete().eq("id", id);
    if (error) throw error;
  },
};
