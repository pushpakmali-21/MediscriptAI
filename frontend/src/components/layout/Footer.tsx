import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="w-full border-t px-4 sm:px-6 py-10 sm:py-12"
      style={{
        borderColor: "var(--color-border-light)",
        backgroundColor: "var(--color-paper-warm)",
      }}
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto">
        {/* Medical disclaimer */}
        <div
          className="rounded-lg border p-4 mb-8 text-sm"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-paper)",
          }}
          role="alert"
          aria-label="Medical disclaimer"
        >
          <p
            className="font-semibold mb-1"
            style={{ color: "var(--color-ink)" }}
          >
            Medical disclaimer
          </p>
          <p style={{ color: "var(--color-ink-light)" }}>
            MediScript AI is not a substitute for professional medical advice,
            diagnosis, or treatment. Always consult your doctor or pharmacist
            before making decisions about your medications. AI-extracted
            information should be verified against the original prescription.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <span
                className="font-display text-2xl font-bold"
                style={{ color: "var(--color-brand)" }}
              >
                ℞
              </span>
              <span className="font-display font-semibold text-ink">
                MediScript<span style={{ color: "var(--color-brand)" }}>AI</span>
              </span>
            </Link>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-ink-muted)" }}
            >
              Your prescription, finally readable.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3
              className="font-semibold text-sm mb-3"
              style={{ color: "var(--color-ink)" }}
            >
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/scan"
                  className="text-sm transition-colors hover:text-brand"
                  style={{ color: "var(--color-ink-light)" }}
                >
                  Scan prescription
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm transition-colors hover:text-brand"
                  style={{ color: "var(--color-ink-light)" }}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-sm transition-colors hover:text-brand"
                  style={{ color: "var(--color-ink-light)" }}
                >
                  How it works
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3
              className="font-semibold text-sm mb-3"
              style={{ color: "var(--color-ink)" }}
            >
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm transition-colors hover:text-brand"
                  style={{ color: "var(--color-ink-light)" }}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm transition-colors hover:text-brand"
                  style={{ color: "var(--color-ink-light)" }}
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm transition-colors hover:text-brand"
                  style={{ color: "var(--color-ink-light)" }}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Data handling */}
          <div>
            <h3
              className="font-semibold text-sm mb-3"
              style={{ color: "var(--color-ink)" }}
            >
              Your data
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-ink-light)" }}
            >
              Uploaded prescriptions are processed in-memory and not stored
              permanently. Medical profiles are stored locally in your browser.
              No health data is shared with third parties.
            </p>
            {/* TODO: Update data handling statement with actual retention/deletion policy when backend storage is finalized */}
          </div>
        </div>

        <div className="rx-divider mb-6" />

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{ color: "var(--color-ink-muted)" }}
        >
          <p>© {new Date().getFullYear()} MediScript AI. All rights reserved.</p>
          <p>
            Not a medical device. For informational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
