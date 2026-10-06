export default function PrivacyPage() {
  return (
    <div className="flex-1 bg-paper px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-ink mb-6">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none text-ink-light leading-relaxed">
          <p className="mb-4"><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
          <p className="mb-4">
            This is a placeholder for the actual Privacy Policy. 
            In a production environment, this page must detail exactly how medical data, 
            prescriptions, and user profiles are stored, processed, and deleted.
          </p>
          <h2 className="font-display text-xl font-bold text-ink mt-8 mb-4">1. Data Collection</h2>
          <p className="mb-4">
            We collect uploaded prescription images strictly for the purpose of running 
            OCR and entity extraction. We do not use your medical data to train AI models.
          </p>
          <h2 className="font-display text-xl font-bold text-ink mt-8 mb-4">2. Local Storage</h2>
          <p className="mb-4">
            Medical profiles (allergies, weight, conditions) are currently stored locally 
            on your device using browser storage. Clearing your browser data will delete this information.
          </p>
          {/* TODO: Add full legal privacy policy */}
        </div>
      </div>
    </div>
  );
}
