import { createClient } from "@/lib/supabase/server";
import { ClientTable } from "@/features/clients/components/client-table";
import type { Client } from "@/features/clients/types/client.types";

const CLIENTS_PAGE_SIZE = 50;

const CLIENT_LIST_COLUMNS =
  "id, user_id, lead_id, first_name, last_name, email, phone, location, note, order_quantity, won_at, inventory_item_id, inventory:inventory_item_id(name)" as const;

async function getClients(): Promise<Client[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select(CLIENT_LIST_COLUMNS)
    .order("won_at", { ascending: false })
    .limit(CLIENTS_PAGE_SIZE);

  if (error) throw error;
  return (data as unknown as Client[]) ?? [];
}

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Clients
        </h1>
        <p className="mt-1 text-sm text-slate-400">Won leads & orders</p>
      </div>
      <ClientTable clients={clients} />
    </div>
  );
}
