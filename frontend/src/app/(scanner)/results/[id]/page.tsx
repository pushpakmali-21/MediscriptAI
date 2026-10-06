"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ExtractedRow } from "@/components/ui/ExtractedRow";
import { ButtonLink } from "@/components/ui/Button";
import { usePrescriptionStore } from "@/store/usePrescriptionStore";

export default function ResultsPage() {
  const extraction = usePrescriptionStore((state) => state.extraction);
  const uploadedFile = usePrescriptionStore((state) => state.uploadedFile);
  const previewUrl = usePrescriptionStore((state) => state.previewUrl);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!extraction) {
    return (
      <main className="flex-1 bg-paper flex flex-col items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-lg rounded-xl border border-border bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-ink mb-2">
            No prescription results found
          </h1>
          <p className="text-ink-light mb-6">
            Upload a prescription to view its extracted information.
          </p>
          <ButtonLink href="/scan" variant="primary">
            Upload prescription
          </ButtonLink>
        </div>
      </main>
    );
  }

  const hasLowConfidence = extraction.medications.some(
    (m) => (m as any).confidence !== undefined && (m as any).confidence < 0.6
  );

  return (
    <div className="flex-1 bg-paper pb-20">
      <header className="sticky top-14 z-40 flex items-center justify-between border-b border-border-light bg-paper/90 backdrop-blur-md px-6 py-4">
        <div className="flex items-center gap-4 max-w-6xl mx-auto w-full">
          <Link
            href="/scan"
            aria-label="Back to prescription upload"
            className="rounded-full p-2 transition-colors hover:bg-paper-warm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-ink">
              Prescription Analysis
            </h1>
            <p className="text-xs text-ink-muted">
              {extraction.source
                ? `Processed via ${extraction.source}`
                : "Extracted prescription information"}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 p-6 lg:grid-cols-2 items-start mt-6">
        {/* Left column: Original Document */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-xl text-ink">Original Document</h2>
          <div className="flex min-h-[60vh] items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-4 paper-grain">
            {previewUrl && uploadedFile?.type.startsWith("image/") ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewUrl}
                alt="Uploaded prescription"
                className="max-h-[75vh] w-full object-contain"
              />
            ) : previewUrl && uploadedFile?.type === "application/pdf" ? (
              <iframe
                src={previewUrl}
                title="Uploaded prescription PDF"
                className="h-[75vh] w-full border-0 rounded-lg"
              />
            ) : (
              <div className="text-center text-ink-muted">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <p>
                  Preview is unavailable. Please upload again.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Right column: Extracted Data */}
        <section className="space-y-6">
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-display font-bold text-ink">
              Extracted Medicines
              <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand border border-brand/20">
                {extraction.medications.length}
              </span>
            </h2>

            {/* Verification Prompt for low confidence */}
            {hasLowConfidence && (
              <div className="mb-6 rounded-lg border p-4 bg-signal-light border-signal text-signal-dark text-sm flex items-start gap-3 shadow-sm" role="alert">
                 <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5" aria-hidden="true">
                  <path d="M10 2L1 18h18L10 2z" stroke="currentColor" strokeWidth="1.5" fill="var(--color-signal-light)" />
                  <path d="M10 8v4M10 14h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div>
                  <p className="font-semibold mb-1 text-signal-dark">Please verify carefully</p>
                  <p className="text-signal">One or more items were extracted with low confidence. Please verify them against your original prescription before saving to your profile.</p>
                </div>
              </div>
            )}

            {extraction.medications.length === 0 ? (
              <p className="text-sm text-ink-light bg-paper-warm border border-border p-4 rounded-lg">
                No medications were found in this prescription.
              </p>
            ) : (
              <div className="space-y-4">
                {extraction.medications.map((medication, index) => (
                  <ExtractedRow
                    key={`${medication.medicine_name ?? "medication"}-${index}`}
                    medicineName={medication.medicine_name || "Unknown"}
                    dosage={medication.dosage || "N/A"}
                    frequency={medication.frequency || "0-0-0"}
                    duration={medication.duration || "N/A"}
                    instructions={medication.instructions || "No specific instructions"}
                    confidence={(medication as any).confidence}
                  />
                ))}
              </div>
            )}
          </div>

          {extraction.diagnoses && extraction.diagnoses.length > 0 && (
            <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-bold text-ink font-display">
                Diagnoses &amp; Symptoms
              </h2>
              <ul className="list-inside list-disc space-y-1 text-ink-light">
                {extraction.diagnoses.map((diagnosis, index) => (
                  <li key={`${diagnosis}-${index}`}>{diagnosis}</li>
                ))}
              </ul>
            </section>
          )}

          {extraction.general_notes && (
            <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-bold text-ink font-display">
                Clinical Notes
              </h2>
              <p className="whitespace-pre-wrap text-ink-light font-handwriting text-xl">
                {extraction.general_notes}
              </p>
            </section>
          )}

          <div className="flex gap-4 pt-4 border-t border-border-light">
             <ButtonLink href="/dashboard" variant="primary" className="w-full">
               Save to Dashboard
             </ButtonLink>
             <ButtonLink href="/scan" variant="secondary" className="w-full">
               Scan Another
             </ButtonLink>
          </div>
        </section>
      </main>
    </div>
  );
}
