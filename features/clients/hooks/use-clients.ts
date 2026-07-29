"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/features/clients/types/client.types";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClients() {
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("clients")
          .select("*, inventory:inventory_item_id(name)")
          .is("archived_at", null)
          .order("won_at", { ascending: false });

        if (fetchError) throw fetchError;
        setClients((data as Client[]) ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load clients");
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, []);

  return { clients, loading, error };
}
