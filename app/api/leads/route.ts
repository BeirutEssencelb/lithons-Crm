import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLeadSchema } from "@/features/leads/schemas/lead.schema";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*, inventory:inventory_item_id(name)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const parsed = createLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { created_at, follow_up_at, ...rest } = parsed.data;
  const row: Record<string, unknown> = { ...rest, user_id: user.id };

  if (created_at) {
    row.created_at = /^\d{4}-\d{2}-\d{2}$/.test(created_at)
      ? new Date(`${created_at}T12:00:00`).toISOString()
      : new Date(created_at).toISOString();
  }

  if (follow_up_at) {
    row.follow_up_at = /^\d{4}-\d{2}-\d{2}$/.test(follow_up_at)
      ? new Date(`${follow_up_at}T12:00:00`).toISOString()
      : new Date(follow_up_at).toISOString();
  } else {
    row.follow_up_at = null;
  }

  const { data, error } = await supabase
    .from("leads")
    .insert(row)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
