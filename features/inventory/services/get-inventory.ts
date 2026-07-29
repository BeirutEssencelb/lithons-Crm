import { createClient } from "@/lib/supabase/server";
import type { InventoryItem } from "@/features/inventory/types/inventory.types";

const INVENTORY_LIST_COLUMNS =
  "id, user_id, name, quantity, low_stock_threshold, created_at" as const;

/** Fast inventory read — no seed work on page load. */
export async function getInventory(): Promise<InventoryItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory")
    .select(INVENTORY_LIST_COLUMNS)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data as InventoryItem[]) ?? [];
}
