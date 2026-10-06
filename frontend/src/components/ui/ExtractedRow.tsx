import React from "react";
import { cn } from "@/lib/utils";
import { DosageDots } from "./DosageDots";
import { ConfidenceBadge } from "./ConfidenceBadge";

export interface ExtractedRowProps {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  confidence?: number;
  instructions?: string;
  ragContext?: string;
  className?: string;
  isDemo?: boolean;
}

export const ExtractedRow: React.FC<ExtractedRowProps> = ({
  medicineName,
  dosage,
  frequency,
  duration,
  confidence,
  instructions,
  ragContext,
  className,
  isDemo
}) => {
  return (
    <div className={cn("p-4 rounded-lg bg-[var(--color-paper)] border border-[var(--color-border)] flex flex-col gap-3", className)}>
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-display font-bold text-xl text-[var(--color-ink)] m-0">{medicineName}</h3>
            <span className="font-mono text-sm bg-[var(--color-brand-light)] text-[var(--color-brand)] px-2 py-0.5 rounded-sm">
              {dosage}
            </span>
            {isDemo && (
              <span className="text-xs uppercase tracking-wider font-bold text-[var(--color-signal)] bg-[var(--color-signal-light)] px-1.5 py-0.5 rounded-sm border border-[var(--color-signal)]">
                Demo data
              </span>
            )}
          </div>
          <span className="text-sm text-[var(--color-ink-muted)] bg-[var(--color-border-light)] w-max px-2 py-0.5 rounded-full mt-1">
            {duration}
          </span>
        </div>
        
        {confidence !== undefined && (
          <ConfidenceBadge confidence={confidence} />
        )}
      </div>

      <div className="mt-2 py-3 border-t border-dashed border-[var(--color-border-light)] flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <span className="text-sm font-medium text-[var(--color-ink-light)]">Frequency:</span>
          <DosageDots pattern={frequency} showLabels={true} size="md" />
        </div>
        
        {instructions && (
          <div className="text-sm text-[var(--color-ink-light)] font-body mt-1">
            <span className="font-medium mr-1 text-ink">Instructions:</span> 
            {instructions}
          </div>
        )}
        
        {ragContext && (
          <div className="mt-1 p-3 rounded-md bg-[var(--color-brand-light)] text-brand-dark text-sm border border-brand/10">
            {ragContext.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-brand">{part}</strong> : part)}
          </div>
        )}
      </div>
    </div>
  );
};
