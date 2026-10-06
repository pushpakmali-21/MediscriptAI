import React from "react";
import { cn } from "@/lib/utils";

export interface ConfidenceBadgeProps {
  confidence: number;
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence, className }) => {
  let level: "high" | "medium" | "low" = "low";
  if (confidence >= 0.85) level = "high";
  else if (confidence >= 0.6) level = "medium";

  const config = {
    high: {
      bg: "bg-[var(--color-success-light)]",
      border: "border-[var(--color-success)]",
      text: "text-[var(--color-success)]",
      label: "High confidence",
    },
    medium: {
      bg: "bg-[var(--color-signal-light)]",
      border: "border-[var(--color-signal)]",
      text: "text-[var(--color-signal)]",
      label: "Review suggested",
    },
    low: {
      bg: "bg-[var(--color-signal)]",
      border: "border-[var(--color-signal)]",
      text: "text-white",
      label: "Verify with prescription",
    }
  };

  const activeConfig = config[level];
  const percentage = Math.round(confidence * 100);

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-medium",
        activeConfig.bg,
        activeConfig.border,
        activeConfig.text,
        className
      )}
      role="status"
      aria-label={`Confidence level: ${percentage}%. ${activeConfig.label}`}
    >
      <span className="font-mono font-bold">{percentage}%</span>
      <span className="font-body hidden sm:inline">{activeConfig.label}</span>
    </div>
  );
};
