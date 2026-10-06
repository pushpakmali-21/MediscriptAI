import React from "react";
import { cn } from "@/lib/utils";

export interface DosageDotsProps {
  pattern: string;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4",
};

const LABELS = ["Morn", "Aft", "Eve", "Night"];

export const DosageDots: React.FC<DosageDotsProps> = ({ pattern, size = "md", showLabels = false, className }) => {
  const parts = pattern.split("-");
  const slots = parts.length === 3 ? [parts[0], parts[1], "0", parts[2]] : parts;
  
  // Pad or trim to exactly 4 slots
  const normalizedSlots = Array.from({ length: 4 }).map((_, i) => slots[i] || "0");
  
  const ariaLabel = `Dosage pattern: ${normalizedSlots.map((s, i) => s !== "0" ? `Take in the ${LABELS[i].toLowerCase()}` : `Skip in the ${LABELS[i].toLowerCase()}`).join(", ")}`;

  return (
    <div className={cn("flex flex-row gap-4 items-start", className)} aria-label={ariaLabel} role="group">
      {normalizedSlots.map((val, idx) => {
        const isFilled = val !== "0" && val !== "";
        return (
          <div key={idx} className="flex flex-col items-center gap-1.5">
            <div 
              className={cn(
                "rounded-full shrink-0", 
                sizeMap[size],
                isFilled 
                  ? "bg-[var(--color-brand)] border-[var(--color-brand)] border" 
                  : "bg-transparent border-[var(--color-border-light)] border"
              )}
              aria-hidden="true"
            />
            {showLabels && (
              <span className="text-[10px] uppercase font-mono text-[var(--color-ink-muted)]">
                {LABELS[idx]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
