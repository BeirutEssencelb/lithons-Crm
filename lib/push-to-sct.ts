/** Summit / SCT CRM Edge Function */

const SUMMIT_EDGE_URL =
  "https://iojineuqpymccxvtoxky.supabase.co/functions/v1/smooth-processor";

export interface SummitLeadData {
  name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
}

export function formatLeadForSummit(
  lead: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    location: string;
    note: string;
    order_quantity: number;
    follow_up_at: string | null;
  },
  productName: string
): SummitLeadData {
  const noteLines = [
    lead.note,
    lead.location ? `Location: ${lead.location}` : null,
    `Product: ${productName}`,
    `Order quantity: ${lead.order_quantity} slab${lead.order_quantity !== 1 ? "s" : ""}`,
    lead.follow_up_at ? `Follow-up: ${lead.follow_up_at}` : null,
    `LITHOS lead ID: ${lead.id}`,
  ].filter(Boolean);

  return {
    name: lead.first_name.trim(),
    last_name: lead.last_name.trim() || null,
    email: lead.email.trim() || null,
    phone: lead.phone.trim() || null,
    notes: noteLines.length > 0 ? noteLines.join("\n") : null,
  };
}

export async function pushLeadToSct(leadData: SummitLeadData): Promise<void> {
  const apiSecret = process.env.NEXT_PUBLIC_API_SECRET_TOKEN;
  const summitAnonKey = process.env.NEXT_PUBLIC_SUMMIT_SUPABASE_ANON_KEY;

  if (!apiSecret) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_SECRET_TOKEN. Add it to your .env.local file."
    );
  }
  if (!summitAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUMMIT_SUPABASE_ANON_KEY. Add it to your .env.local file."
    );
  }

  const response = await fetch(SUMMIT_EDGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: summitAnonKey,
      "x-api-secret": apiSecret,
    },
    body: JSON.stringify(leadData),
  });

  if (!response.ok) {
    let message = `Push failed (${response.status})`;
    try {
      const body = (await response.json()) as {
        error?: string;
        message?: string;
      };
      message = body.error ?? body.message ?? message;
    } catch {
      /* use default */
    }
    throw new Error(message);
  }
}
