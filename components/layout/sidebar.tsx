"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { NAV_ITEMS, SECONDARY_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";

const NAV_DESCRIPTIONS: Record<string, string> = {
  "/": "Overview & stats",
  "/leads": "Prospects & follow-ups",
  "/clients": "Won leads & orders",
  "/inventory": "Slab stock levels",
  "/orders": "Sales orders",
  "/settings": "Password & account",
};

function NavLink({
  href,
  title,
  icon: Icon,
  pathname,
}: {
  href: string;
  title: string;
  icon: (typeof NAV_ITEMS)[number]["icon"];
  pathname: string;
}) {
  const isActive =
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
        isActive
          ? "border-brand-500/25 bg-brand-500/15 text-brand-300"
          : "border-transparent text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
      )}
    >
      <Icon
        className={cn("h-5 w-5 shrink-0", isActive ? "text-brand-400" : "")}
      />
      <div className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block truncate text-[11px] text-slate-500">
          {NAV_DESCRIPTIONS[href] ?? ""}
        </span>
      </div>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed top-0 left-0 z-40 hidden h-dvh w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900/50 lg:flex xl:w-72">
      <div className="border-b border-slate-800 px-5 py-6">
        <Logo size="md" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} pathname={pathname} />
        ))}
        <div className="my-3 border-t border-slate-800" />
        {SECONDARY_NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} pathname={pathname} />
        ))}
      </nav>

      <div className="space-y-3 border-t border-slate-800 p-4">
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Account</p>
            <p className="text-[11px] text-slate-500">Signed in</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
