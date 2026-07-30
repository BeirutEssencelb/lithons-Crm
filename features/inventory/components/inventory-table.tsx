import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { InventoryItem } from "@/features/inventory/types/inventory.types";
import { InventoryRowActions } from "@/features/inventory/components/inventory-row-actions";

interface InventoryTableProps {
  items: InventoryItem[];
}

function stockStatus(qty: number, threshold: number) {
  if (qty === 0)
    return { label: "Out of stock", variant: "destructive" as const };
  if (qty <= threshold)
    return { label: "Low stock", variant: "destructive" as const };
  return { label: "In stock", variant: "secondary" as const };
}

export function InventoryTable({ items }: InventoryTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-4 py-10 text-center">
        <p className="text-slate-300">No inventory items yet.</p>
        <p className="mt-1 text-sm text-slate-500">
          Add a product, or use “Add 31 slab products” to load the default
          catalog.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-3 md:hidden">
        {items.map((item) => {
          const status = stockStatus(item.quantity, item.low_stock_threshold);
          return (
            <li
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 font-medium">{item.name}</p>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>{item.quantity} slabs</span>
                <span>Low at {item.low_stock_threshold}</span>
              </div>
              <div className="mt-3 flex justify-end">
                <InventoryRowActions item={item} />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Low stock at</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const status = stockStatus(
                item.quantity,
                item.low_stock_threshold
              );
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">
                    {item.quantity} slabs
                  </TableCell>
                  <TableCell className="text-right">
                    {item.low_stock_threshold}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <InventoryRowActions item={item} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
