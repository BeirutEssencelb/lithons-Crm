import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/features/clients/types/client.types";

const supabase = createClient();

/** Orders are represented by won clients in the live schema. */
export const orderService = {
  async getAll(): Promise<Client[]> {
    const { data, error } = await supabase
      .from("clients")
      .select("*, inventory:inventory_item_id(name)")
      .is("archived_at", null)
      .order("won_at", { ascending: false });
    if (error) throw error;
    return (data as Client[]) ?? [];
  },
};
