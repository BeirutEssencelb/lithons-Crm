"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductOption {
  id: string;
  name: string;
}

interface ProductComboboxProps {
  options: ProductOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ProductCombobox({
  options,
  value,
  onChange,
  disabled = false,
  placeholder = "Search products…",
}: ProductComboboxProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => options.find((o) => o.id === value) ?? null,
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function pick(id: string | null) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className="relative mt-1">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => !prev);
          setQuery("");
        }}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-950 px-2.5 text-left text-sm text-slate-100 outline-none transition-colors",
          "hover:border-slate-600 focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/30",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <span
          className={cn(
            "truncate",
            selected ? "text-slate-100" : "text-slate-500"
          )}
        >
          {selected?.name ?? "Select product"}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {selected ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear product"
              className="rounded p-0.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              onClick={(e) => {
                e.stopPropagation();
                pick(null);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </span>
          ) : null}
          <ChevronsUpDown className="h-3.5 w-3.5 text-slate-500" />
        </span>
      </button>

      {open ? (
        <div
          id={listId}
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-950 shadow-xl shadow-black/40"
        >
          <div className="flex items-center gap-2 border-b border-slate-800 px-2.5 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="h-7 w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
          </div>

          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">
                No products match
              </li>
            ) : (
              filtered.map((item) => {
                const isSelected = item.id === value;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => pick(item.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors",
                        isSelected
                          ? "bg-brand-500/15 text-brand-200"
                          : "text-slate-200 hover:bg-slate-800"
                      )}
                    >
                      <span className="truncate">{item.name}</span>
                      {isSelected ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-brand-400" />
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
