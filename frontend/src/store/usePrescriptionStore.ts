import { create } from "zustand";
import type { PrescriptionExtraction } from "@/lib/api";

interface PrescriptionState {
  extraction: PrescriptionExtraction | null;
  uploadedFile: File | null;
  previewUrl: string | null;
  setExtraction: (
    extraction: PrescriptionExtraction,
    file: File,
    previewUrl: string | null,
  ) => void;
  clearExtraction: () => void;
}

export const usePrescriptionStore = create<PrescriptionState>((set) => ({
  extraction: null,
  uploadedFile: null,
  previewUrl: null,
  setExtraction: (extraction, uploadedFile, previewUrl) =>
    set({ extraction, uploadedFile, previewUrl }),
  clearExtraction: () =>
    set({ extraction: null, uploadedFile: null, previewUrl: null }),
}));
