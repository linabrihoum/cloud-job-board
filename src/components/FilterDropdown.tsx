"use client";

import { useEffect, useRef, useState } from "react";

export interface DropdownOption {
  value: string;
  label: string;
}

/**
 * A dropdown filter with type-to-search inside the open panel (combobox).
 * Single-select mode picks one value; multi mode toggles values on/off.
 */
export function FilterDropdown({
  label,
  options,
  selected,
  multi = false,
  onChange,
}: {
  label: string;
  options: DropdownOption[];
  /** Single mode: the selected value ("all" = none). Multi mode: selected values. */
  selected: string | string[];
  multi?: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selectedValues = Array.isArray(selected) ? selected : [selected];
  const activeCount = Array.isArray(selected)
    ? selected.length
    : selected !== "all"
      ? 1
      : 0;
  const summary = !activeCount
    ? label
    : Array.isArray(selected)
      ? `${label} · ${selected.length}`
      : (options.find((o) => o.value === selected)?.label ?? label);

  const visible = options.filter((o) =>
    o.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
          activeCount
            ? "border-accent bg-accent/10 text-accent-soft"
            : "border-paper-line bg-paper-card text-paper-ink hover:border-accent/50"
        }`}
      >
        {summary}
        <span aria-hidden className={`text-xs transition ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute left-1/2 z-20 mt-2 w-56 -translate-x-1/2 rounded-xl border border-paper-line bg-paper-card p-2 shadow-lg">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}…`}
            aria-label={`Search ${label.toLowerCase()}`}
            className="mb-2 w-full rounded-lg border border-paper-line bg-paper px-3 py-2 text-sm text-paper-ink outline-none placeholder:text-paper-muted/70 focus:border-accent"
          />
          <ul role="listbox" className="max-h-56 overflow-y-auto">
            {visible.length === 0 && (
              <li className="px-3 py-2 text-sm text-paper-muted">No matches</li>
            )}
            {visible.map((o) => {
              const isSelected = selectedValues.includes(o.value);
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(o.value);
                      if (!multi) {
                        setOpen(false);
                        setQuery("");
                      }
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                      isSelected
                        ? "bg-accent/10 font-semibold text-accent-soft"
                        : "text-paper-ink hover:bg-paper"
                    }`}
                  >
                    {o.label}
                    {isSelected && <span aria-hidden>✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
