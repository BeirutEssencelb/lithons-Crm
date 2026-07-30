"use client";

import {
  memo,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  startTransition,
} from "react";
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

function ProductComboboxInner({
  options,
  value,
  onChange,
  disabled = false,
  placeholder = "Search products…",
}: ProductComboboxProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const selectedName = useMemo(() => {
    if (!value) return null;
    return options.find((o) => o.id === value)?.name ?? null;
  }, [options, value]);

  const searchable = useMemo(
    () => options.map((o) => ({ ...o, key: o.name.toLowerCase() })),
    [options]
  );

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return searchable;
    return searchable.filter((o) => o.key.includes(q));
  }, [searchable, deferredQuery]);

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

  useEffect(() => {
    if (open) inputRef.current?.focus();
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
          startTransition(() => {
            setOpen((prev) => !prev);
            setQuery("");
          });
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
            selectedName ? "text-slate-100" : "text-slate-500"
          )}
        >
          {selectedName ?? "Select product"}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {selectedName ? (
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
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="h-7 w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
          </div>

          <ul className="max-h-48 overflow-y-auto overscroll-contain py-1 contain-content">
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
                        "flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm",
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

export const ProductCombobox = memo(ProductComboboxInner);
