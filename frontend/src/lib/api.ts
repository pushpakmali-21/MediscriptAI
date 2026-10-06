export interface ExtractedMedication {
  medicine_name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  rag_context?: string;
  confidence?: number;
}

export interface PrescriptionExtraction {
  status: string;
  source?: string;
  medications: ExtractedMedication[];
  diagnoses?: string[];
  general_notes?: string;
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
).replace(/\/+$/, "");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isExtractedMedication(value: unknown): value is ExtractedMedication {
  if (!isRecord(value)) return false;
  return [
    "medicine_name",
    "dosage",
    "frequency",
    "duration",
    "instructions",
    "rag_context",
  ].every((key) => value[key] === undefined || typeof value[key] === "string")
  && (value.confidence === undefined || typeof value.confidence === "number");
}

function isPrescriptionExtraction(
  value: unknown,
): value is PrescriptionExtraction {
  return (
    isRecord(value) &&
    typeof value.status === "string" &&
    Array.isArray(value.medications) &&
    value.medications.every(isExtractedMedication) &&
    (value.source === undefined || typeof value.source === "string") &&
    (value.diagnoses === undefined ||
      (Array.isArray(value.diagnoses) &&
        value.diagnoses.every((diagnosis) => typeof diagnosis === "string"))) &&
    (value.general_notes === undefined ||
      typeof value.general_notes === "string")
  );
}

// Timeout helper to avoid hanging requests
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeoutMs = 60000
) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs / 1000} seconds`);
    }
    throw error;
  }
};

export async function extractPrescription(
  file: File,
): Promise<PrescriptionExtraction> {
  const formData = new FormData();
  formData.append("file", file);

  // Set timeout to 45 seconds for heavy vision AI extraction
  const response = await fetchWithTimeout(`${API_BASE_URL}/v1/extract`, {
    method: "POST",
    body: formData,
  }, 45000);

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    const errorDetails =
      isRecord(errorBody) && typeof errorBody.detail === "string"
        ? errorBody.detail
        : isRecord(errorBody) && typeof errorBody.error === "string"
          ? errorBody.error
          : `Prescription extraction failed (${response.status})`;
    throw new Error(errorDetails);
  }

  const result: unknown = await response.json();
  if (!isPrescriptionExtraction(result)) {
    throw new Error("The extraction API returned an invalid response schema.");
  }
  return result;
}
