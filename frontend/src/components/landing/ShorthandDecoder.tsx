"use client";

import { useState } from "react";

interface ShorthandEntry {
  term: string;
  meaning: string;
  example?: string;
}

const SHORTHAND_DICTIONARY: ShorthandEntry[] = [
  { term: "OD", meaning: "Once daily", example: "0-0-1" },
  { term: "BD", meaning: "Twice daily", example: "1-0-1" },
  { term: "TDS", meaning: "Three times daily", example: "1-1-1" },
  { term: "QID", meaning: "Four times daily", example: "1-1-1-1" },
  { term: "SOS", meaning: "As needed / emergency" },
  { term: "AC", meaning: "Before food" },
  { term: "PC", meaning: "After food" },
  { term: "HS", meaning: "At bedtime" },
  { term: "Stat", meaning: "Immediately / right now" },
];

export function ShorthandDecoder() {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);

  return (
    <div
      className="w-full overflow-x-auto"
      role="region"
      aria-label="Prescription shorthand decoder"
    >
      <div className="flex gap-2 sm:gap-3 min-w-max px-1 py-2">
        {SHORTHAND_DICTIONARY.map((entry) => {
          const isActive = activeTerm === entry.term;
          return (
            <button
              key={entry.term}
              type="button"
              className="relative group"
              onMouseEnter={() => setActiveTerm(entry.term)}
              onMouseLeave={() => setActiveTerm(null)}
              onFocus={() => setActiveTerm(entry.term)}
              onBlur={() => setActiveTerm(null)}
              aria-expanded={isActive}
              aria-describedby={isActive ? `shorthand-${entry.term}` : undefined}
            >
              <span
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md font-mono text-sm font-medium border transition-colors cursor-pointer"
                style={{
                  color: isActive
                    ? "var(--color-brand-dark)"
                    : "var(--color-brand)",
                  borderColor: isActive
                    ? "var(--color-brand)"
                    : "var(--color-border-light)",
                  backgroundColor: isActive
                    ? "var(--color-brand-light)"
                    : "transparent",
                }}
              >
                {entry.term}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  className="opacity-40"
                >
                  <circle
                    cx="6"
                    cy="6"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                  <text
                    x="6"
                    y="9"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="8"
                    fontFamily="inherit"
                  >
                    ?
                  </text>
                </svg>
              </span>

              {/* Tooltip popover */}
              {isActive && (
                <span
                  id={`shorthand-${entry.term}`}
                  role="tooltip"
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-md border text-left whitespace-nowrap z-20"
                  style={{
                    backgroundColor: "var(--color-paper)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-ink)",
                  }}
                >
                  <span className="block text-sm font-semibold">
                    {entry.meaning}
                  </span>
                  {entry.example && (
                    <span
                      className="block text-xs font-mono mt-0.5"
                      style={{ color: "var(--color-ink-muted)" }}
                    >
                      e.g. {entry.example}
                    </span>
                  )}
                  {/* Tooltip arrow */}
                  <span
                    className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b"
                    style={{
                      backgroundColor: "var(--color-paper)",
                      borderColor: "var(--color-border)",
                    }}
                  />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
