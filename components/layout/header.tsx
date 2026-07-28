"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function Header({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const settingsActive = pathname.startsWith("/settings");

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg lg:static lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none">
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8 lg:px-8 lg:py-6"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="min-w-0 flex-1">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          {title ? (
            <div className="hidden lg:block">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              {subtitle ? (
                <p className="mt-1 text-base text-slate-400">{subtitle}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <Link
            href="/settings"
            title="Settings"
            aria-label="Settings"
            aria-current={settingsActive ? "page" : undefined}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl transition-colors touch-manipulation sm:h-12 sm:w-12",
              settingsActive
                ? "bg-brand-500/15 text-brand-400"
                : "bg-slate-800 text-slate-400 hover:bg-brand-500/15 hover:text-brand-400"
            )}
          >
            <Settings className="h-5 w-5" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-slate-400 transition-colors touch-manipulation hover:bg-red-500/10 hover:text-red-400 sm:h-12 sm:w-12"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
