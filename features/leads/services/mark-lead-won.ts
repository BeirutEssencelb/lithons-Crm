import { createClient } from "@/lib/supabase/client";
import { formatLeadForSummit, pushLeadToSct } from "@/lib/push-to-sct";
import type { Lead } from "@/features/leads/types/lead.types";

/** Mark lead as won: create client, reduce inventory stock. */
export async function markLeadWon(lead: Lead): Promise<void> {
  if (!lead.inventory_item_id) {
    throw new Error("Assign a slab product before marking as won.");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in");

  const { data: inventory, error: invFetchError } = await supabase
    .from("inventory")
    .select("id, quantity")
    .eq("id", lead.inventory_item_id)
    .single();
  if (invFetchError) throw invFetchError;

  const newQuantity = Math.max(
    0,
    (inventory.quantity ?? 0) - lead.order_quantity
  );

  const { error: leadError } = await supabase
    .from("leads")
    .update({ status: "won" })
    .eq("id", lead.id);
  if (leadError) throw leadError;

  const { error: clientError } = await supabase.from("clients").insert({
    user_id: user.id,
    lead_id: lead.id,
    first_name: lead.first_name,
    last_name: lead.last_name,
    phone: lead.phone,
    email: lead.email,
    location: lead.location,
    inventory_item_id: lead.inventory_item_id,
    order_quantity: lead.order_quantity,
    note: lead.note,
  });
  if (clientError) throw clientError;

  const { error: invError } = await supabase
    .from("inventory")
    .update({ quantity: newQuantity })
    .eq("id", lead.inventory_item_id);
  if (invError) throw invError;
}

/** Push to SCT (if needed), then mark lead as won. */
export async function markLeadSctWon(lead: Lead): Promise<void> {
  if (!lead.pushed_to_sct) {
    const productName = lead.inventory?.name ?? "Unknown product";
    await pushLeadToSct(formatLeadForSummit(lead, productName));

    const supabase = createClient();
    const { error } = await supabase
      .from("leads")
      .update({ pushed_to_sct: true })
      .eq("id", lead.id);
    if (error) throw error;
  }

  await markLeadWon(lead);
}
