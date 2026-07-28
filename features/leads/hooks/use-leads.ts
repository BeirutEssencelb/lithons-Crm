"use client";

import { useEffect, useState } from "react";
import { leadService } from "@/features/leads/services/lead.service";
import type { Lead } from "@/features/leads/types/lead.types";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await leadService.getAll();
      setLeads(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return { leads, loading, error, refetch: fetchLeads };
}
