import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatLeadStatus } from "@/lib/utils";
import type { Lead } from "@/features/leads/types/lead.types";

interface LeadTableProps {
  leads: Lead[];
}

const statusColors: Record<string, string> = {
  active: "bg-sky-500/15 text-sky-300 border-sky-500/25",
  won: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  lost: "bg-red-500/15 text-red-300 border-red-500/25",
};

/** Server-rendered list — actions live on the lead detail page to cut hydration cost. */
export function LeadTable({ leads }: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <p className="py-8 text-center text-slate-400">
        No leads found. Add your first lead to get started.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3 md:hidden">
        {leads.map((lead) => (
          <li key={lead.id}>
            <Link
              href={`/leads/${lead.id}`}
            className="block rounded-xl border border-slate-800/80 bg-slate-900/30 p-3 transition-colors active:bg-slate-800/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {lead.first_name} {lead.last_name}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-slate-400">
                    {lead.phone || lead.email || "No contact"}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={statusColors[lead.status] ?? ""}
                >
                  {formatLeadStatus(lead.status)}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>{lead.inventory?.name ?? "No product"}</span>
                <span>{lead.location || "—"}</span>
                <span>{formatDate(lead.created_at)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="hidden lg:table-cell">Location</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden xl:table-cell">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="hover:text-brand-400 hover:underline"
                  >
                    {lead.first_name} {lead.last_name}
                  </Link>
                </TableCell>
                <TableCell>{lead.email || "—"}</TableCell>
                <TableCell>{lead.phone || "—"}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {lead.location || "—"}
                </TableCell>
                <TableCell>{lead.inventory?.name ?? "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusColors[lead.status] ?? ""}
                  >
                    {formatLeadStatus(lead.status)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  {formatDate(lead.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
