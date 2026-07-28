import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_SLAB_LOW_STOCK,
  DEFAULT_SLAB_PRODUCTS,
  DEFAULT_SLAB_QUANTITY,
} from "@/features/inventory/data/default-products";

/** Seed the default 31 slab products for the signed-in user (no-op if already stocked). */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { count, error: countError } = await supabase
    .from("inventory")
    .select("id", { count: "exact", head: true });

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json({
      seeded: 0,
      total: count,
      message: "Inventory already has products",
    });
  }

  const { error: rpcError } = await supabase.rpc("seed_default_inventory");
  if (!rpcError) {
    return NextResponse.json({
      seeded: DEFAULT_SLAB_PRODUCTS.length,
      message: "Seeded via seed_default_inventory()",
    });
  }

  const rows = DEFAULT_SLAB_PRODUCTS.map((name) => ({
    user_id: user.id,
    name,
    quantity: DEFAULT_SLAB_QUANTITY,
    low_stock_threshold: DEFAULT_SLAB_LOW_STOCK,
  }));

  const { error: insertError } = await supabase.from("inventory").insert(rows);
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    seeded: rows.length,
    message: "Seeded default slab catalog",
  });
}
