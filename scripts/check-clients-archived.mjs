import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const text = readFileSync(".env.local", "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase URL or service role key");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });
const { error } = await sb.from("clients").select("id, archived_at").limit(1);
if (error) {
  console.error("archived_at missing or query failed:", error.message);
  console.error(
    "Run supabase/migrations/003_clients_archived_at.sql in the Supabase SQL editor."
  );
  process.exit(1);
}
console.log("archived_at column OK");
