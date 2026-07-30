import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendWebPush } from "@/lib/push/web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

function endOfTodayIso() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  let sent = 0;
  let cleaned = 0;
  const errors: string[] = [];

  const { data: subscriptions, error: subError } = await supabase
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth");

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  const byUser = new Map<
    string,
    { id: string; endpoint: string; p256dh: string; auth: string }[]
  >();
  for (const sub of subscriptions ?? []) {
    const list = byUser.get(sub.user_id) ?? [];
    list.push(sub);
    byUser.set(sub.user_id, list);
  }

  const end = endOfTodayIso();

  for (const [userId, subs] of byUser) {
    const payloads: { title: string; body: string; url: string }[] = [];

    const { data: dueLeads } = await supabase
      .from("leads")
      .select("id, first_name, last_name, follow_up_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .not("follow_up_at", "is", null)
      .lte("follow_up_at", end)
      .limit(20);

    if ((dueLeads?.length ?? 0) > 0) {
      const first = dueLeads![0];
      const name = `${first.first_name} ${first.last_name}`.trim();
      payloads.push({
        title: "Follow-up due",
        body:
          dueLeads!.length === 1
            ? `Follow up with ${name}`
            : `${dueLeads!.length} leads need follow-up (incl. ${name})`,
        url: dueLeads!.length === 1 ? `/leads/${first.id}` : "/leads",
      });
    }

    const { data: inventory } = await supabase
      .from("inventory")
      .select("id, name, quantity, low_stock_threshold")
      .eq("user_id", userId);

    const low = (inventory ?? []).filter(
      (item) =>
        item.quantity === 0 || item.quantity <= item.low_stock_threshold
    );

    if (low.length > 0) {
      const sample = low[0].name;
      payloads.push({
        title: "Stock alert",
        body:
          low.length === 1
            ? `${sample} is low or out of stock`
            : `${low.length} products need attention (incl. ${sample})`,
        url: "/inventory",
      });
    }

    for (const payload of payloads) {
      for (const sub of subs) {
        const result = await sendWebPush(
          {
            endpoint: sub.endpoint,
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
          payload
        );
        if (result.ok) {
          sent += 1;
        } else if (result.gone) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          cleaned += 1;
        } else if (result.error) {
          errors.push(result.error);
        }
      }
    }
  }

  return NextResponse.json({
    ok: true,
    users: byUser.size,
    sent,
    cleaned,
    errors: errors.slice(0, 10),
  });
}
