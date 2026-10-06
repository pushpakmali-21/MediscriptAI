"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { extractPrescription } from "@/lib/api";
import { usePrescriptionStore } from "@/store/usePrescriptionStore";
import { Button } from "@/components/ui/Button";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export default function ScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewTransferredRef = useRef(false);
  const router = useRouter();
  const setExtraction = usePrescriptionStore((state) => state.setExtraction);

  useEffect(() => {
    return () => {
      if (previewUrl && !previewTransferredRef.current) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setProcessingError(null);

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setProcessingError("Please upload a valid JPG, PNG, or PDF file.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setProcessingError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setFile(selectedFile);
    previewTransferredRef.current = false;
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const clearSelection = () => {
    setFile(null);
    setPreviewUrl(null);
    setProcessingError(null);
  };

  const startAnalysis = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProcessingError(null);

    try {
      const extraction = await extractPrescription(file);
      previewTransferredRef.current = true;
      setExtraction(extraction, file, previewUrl);
      router.push(`/results/${crypto.randomUUID()}`);
    } catch (error) {
      setProcessingError(
        error instanceof Error
          ? error.message
          : "Prescription extraction failed. Please try again or check your connection."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 bg-paper">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-4">
            Upload Prescription
          </h1>
          <p className="text-ink-light max-w-xl mx-auto">
            Upload a clear photo or PDF of a handwritten or printed prescription. 
            Our AI will extract medicines, dosages, and verify them against your profile.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-10 relative">
          
          {processingError && !file && (
             <div className="mb-6 p-4 rounded-lg bg-signal-light border border-signal text-signal-dark text-sm" role="alert">
               {processingError}
             </div>
          )}

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div 
                key="upload-zone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors ${
                  isDragging ? 'border-brand bg-brand-light' : 'border-border bg-paper hover:bg-paper-warm cursor-pointer'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Drag and drop or click to upload file"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    fileInputRef.current?.click();
                  }
                }}
              >
                <div className="w-14 h-14 bg-brand-light text-brand rounded-full flex items-center justify-center mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-ink mb-2">Drag & Drop your file here</h3>
                <p className="text-ink-muted mb-6 text-center max-w-sm text-sm">
                  Supports JPG, PNG, or PDF formats up to 10MB.
                </p>
                
                <Button variant="secondary" onClick={(e) => {
                  e.stopPropagation(); // prevent double click via parent
                  fileInputRef.current?.click();
                }}>
                  Browse Files
                </Button>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg, image/png, application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      validateAndSetFile(e.target.files[0]);
                    }
                  }}
                  aria-hidden="true"
                />
              </motion.div>
            ) : (
              <motion.div 
                key="preview-zone"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
              >
                <div className="relative w-full max-w-md aspect-[3/4] bg-paper-warm rounded-xl overflow-hidden border border-border mb-8 shadow-sm">
                  {previewUrl && file.type.startsWith('image/') ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={previewUrl} alt="Prescription preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-ink-muted bg-white">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      <span className="font-medium text-ink px-4 text-center break-all">{file.name}</span>
                      <span className="text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  )}
                  
                  {!isProcessing && (
                    <button 
                      onClick={clearSelection}
                      aria-label="Remove selected file"
                      className="absolute top-4 right-4 p-2 bg-ink/70 hover:bg-ink text-white rounded-full backdrop-blur-md transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>

                {isProcessing ? (
                  <div className="w-full max-w-md flex flex-col items-center text-center">
                    <div className="w-10 h-10 border-4 border-border border-t-brand rounded-full animate-spin mb-4"></div>
                    <h3 className="text-lg font-semibold text-ink mb-1">Analyzing Prescription</h3>
                    <p className="text-ink-light text-sm animate-pulse">Running OCR and entity extraction...</p>
                  </div>
                ) : (
                  <>
                  {processingError && (
                    <div className="mb-6 w-full max-w-md p-4 rounded-lg bg-signal-light border border-signal text-signal-dark text-sm flex gap-2 text-left" role="alert">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
                         <circle cx="12" cy="12" r="10"></circle>
                         <line x1="12" y1="8" x2="12" y2="12"></line>
                         <line x1="12" y1="16" x2="12.01" y2="16"></line>
                       </svg>
                      <span>{processingError}</span>
                    </div>
                  )}
                  <div className="flex gap-4 w-full max-w-md">
                    <Button 
                      onClick={clearSelection}
                      variant="ghost"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={startAnalysis}
                      variant="primary"
                      className="flex-1"
                    >
                      Begin Analysis
                    </Button>
                  </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 text-sm text-ink-muted text-center max-w-xl mx-auto">
          <p>
            <strong>Privacy Note:</strong> Your prescriptions are processed securely and are not used to train AI models. 
            All data is processed strictly in accordance with our Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
