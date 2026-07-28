import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_SLAB_LOW_STOCK,
  DEFAULT_SLAB_PRODUCTS,
  DEFAULT_SLAB_QUANTITY,
} from "@/features/inventory/data/default-products";
import type { InventoryItem } from "@/features/inventory/types/inventory.types";

/**
 * Load inventory for the signed-in user.
 * If empty, seed the default 31 slab products (50 each).
 */
export async function getOrSeedInventory(): Promise<InventoryItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;

  let items = (data as InventoryItem[]) ?? [];
  if (items.length > 0 || !user) return items;

  // Prefer DB RPC if available (idempotent)
  const { error: rpcError } = await supabase.rpc("seed_default_inventory");
  if (!rpcError) {
    const { data: seeded, error: reloadError } = await supabase
      .from("inventory")
      .select("*")
      .order("name", { ascending: true });
    if (reloadError) throw reloadError;
    return (seeded as InventoryItem[]) ?? [];
  }

  // Fallback: direct insert (same catalog as Vite app)
  const rows = DEFAULT_SLAB_PRODUCTS.map((name) => ({
    user_id: user.id,
    name,
    quantity: DEFAULT_SLAB_QUANTITY,
    low_stock_threshold: DEFAULT_SLAB_LOW_STOCK,
  }));

  const { error: insertError } = await supabase.from("inventory").insert(rows);
  if (insertError) throw insertError;

  const { data: seeded, error: reloadError } = await supabase
    .from("inventory")
    .select("*")
    .order("name", { ascending: true });
  if (reloadError) throw reloadError;

  return (seeded as InventoryItem[]) ?? [];
}
