import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatLeadStatus } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Lead } from "@/features/leads/types/lead.types";
import { LeadPhotosLazy } from "@/features/leads/components/lead-photos-lazy";
import { LeadPushSctButton } from "@/features/leads/components/lead-push-sct-button";
import { LeadWonActions } from "@/features/leads/components/lead-won-actions";
import { DeleteLeadButton } from "@/features/leads/components/delete-lead-button";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getLead(id: string): Promise<Lead | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*, inventory:inventory_item_id(name)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as Lead) ?? null;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  const statusColors: Record<string, string> = {
    active: "bg-sky-500/15 text-sky-300 border-sky-500/25",
    won: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    lost: "bg-red-500/15 text-red-300 border-red-500/25",
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/leads"
            className="text-sm text-slate-400 hover:text-brand-400"
          >
            ← Back to leads
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight break-words sm:text-3xl">
            {lead.first_name} {lead.last_name}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Created {formatDate(lead.created_at)}
          </p>
        </div>
        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:items-end">
          <Badge
            variant="outline"
            className={`w-fit ${statusColors[lead.status] ?? ""}`}
          >
            {formatLeadStatus(lead.status)}
          </Badge>
          <div className="w-full sm:w-auto [&_button]:w-full sm:[&_button]:w-auto">
            <LeadPushSctButton lead={lead} />
          </div>
          <LeadWonActions lead={lead} />
          <DeleteLeadButton
            leadId={lead.id}
            leadName={`${lead.first_name} ${lead.last_name}`.trim()}
          />
        </div>
      </div>

      <section className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5 md:grid-cols-2">
        <div>
          <p className="text-xs tracking-wide text-slate-500 uppercase">
            Contact
          </p>
          <p className="mt-1 break-all text-sm">{lead.email || "—"}</p>
          <p className="text-sm text-slate-400">{lead.phone || "—"}</p>
        </div>
        <div>
          <p className="text-xs tracking-wide text-slate-500 uppercase">
            Location
          </p>
          <p className="mt-1 text-sm">{lead.location || "—"}</p>
        </div>
        <div>
          <p className="text-xs tracking-wide text-slate-500 uppercase">
            Product
          </p>
          <p className="mt-1 text-sm">{lead.inventory?.name ?? "—"}</p>
          <p className="text-sm text-slate-400">
            Qty: {lead.order_quantity}
          </p>
        </div>
        <div>
          <p className="text-xs tracking-wide text-slate-500 uppercase">Note</p>
          <p className="mt-1 text-sm whitespace-pre-wrap text-slate-300">
            {lead.note || "—"}
          </p>
        </div>
      </section>

      <LeadPhotosLazy leadId={lead.id} />
    </div>
  );
}
