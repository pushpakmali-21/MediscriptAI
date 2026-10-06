"use client";

import { useEffect, useState, useRef } from "react";
import { UploadCloud, Camera, FileText, CheckCircle, AlertCircle, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { extractPrescription } from "@/lib/api";
import { usePrescriptionStore } from "@/store/usePrescriptionStore";

export default function ScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      previewTransferredRef.current = false;
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      alert("Please upload a valid Image or PDF file.");
    }
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
    setProcessingStage("Uploading and analyzing prescription...");

    try {
      const extraction = await extractPrescription(file);
      previewTransferredRef.current = true;
      setExtraction(extraction, file, previewUrl);
      router.push(`/results/${crypto.randomUUID()}`);
    } catch (error) {
      setProcessingError(
        error instanceof Error
          ? error.message
          : "Prescription extraction failed. Please try again.",
      );
    } finally {
      setIsProcessing(false);
      setProcessingStage("");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Upload Prescription</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Upload a clear photo or PDF of your handwritten or printed prescription. 
          Our AI will instantly extract medicines, dosages, and safety information.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10">
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div 
              key="upload-zone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Drag & Drop your file here</h3>
              <p className="text-slate-500 mb-8 text-center max-w-sm">
                Supports JPG, PNG, or PDF formats up to 10MB.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                  <FileText size={18} /> Browse Files
                </button>
                <button 
                  className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                  <Camera size={18} /> Use Camera
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg, image/png, application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="preview-zone"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="relative w-full max-w-md aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200 mb-8">
                {previewUrl && file.type.startsWith('image/') ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={previewUrl} alt="Prescription preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <FileText size={48} className="mb-4" />
                    <span className="font-medium">{file.name}</span>
                  </div>
                )}
                
                {!isProcessing && (
                  <button 
                    onClick={clearSelection}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {isProcessing ? (
                <div className="w-full max-w-md flex flex-col items-center text-center">
                  <Loader2 size={32} className="text-blue-600 animate-spin mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Analyzing Prescription</h3>
                  <p className="text-slate-500 animate-pulse">{processingStage}</p>
                </div>
              ) : (
                <>
                {processingError && (
                  <p role="alert" className="mb-4 text-sm text-red-600">
                    {processingError}
                  </p>
                )}
                <div className="flex gap-4">
                  <button 
                    onClick={clearSelection}
                    className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={startAnalysis}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium shadow-md transition-colors flex items-center gap-2"
                  >
                    Begin Analysis <CheckCircle size={20} />
                  </button>
                </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-xl flex items-start gap-3 border border-blue-100 text-sm">
        <AlertCircle className="shrink-0 mt-0.5 text-blue-600" size={18} />
        <p>
          <strong>Privacy Note:</strong> Your prescriptions are processed securely and are not used to train our AI models. 
          Please ensure all personal sensitive information is cropped or obscured if you prefer.
        </p>
      </div>
    </div>
  );
}
