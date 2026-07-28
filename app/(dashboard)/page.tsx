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
      // Orders are client records with product quantities in this schema
      orders: clients.count ?? 0,
      clients: clients.count ?? 0,
    };
  } catch {
    return { leads: 0, inventory: 0, orders: 0, clients: 0 };
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      title: "Total Leads",
      value: stats.leads,
      icon: Users,
      description: "Active sales leads",
    },
    {
      title: "Inventory Items",
      value: stats.inventory,
      icon: Package,
      description: "Products in stock",
    },
    {
      title: "Orders",
      value: stats.orders,
      icon: ShoppingCart,
      description: "Client orders (won leads)",
    },
    {
      title: "Clients",
      value: stats.clients,
      icon: UserCheck,
      description: "Active clients",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-400 lg:text-base">
          Overview of leads, inventory, orders, and clients
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">
                  {card.title}
                </span>
                <Icon className="h-4 w-4 text-brand-400" />
              </div>
              <div className="text-2xl font-bold tracking-tight">
                {card.value}
              </div>
              <p className="mt-1 text-xs text-slate-500">{card.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
