import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { SafetySection } from "@/components/landing/SafetySection";
import { Footer } from "@/components/layout/Footer";

export default function LandingPage() {
  return (
    <>
      <HeroSection />

      <FeaturesSection />

      {/* Fade transition between sections — no hard gradient seam */}
      <div
        className="h-16 w-full"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-paper), var(--color-paper-warm))",
        }}
        aria-hidden="true"
      />

      <SafetySection />

      {/* CTA section */}
      <section
        className="w-full px-4 sm:px-6 py-16 sm:py-20 text-center"
        aria-labelledby="cta-heading"
      >
        <div className="max-w-2xl mx-auto">
          <h2
            id="cta-heading"
            className="font-display text-2xl sm:text-3xl font-bold text-ink mb-4"
          >
            Try it with your own prescription.
          </h2>
          <p className="text-ink-light mb-8 text-base sm:text-lg">
            Upload. Extract. Verify. Takes less than 30 seconds.
          </p>
          <a
            href="/scan"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 font-semibold rounded-lg border transition-colors"
            style={{
              backgroundColor: "var(--color-brand)",
              borderColor: "var(--color-brand-dark)",
              color: "white",
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
        </div>
      </section>

      <Footer />
    </>
  );
}
