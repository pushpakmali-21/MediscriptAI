# MediScript AI 🩺

An Intelligent Medical Prescription Interpretation, Translation and Patient Assistance System.

## Architecture Overview
MediScript AI is built with a modern, decoupled architecture:
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand.
- **Backend (Proposed):** FastAPI or Node.js.
- **Database:** PostgreSQL for relational data, Redis for caching.
- **AI/ML Layer:** 
  - Vision Language Models (VLM) / OCR for prescription extraction.
  - NLP for parsing dosages and frequencies.
  - FAISS / Qdrant for RAG-based medical knowledge retrieval.
- **Safety System:** 3-Tier Response Architecture (Explanation, Info, Safety Guidance).

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or pnpm
- Python 3.9+ (if setting up the backend)

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
# Add authentication and external API keys here
```

## Integration Guide
- **OCR/VLM Services:** Update the mock processing logic in `src/app/scan/page.tsx` to call your dedicated VLM endpoints.
- **RAG Infrastructure:** The AI Assistant in `src/app/(scanner)/results/[id]/page.tsx` currently uses mock responses. Hook this up to your LLM + Vector DB endpoints to retrieve contextual, ground-truth medical data.
- **Authentication:** Integrate your preferred provider (e.g., NextAuth.js or Firebase) into `src/store/useUserStore.ts` and the `login/register` pages.

## Usage
- **Home:** Landing page explaining the value proposition.
- **Scan:** Upload PDF or Image prescriptions.
- **Results:** Interactive bounding-box viewer and RAG AI assistant.
- **Dashboard:** Medication timelines, caregiver mode, and drug interaction alerts based on your medical profile.

## Medical Safety Disclaimer
This system strictly avoids diagnosing diseases, predicting diseases, or changing prescribed dosages. It is a patient assistance tool. Always consult a healthcare professional.
