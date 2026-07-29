import { createClient } from "@/lib/supabase/server";
import { LeadTable } from "@/features/leads/components/lead-table";
import { AddLeadButton } from "@/features/leads/components/add-lead-button";
import type { Lead } from "@/features/leads/types/lead.types";

const LEADS_PAGE_SIZE = 50;

const LEAD_LIST_COLUMNS =
  "id, user_id, first_name, last_name, email, phone, location, note, status, created_at, follow_up_at, inventory_item_id, order_quantity, pushed_to_sct, inventory:inventory_item_id(name)" as const;

async function getLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_LIST_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(LEADS_PAGE_SIZE);

  if (error) throw error;
  return (data as unknown as Lead[]) ?? [];
}

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Leads
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Prospects & follow-ups
            {leads.length >= LEADS_PAGE_SIZE
              ? ` · latest ${LEADS_PAGE_SIZE}`
              : ""}
          </p>
        </div>
        <AddLeadButton />
      </div>
      <LeadTable leads={leads} />
    </div>
  );
}
