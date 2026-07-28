import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { Client } from "@/features/clients/types/client.types";

/**
 * Live Supabase has no separate `orders` table.
 * Orders are stored on won clients (product + order_quantity).
 */
async function getClientOrders(): Promise<Client[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*, inventory:inventory_item_id(name)")
    .order("won_at", { ascending: false });

  if (error) throw error;
  return (data as Client[]) ?? [];
}

export default async function OrdersPage() {
  const orders = await getClientOrders();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-slate-400">
          Client orders from sold slabs
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="py-8 text-center text-slate-400">
          No orders yet. Mark a lead as Slab sold to create one.
        </p>
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {orders.map((order) => (
              <li
                key={order.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
              >
                <p className="font-medium">
                  {order.first_name} {order.last_name}
                </p>
                <p className="mt-0.5 text-sm text-slate-400">
                  {order.inventory?.name ?? "No product"}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>
                    {order.order_quantity} slab
                    {order.order_quantity !== 1 ? "s" : ""}
                  </span>
                  <span>{order.location || "—"}</span>
                  <span>{formatDate(order.won_at)}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead>Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.first_name} {order.last_name}
                    </TableCell>
                    <TableCell>{order.inventory?.name ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      {order.order_quantity} slabs
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {order.location || "—"}
                    </TableCell>
                    <TableCell>{formatDate(order.won_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
