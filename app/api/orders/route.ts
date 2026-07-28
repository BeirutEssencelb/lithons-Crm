import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Live schema has no `orders` table — orders are won clients with product qty.
 */
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*, inventory:inventory_item_id(name)")
    .order("won_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
