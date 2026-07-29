import { createClient } from "@/lib/supabase/client";

/** Soft-archive a client (sets archived_at). */
export async function archiveClient(clientId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("clients")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", clientId);
  if (error) throw error;
}
