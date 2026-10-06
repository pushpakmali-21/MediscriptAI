import React from "react";
import { cn } from "@/lib/utils";

export interface SectionMarkerProps {
  number: string | number;
  title: string;
  className?: string;
}

export const SectionMarker: React.FC<SectionMarkerProps> = ({ number, title, className }) => {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-baseline gap-3 mb-2">
        <span className="font-display text-4xl sm:text-5xl text-[var(--color-brand)] opacity-20 select-none">
          {typeof number === "number" ? String(number).padStart(2, "0") : number}
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-medium text-[var(--color-ink)] m-0">
          {title}
        </h2>
      </div>
      <div className="w-full h-px relative bg-gradient-to-r from-[var(--color-ink)] via-[var(--color-border)] to-transparent opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,white_4px,white_8px)] opacity-50 mix-blend-screen" />
      </div>
    </div>
  );
};
