export function SafetySection() {
  return (
    <section
      className="w-full px-4 sm:px-6 py-16 sm:py-20"
      aria-labelledby="safety-heading"
      style={{ backgroundColor: "var(--color-paper-warm)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section marker */}
        <div className="flex items-baseline gap-4 mb-10">
          <span
            className="font-display text-5xl sm:text-6xl font-bold select-none"
            style={{ color: "var(--color-brand)", opacity: 0.15 }}
            aria-hidden="true"
          >
            ℞
          </span>
          <div>
            <h2
              id="safety-heading"
              className="font-display text-2xl sm:text-3xl font-bold text-ink"
            >
              How the safety system works
            </h2>
            <p className="text-ink-light mt-1 text-base sm:text-lg">
              Three layers between your prescription and a missed risk.
            </p>
          </div>
        </div>

        <div className="rx-divider mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-14">
          {/* Step 1 */}
          <div>
            <div
              className="font-display text-4xl font-bold mb-3"
              style={{ color: "var(--color-brand)", opacity: 0.3 }}
            >
              01
            </div>
            <h3 className="font-display text-lg font-semibold text-ink mb-2">
              Explain
            </h3>
            <p className="text-ink-light text-sm leading-relaxed">
              Decodes doctor handwriting and medical shorthand (SOS, OD, BD,
              AC/PC) into plain, understandable language. Every field shows a
              confidence score.
            </p>
          </div>

          {/* Step 2 */}
          <div>
            <div
              className="font-display text-4xl font-bold mb-3"
              style={{ color: "var(--color-brand)", opacity: 0.3 }}
            >
              02
            </div>
            <h3 className="font-display text-lg font-semibold text-ink mb-2">
              Inform
            </h3>
            <p className="text-ink-light text-sm leading-relaxed">
              Provides evidence-based medication information retrieved from
              trusted medical knowledge bases.
              {/* TODO: Name specific knowledge sources when confirmed (e.g., DrugBank, DailyMed, WHO Essential Medicines List) */}
            </p>
          </div>

          {/* Step 3 */}
          <div>
            <div
              className="font-display text-4xl font-bold mb-3"
              style={{ color: "var(--color-brand)", opacity: 0.3 }}
            >
              03
            </div>
            <h3 className="font-display text-lg font-semibold text-ink mb-2">
              Guide
            </h3>
            <p className="text-ink-light text-sm leading-relaxed">
              Alerts you to potential risks based on your medical profile.
              Always recommends consulting your healthcare provider.
            </p>
          </div>
        </div>

        {/* Realistic interaction warning — pharmacist's note style */}
        <div
          className="rounded-lg border p-5 sm:p-6"
          style={{
            borderColor: "var(--color-signal)",
            backgroundColor: "var(--color-signal-light)",
          }}
          role="alert"
          aria-label="Example drug interaction warning"
        >
          <div className="flex items-start gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="shrink-0 mt-0.5"
              aria-hidden="true"
            >
              <path
                d="M10 2L1 18h18L10 2z"
                stroke="var(--color-signal)"
                strokeWidth="1.5"
                fill="var(--color-signal-light)"
              />
              <path
                d="M10 8v4M10 14h.01"
                stroke="var(--color-signal)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <div>
              <p
                className="font-semibold text-sm mb-1"
                style={{ color: "var(--color-signal-dark)" }}
              >
                Interaction flagged: Metformin + Pantoprazole
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-signal)" }}
              >
                Long-term use of Pantoprazole may reduce Vitamin B12 absorption,
                which can worsen metformin-related B12 deficiency. Consider
                periodic B12 monitoring. Consult your prescribing doctor.
              </p>
              <p
                className="text-xs font-mono mt-2"
                style={{ color: "var(--color-ink-muted)" }}
              >
                This is an example warning. Actual alerts depend on your profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
