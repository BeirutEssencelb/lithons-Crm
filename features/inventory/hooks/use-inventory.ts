"use client";

import { useEffect, useState } from "react";
import { inventoryService } from "@/features/inventory/services/inventory.service";
import type {
  InventoryItem,
  StockAlert,
} from "@/features/inventory/types/inventory.types";

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [data, flagged] = await Promise.all([
        inventoryService.getAll(),
        inventoryService.getLowStock(),
      ]);
      setItems(data);
      setAlerts(flagged);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return { items, alerts, loading, error, refetch: fetchInventory };
}
