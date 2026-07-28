import { createClient } from "@/lib/supabase/server";
import { LeadTable } from "@/features/leads/components/lead-table";
import { AddLeadButton } from "@/features/leads/components/add-lead-button";
import type { Lead } from "@/features/leads/types/lead.types";

async function getLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*, inventory:inventory_item_id(name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Lead[]) ?? [];
}

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Leads
          </h1>
          <p className="mt-1 text-sm text-slate-400">Prospects & follow-ups</p>
        </div>
        <AddLeadButton />
      </div>
      <LeadTable leads={leads} />
    </div>
  );
}
