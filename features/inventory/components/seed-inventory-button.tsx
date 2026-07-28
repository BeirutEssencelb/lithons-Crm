"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Push the default 31-slab catalog into the signed-in user's inventory. */
export function SeedInventoryButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSeed() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/inventory/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to seed inventory");
      setMessage(
        data.seeded > 0
          ? `Added ${data.seeded} products`
          : data.message || "Inventory already loaded"
      );
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to seed inventory"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <Button
        type="button"
        onClick={handleSeed}
        disabled={loading}
        className="h-11 gap-2 touch-manipulation sm:h-10"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PackagePlus className="h-4 w-4" />
        )}
        Add 31 slab products
      </Button>
      {message ? (
        <p className="text-xs text-emerald-400">{message}</p>
      ) : null}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
