"use client";

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
import { LeadPushSctButton } from "@/features/leads/components/lead-push-sct-button";
import { LeadWonActions } from "@/features/leads/components/lead-won-actions";

interface LeadTableProps {
  leads: Lead[];
}

const statusColors: Record<string, string> = {
  active: "bg-sky-500/15 text-sky-300 border-sky-500/25",
  won: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  lost: "bg-red-500/15 text-red-300 border-red-500/25",
};

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
      {/* Mobile / tablet cards */}
      <ul className="space-y-3 md:hidden">
        {leads.map((lead) => (
          <li
            key={lead.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
          >
            <Link
              href={`/leads/${lead.id}`}
              className="block transition-colors active:opacity-80"
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
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-800/80 pt-3">
              <LeadPushSctButton lead={lead} />
              <LeadWonActions lead={lead} />
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop table */}
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
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-2">
                    <LeadPushSctButton lead={lead} />
                    <LeadWonActions lead={lead} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
