"use client";

import { useEffect, useState } from "react";

/* ─── Mock prescription data (clearly labelled as demo) ─── */
const DEMO_MEDICINES = [
  {
    name: "Amoxicillin",
    dosage: "500 mg",
    frequency: "1-0-1",
    duration: "5 days",
    instructions: "After food",
    confidence: 0.94,
  },
  {
    name: "Pantoprazole",
    dosage: "40 mg",
    frequency: "1-0-0",
    duration: "7 days",
    instructions: "Before food (AC)",
    confidence: 0.91,
  },
  {
    name: "Cetirizine",
    dosage: "10 mg",
    frequency: "0-0-1",
    duration: "3 days",
    instructions: "At bedtime (HS)",
    confidence: 0.87,
  },
  {
    name: "Paracetamol",
    dosage: "650 mg",
    frequency: "1-1-1",
    duration: "SOS",
    instructions: "If fever > 100°F",
    confidence: 0.72,
  },
];

/* ─── Scrawled prescription lines (doctor's handwriting mockup) ─── */
const SCRAWLED_LINES = [
  "Tab. Amoxicillin 500mg — 1-0-1 x 5d (PC)",
  "Tab. Pantoprazole 40mg — OD x 7d (AC)",
  "Tab. Cetirizine 10mg — 0-0-1 x 3d (HS)",
  "Tab. Paracetamol 650 — TDS SOS for fever",
];

function DosageDotsInline({
  pattern,
}: {
  pattern: string;
}) {
  const parts = pattern.split("-").map(Number);
  // Pad to 3 slots minimum (Morning / Afternoon / Night)
  while (parts.length < 3) parts.push(0);
  const labels = ["Morn", "Aft", "Night"];
  if (parts.length === 4) labels.splice(2, 0, "Eve");

  return (
    <span
      className="inline-flex items-center gap-1"
      aria-label={`Dosage pattern: ${pattern}`}
    >
      {parts.map((val, i) => (
        <span
          key={labels[i]}
          className={`inline-block w-2.5 h-2.5 rounded-full border ${
            val > 0
              ? "bg-brand border-brand"
              : "bg-transparent border-ink-light"
          }`}
          style={{
            backgroundColor: val > 0 ? "var(--color-brand)" : "transparent",
            borderColor:
              val > 0 ? "var(--color-brand)" : "var(--color-border-light)",
          }}
          title={labels[i]}
        />
      ))}
    </span>
  );
}

function ConfidenceDot({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const isLow = confidence < 0.6;
  const isMedium = confidence >= 0.6 && confidence < 0.85;

  let dotColor = "var(--color-success)";
  let label = "High confidence";
  if (isLow) {
    dotColor = "var(--color-signal)";
    label = "Verify with prescription";
  } else if (isMedium) {
    dotColor = "#b45309"; // amber-700
    label = "Review suggested";
  }

  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-xs"
      role="status"
      aria-label={`${label}: ${pct}%`}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      <span style={{ color: dotColor }}>{pct}%</span>
    </span>
  );
}

export function HeroSection() {
  const [decoded, setDecoded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDecoded(true);
      return;
    }
    const timer = setTimeout(() => setDecoded(true), 400);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  const shouldAnimate = !prefersReducedMotion;

  return (
    <section
      className="w-full px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-20"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-6xl mx-auto">
        {/* Headline */}
        <div className="max-w-3xl mb-10 sm:mb-14">
          <h1
            id="hero-heading"
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-ink leading-[1.08] mb-5"
          >
            Your doctor&rsquo;s handwriting,{" "}
            <span className="text-brand">finally readable.</span>
          </h1>

          <p className="text-lg sm:text-xl text-ink-light leading-relaxed max-w-2xl mb-8">
            Upload a prescription image. MediScript AI accurately extracts
            medicines, dosages, and schedules — with confidence scores. Then
            checks for safety.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/scan"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-brand text-white font-semibold rounded-lg border border-brand-dark hover:bg-brand-dark transition-colors focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
              style={{
                backgroundColor: "var(--color-brand)",
                borderColor: "var(--color-brand-dark)",
              }}
            >
              Scan a prescription
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8h10m0 0L9 4m4 4L9 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-ink font-semibold rounded-lg border transition-colors hover:bg-paper-warm"
              style={{ borderColor: "var(--color-border)" }}
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Before → After: prescription decoding demo */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start"
          aria-label="Demo: prescription decoding"
          role="img"
        >
          {/* LEFT: Scrawled prescription */}
          <div
            className="relative rounded-lg border p-6 sm:p-8 handwriting-tilt paper-grain"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-paper-warm)",
            }}
          >
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span
                className="text-xs font-mono uppercase tracking-wider"
                style={{ color: "var(--color-ink-muted)" }}
              >
                Doctor&rsquo;s prescription
              </span>
            </div>

            {/* Rx symbol */}
            <div
              className="font-display text-5xl sm:text-6xl font-bold mb-4 mt-4 select-none"
              style={{ color: "var(--color-brand)", opacity: 0.2 }}
              aria-hidden="true"
            >
              ℞
            </div>

            {/* Scrawled lines */}
            <div className="space-y-3 ruled-lines pt-2">
              {SCRAWLED_LINES.map((line, i) => (
                <p
                  key={i}
                  className="font-handwriting text-xl sm:text-2xl leading-relaxed"
                  style={{ color: "var(--color-ink-light)" }}
                >
                  {line}
                </p>
              ))}
            </div>

            {/* Signature scrawl */}
            <div className="mt-8 flex items-end justify-between">
              <div>
                <p
                  className="font-handwriting text-lg"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  Dr. R. Sharma
                </p>
                <p
                  className="text-xs font-mono"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  Reg. No. 12345
                </p>
              </div>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded border"
                style={{
                  color: "var(--color-ink-muted)",
                  borderColor: "var(--color-border-light)",
                }}
              >
                DEMO
              </span>
            </div>
          </div>

          {/* RIGHT: Extracted structured data */}
          <div className="space-y-0">
            {/* Header row */}
            <div
              className="flex items-center gap-2 mb-3 px-1"
            >
              <span
                className="text-xs font-mono uppercase tracking-wider"
                style={{ color: "var(--color-ink-muted)" }}
              >
                Extracted medicines
              </span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded border"
                style={{
                  color: "var(--color-ink-muted)",
                  borderColor: "var(--color-border-light)",
                }}
              >
                DEMO
              </span>
            </div>

            {/* Extracted rows */}
            {DEMO_MEDICINES.map((med, i) => (
              <div
                key={med.name}
                className={`border-t px-4 py-3.5 transition-all duration-500 ${
                  decoded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                } ${shouldAnimate ? `animate-decode animate-decode-${i + 1}` : ""}`}
                style={{
                  borderColor: "var(--color-border-light)",
                  transitionDelay: shouldAnimate ? `${i * 0.15}s` : "0s",
                  animationPlayState: shouldAnimate ? "running" : "paused",
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-semibold text-ink text-base">
                        {med.name}
                      </span>
                      <span
                        className="font-mono text-sm"
                        style={{ color: "var(--color-ink-light)" }}
                      >
                        {med.dosage}
                      </span>
                    </div>
                  </div>
                  <ConfidenceDot confidence={med.confidence} />
                </div>

                <div className="flex items-center gap-4 flex-wrap text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <DosageDotsInline pattern={med.frequency} />
                    <span
                      className="font-mono text-xs"
                      style={{ color: "var(--color-ink-muted)" }}
                    >
                      {med.frequency}
                    </span>
                  </span>

                  <span
                    className="font-mono text-xs px-2 py-0.5 rounded"
                    style={{
                      color: "var(--color-ink-light)",
                      backgroundColor: "var(--color-paper-warm)",
                    }}
                  >
                    {med.duration}
                  </span>

                  <span
                    className="text-xs"
                    style={{ color: "var(--color-ink-muted)" }}
                  >
                    {med.instructions}
                  </span>
                </div>
              </div>
            ))}

            {/* Bottom border */}
            <div
              className="border-t"
              style={{ borderColor: "var(--color-border-light)" }}
            />

            {/* Low confidence callout */}
            <div
              className="mt-3 px-4 py-2.5 rounded-lg border text-sm flex items-start gap-2"
              style={{
                borderColor: "var(--color-signal)",
                backgroundColor: "var(--color-signal-light)",
                color: "var(--color-signal-dark)",
              }}
              role="alert"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="shrink-0 mt-0.5"
                aria-hidden="true"
              >
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 10.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zM8.75 4v4.5a.75.75 0 0 1-1.5 0V4a.75.75 0 0 1 1.5 0z" />
              </svg>
              <span>
                <strong>Paracetamol</strong> extracted with 72% confidence.
                Please verify dosage and frequency with your original
                prescription.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
