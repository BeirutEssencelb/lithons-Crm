"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Mobile / tablet bottom navigation (hidden on large desktops). */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <ul className="mx-auto flex max-w-3xl items-stretch px-1 sm:px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex touch-manipulation flex-col items-center gap-0.5 px-0.5 py-2.5 text-[10px] font-medium transition-colors sm:gap-1 sm:py-3 sm:text-xs",
                  isActive
                    ? "text-brand-400"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                <span
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10",
                    isActive && "bg-brand-500/15"
                  )}
                >
                  <Icon className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" />
                </span>
                <span className="max-w-full truncate px-0.5">{item.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
