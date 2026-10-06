"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
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
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            No prescription results found
          </h1>
          <p className="mt-2 text-slate-600">
            Upload a prescription to view its extracted information.
          </p>
          <Link
            href="/scan"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            <ArrowLeft size={18} /> Upload prescription
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/scan"
            aria-label="Back to prescription upload"
            className="rounded-full p-2 transition-colors hover:bg-slate-100"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Prescription Analysis
            </h1>
            <p className="text-xs text-slate-500">
              {extraction.source
                ? `Processed via ${extraction.source}`
                : "Extracted prescription information"}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 p-6 lg:grid-cols-2">
        <section className="flex min-h-[60vh] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
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
              className="h-[75vh] w-full"
            />
          ) : (
            <div className="text-center text-slate-500">
              <FileText size={40} className="mx-auto mb-4 text-slate-400" />
              <p>
                The uploaded file preview is unavailable. Please upload the
                prescription again.
              </p>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
              Extracted Medications
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">
                {extraction.medications.length}
              </span>
            </h2>

            {extraction.medications.length === 0 ? (
              <p className="text-sm text-slate-500">
                No medications were found in this prescription.
              </p>
            ) : (
              <div className="space-y-4">
                {extraction.medications.map((medication, index) => (
                  <article
                    key={`${medication.medicine_name ?? "medication"}-${index}`}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <h3 className="text-lg font-bold text-slate-900">
                      {medication.medicine_name ?? "Unnamed medication"}
                    </h3>
                    <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      <div>
                        <dt className="font-medium text-slate-500">Dosage</dt>
                        <dd className="text-slate-800">
                          {medication.dosage || "Not provided"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-500">
                          Frequency
                        </dt>
                        <dd className="text-slate-800">
                          {medication.frequency || "Not provided"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-500">
                          Duration
                        </dt>
                        <dd className="text-slate-800">
                          {medication.duration || "Not provided"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-500">
                          Instructions
                        </dt>
                        <dd className="text-slate-800">
                          {medication.instructions || "Not provided"}
                        </dd>
                      </div>
                    </dl>
                    {medication.rag_context && (
                      <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                        {medication.rag_context}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>

          {extraction.diagnoses && extraction.diagnoses.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-lg font-bold text-slate-800">
                Diagnoses &amp; Symptoms
              </h2>
              <ul className="list-inside list-disc space-y-1 text-slate-700">
                {extraction.diagnoses.map((diagnosis, index) => (
                  <li key={`${diagnosis}-${index}`}>{diagnosis}</li>
                ))}
              </ul>
            </section>
          )}

          {extraction.general_notes && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-lg font-bold text-slate-800">
                Clinical Notes
              </h2>
              <p className="whitespace-pre-wrap text-slate-700">
                {extraction.general_notes}
              </p>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}
