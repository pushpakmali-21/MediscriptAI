import React from "react";
import { cn } from "@/lib/utils";

export interface ShorthandTermProps {
  term: string;
  meaning?: string;
  className?: string;
}

const DICTIONARY: Record<string, string> = {
  "BD": "Twice daily",
  "OD": "Once daily",
  "TDS": "Three times daily",
  "QID": "Four times daily",
  "SOS": "As needed / emergency",
  "AC": "Before food",
  "PC": "After food",
  "HS": "At bedtime",
  "Stat": "Immediately"
};

export const ShorthandTerm: React.FC<ShorthandTermProps> = ({ term, meaning, className }) => {
  const displayMeaning = meaning || DICTIONARY[term] || "Unknown term";

  return (
    <span className={cn("group relative inline-block cursor-help", className)}>
      <span 
        className="font-mono text-[var(--color-brand)] border-b border-dotted border-[var(--color-brand)] hover:text-opacity-80 transition-colors"
        tabIndex={0}
        aria-describedby={`tooltip-${term}`}
      >
        {term}
      </span>
      
      <span 
        id={`tooltip-${term}`}
        role="tooltip"
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-[var(--color-paper)] border border-[var(--color-ink)] text-[var(--color-ink)] text-xs font-body rounded shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-10"
      >
        {displayMeaning}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[var(--color-ink)]"></span>
        <span className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[var(--color-paper)]"></span>
      </span>
    </span>
  );
};
