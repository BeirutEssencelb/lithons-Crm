import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    let value = m[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PRODUCTS = [
  "Aviano (Avenza)",
  "Black Storm",
  "Botticino (Cloudy White)",
  "Cemento",
  "Calacatta Elba*",
  "Calacatta Lithos",
  "Calacatta Marina",
  "Calacatta Noir",
  "Calcutta Noir",
  "Calcutta Noir (Laza)",
  "Carrara capri",
  "Carrara White",
  "Diamante",
  "Florence Brown",
  "Grainy White",
  "Grosseto (Grey Lac)",
  "Massimo* (Chromo)",
  "Messina*",
  "Misterio Gold",
  "Nero Marquina",
  "Pompeii",
  "Pure White",
  "Sea Storm",
  "Skyline Gold",
  "Statuario Black",
  "Statuario brown",
  "Super White",
  "Taj Mahal",
  "Tuscany Concrete",
  "Vernazza",
  "White Sparkling Mirror",
];

async function main() {
  if (!url || !service) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(2);
  }

  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: usersData, error: usersError } =
    await admin.auth.admin.listUsers({ perPage: 50 });
  if (usersError) throw usersError;

  const users = usersData.users ?? [];
  if (users.length === 0) {
    console.error("NO_USERS");
    process.exit(3);
  }

  for (const user of users) {
    const { count, error: countError } = await admin
      .from("inventory")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (countError) throw countError;

    if ((count ?? 0) > 0) {
      console.log(`SKIP ${user.email} already has ${count} items`);
      continue;
    }

    const rows = PRODUCTS.map((name) => ({
      user_id: user.id,
      name,
      quantity: 50,
      low_stock_threshold: 5,
    }));

    const { error: insertError } = await admin.from("inventory").insert(rows);
    if (insertError) throw insertError;
    console.log(`SEEDED ${user.email} with ${PRODUCTS.length} products`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
