import Link from "next/link";
import { Users, Package, ShoppingCart, UserCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

async function getDashboardStats() {
  if (!isSupabaseConfigured()) {
    return { leads: 0, inventory: 0, orders: 0, clients: 0 };
  }

  try {
    const supabase = await createClient();
    const [leads, inventory, clients] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact", head: true }),
      supabase.from("inventory").select("id", { count: "exact", head: true }),
      supabase.from("clients").select("id", { count: "exact", head: true }),
    ]);

    return {
      leads: leads.count ?? 0,
      inventory: inventory.count ?? 0,
      orders: clients.count ?? 0,
      clients: clients.count ?? 0,
    };
  } catch {
    return { leads: 0, inventory: 0, orders: 0, clients: 0 };
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { title: "Leads", value: stats.leads, href: "/leads", icon: Users },
    { title: "Clients", value: stats.clients, href: "/clients", icon: UserCheck },
    {
      title: "Inventory",
      value: stats.inventory,
      href: "/inventory",
      icon: Package,
    },
    { title: "Orders", value: stats.orders, href: "/orders", icon: ShoppingCart },
  ];

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">
        Dashboard
      </h1>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-colors hover:border-slate-700 hover:bg-slate-900/70"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">
                  {card.title}
                </span>
                <Icon className="h-3.5 w-3.5 text-brand-400" />
              </div>
              <div className="text-2xl font-semibold tracking-tight">
                {card.value}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
