import { InventoryTable } from "@/features/inventory/components/inventory-table";
import { StockAlert } from "@/features/inventory/components/stock-alert";
import { SeedInventoryButton } from "@/features/inventory/components/seed-inventory-button";
import { getInventory } from "@/features/inventory/services/get-inventory";

export default async function InventoryPage() {
  const inventory = await getInventory();
  const flaggedItems = inventory.filter(
    (item) => item.quantity === 0 || item.quantity <= item.low_stock_threshold
  );

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {inventory.length} products · {flaggedItems.length} need attention
          </p>
        </div>
        {inventory.length === 0 ? <SeedInventoryButton /> : null}
      </div>

      {flaggedItems.length > 0 ? <StockAlert items={flaggedItems} /> : null}
      <InventoryTable items={inventory} />
    </div>
  );
}
