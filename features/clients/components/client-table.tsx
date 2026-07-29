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
import { ArchiveClientButton } from "@/features/clients/components/archive-client-button";

interface ClientTableProps {
  clients: Client[];
}

export function ClientTable({ clients }: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <p className="py-8 text-center text-slate-400">
        No clients found. Win some leads to build your client base!
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3 md:hidden">
        {clients.map((client) => {
          const name = `${client.first_name} ${client.last_name}`.trim();
          return (
            <li
              key={client.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{name}</p>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {client.phone || client.email || "No contact"}
                  </p>
                </div>
                <ArchiveClientButton clientId={client.id} clientName={name} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>{client.inventory?.name ?? "No product"}</span>
                <span>
                  {client.order_quantity} slab
                  {client.order_quantity !== 1 ? "s" : ""}
                </span>
                <span>{formatDate(client.won_at)}</span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden lg:table-cell">Phone</TableHead>
              <TableHead className="hidden xl:table-cell">Location</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Order qty</TableHead>
              <TableHead>Sold</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => {
              const name = `${client.first_name} ${client.last_name}`.trim();
              return (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{name}</TableCell>
                  <TableCell>{client.email || "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {client.phone || "—"}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {client.location || "—"}
                  </TableCell>
                  <TableCell>{client.inventory?.name ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {client.order_quantity}
                  </TableCell>
                  <TableCell>{formatDate(client.won_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <ArchiveClientButton
                        clientId={client.id}
                        clientName={name}
                      />
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
