import { ShorthandDecoder } from "./ShorthandDecoder";

export function FeaturesSection() {
  return (
    <section
      id="how-it-works"
      className="w-full px-4 sm:px-6 py-16 sm:py-20"
      aria-labelledby="features-heading"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-baseline gap-4 mb-10">
          <span
            className="font-display text-5xl sm:text-6xl font-bold select-none"
            style={{ color: "var(--color-brand)", opacity: 0.15 }}
            aria-hidden="true"
          >
            02
          </span>
          <div>
            <h2
              id="features-heading"
              className="font-display text-2xl sm:text-3xl font-bold text-ink"
            >
              What you get from every scan
            </h2>
            <p className="text-ink-light mt-1 text-base sm:text-lg">
              Not a generic document reader. Built specifically for
              prescriptions.
            </p>
          </div>
        </div>

        <div className="rx-divider mb-10" />

        {/* Feature grid — asymmetric, editorial */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Large feature: Intelligent extraction */}
          <div
            className="md:col-span-7 rounded-lg border p-6 sm:p-8"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-paper-warm)",
            }}
          >
            <div
              className="font-display text-3xl font-bold mb-1"
              style={{ color: "var(--color-brand)", opacity: 0.2 }}
            >
              01
            </div>
            <h3 className="font-display text-xl font-semibold text-ink mb-3">
              Structured extraction
            </h3>
            <p className="text-ink-light text-sm leading-relaxed mb-5">
              Upload an image or PDF of your doctor&rsquo;s handwritten notes.
              Our Vision Language Model accurately extracts medicines, dosages,
              and duration — with confidence scores for each field.
            </p>

            {/* Mini preview: extracted row mock */}
            <div
              className="rounded-md border p-4"
              style={{
                borderColor: "var(--color-border-light)",
                backgroundColor: "var(--color-paper)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-semibold text-sm text-ink">
                  Amoxicillin
                </span>
                <span
                  className="font-mono text-xs"
                  style={{ color: "var(--color-success)" }}
                >
                  94%
                </span>
              </div>
              <div
                className="flex items-center gap-3 text-xs"
                style={{ color: "var(--color-ink-muted)" }}
              >
                <span className="font-mono">500 mg</span>
                <span>•</span>
                <span className="font-mono">1-0-1</span>
                <span>•</span>
                <span>5 days</span>
                <span>•</span>
                <span>After food</span>
              </div>
            </div>
          </div>

          {/* Safety verification */}
          <div
            className="md:col-span-5 rounded-lg border p-6 sm:p-8"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div
              className="font-display text-3xl font-bold mb-1"
              style={{ color: "var(--color-brand)", opacity: 0.2 }}
            >
              02
            </div>
            <h3 className="font-display text-xl font-semibold text-ink mb-3">
              Safety verification
            </h3>
            <p className="text-ink-light text-sm leading-relaxed mb-5">
              Cross-references medicines against your profile to detect
              allergies and drug interactions via trusted medical sources.
            </p>

            {/* Mini interaction warning */}
            <div
              className="rounded-md border p-3 text-xs"
              style={{
                borderColor: "var(--color-signal)",
                backgroundColor: "var(--color-signal-light)",
                color: "var(--color-signal-dark)",
              }}
            >
              <div className="flex items-start gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="shrink-0 mt-0.5"
                  aria-hidden="true"
                >
                  <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 10.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zM8.75 4v4.5a.75.75 0 0 1-1.5 0V4a.75.75 0 0 1 1.5 0z" />
                </svg>
                <span>
                  <strong>Interaction:</strong> Aspirin + Warfarin may increase
                  bleeding risk. Consult your doctor.
                </span>
              </div>
            </div>
          </div>

          {/* Smart timelines */}
          <div
            className="md:col-span-5 rounded-lg border p-6 sm:p-8"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div
              className="font-display text-3xl font-bold mb-1"
              style={{ color: "var(--color-brand)", opacity: 0.2 }}
            >
              03
            </div>
            <h3 className="font-display text-xl font-semibold text-ink mb-3">
              Smart timelines
            </h3>
            <p className="text-ink-light text-sm leading-relaxed mb-5">
              Translates dosage codes into a daily schedule. Know exactly when to
              take each medicine.
            </p>

            {/* Time-of-day chips */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Morning", active: true },
                { label: "Afternoon", active: false },
                { label: "Evening", active: false },
                { label: "Night", active: true },
              ].map((slot) => (
                <span
                  key={slot.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium"
                  style={{
                    borderColor: slot.active
                      ? "var(--color-brand)"
                      : "var(--color-border-light)",
                    backgroundColor: slot.active
                      ? "var(--color-brand-light)"
                      : "transparent",
                    color: slot.active
                      ? "var(--color-brand-dark)"
                      : "var(--color-ink-muted)",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: slot.active
                        ? "var(--color-brand)"
                        : "var(--color-border)",
                    }}
                  />
                  {slot.label}
                </span>
              ))}
            </div>
          </div>

          {/* Caregiver mode */}
          <div
            className="md:col-span-7 rounded-lg border p-6 sm:p-8"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-paper-warm)",
            }}
          >
            <div
              className="font-display text-3xl font-bold mb-1"
              style={{ color: "var(--color-brand)", opacity: 0.2 }}
            >
              04
            </div>
            <h3 className="font-display text-xl font-semibold text-ink mb-3">
              Caregiver mode
            </h3>
            <p className="text-ink-light text-sm leading-relaxed">
              Manage medical profiles and active prescriptions for dependents —
              elderly parents, children, or anyone in your care. Track adherence
              and safety alerts across profiles.
            </p>
          </div>
        </div>

        {/* Shorthand decoder strip */}
        <div className="mt-12">
          <div className="flex items-baseline gap-4 mb-4">
            <span
              className="font-display text-3xl font-bold select-none"
              style={{ color: "var(--color-brand)", opacity: 0.15 }}
              aria-hidden="true"
            >
              ℞
            </span>
            <h3 className="font-display text-lg font-semibold text-ink">
              Prescription shorthand decoder
            </h3>
          </div>
          <p
            className="text-sm mb-4"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Hover or tap any abbreviation to see what it means.
          </p>
          <ShorthandDecoder />
        </div>
      </div>
    </section>
  );
}
