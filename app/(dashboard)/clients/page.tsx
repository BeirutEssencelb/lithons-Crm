import { createClient } from "@/lib/supabase/server";
import { ClientTable } from "@/features/clients/components/client-table";
import type { Client } from "@/features/clients/types/client.types";

async function getClients(): Promise<Client[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*, inventory:inventory_item_id(name)")
    .order("won_at", { ascending: false });

  if (error) throw error;
  return (data as Client[]) ?? [];
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
