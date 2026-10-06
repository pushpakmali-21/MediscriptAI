export default function TermsPage() {
  return (
    <div className="flex-1 bg-paper px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-ink mb-6">Terms of Service</h1>
        <div className="prose prose-slate max-w-none text-ink-light leading-relaxed">
          <p className="mb-4"><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
          <p className="mb-4">
            This is a placeholder for the actual Terms of Service.
          </p>
          <h2 className="font-display text-xl font-bold text-ink mt-8 mb-4">1. Medical Disclaimer</h2>
          <p className="mb-4">
            <strong>MediScript AI is not a medical device.</strong> The information provided by this 
            application, including extracted medicines, dosages, and safety warnings, is for informational 
            purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. 
            Always seek the advice of your physician or other qualified health provider with any questions 
            you may have regarding a medical condition or medication.
          </p>
          <h2 className="font-display text-xl font-bold text-ink mt-8 mb-4">2. Accuracy of Extraction</h2>
          <p className="mb-4">
            While we use advanced AI models to read handwriting, we do not guarantee 100% accuracy. 
            Users must verify all extracted information against the original physical prescription 
            before taking any medication.
          </p>
          {/* TODO: Add full legal terms */}
        </div>
      </div>
    </div>
  );
}
