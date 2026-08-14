# MediScript AI — End-to-End Implementation Blueprint

*A phased, hands-on engineering plan for building MediScript AI from zero to a working, testable, deployable system.*

---

## 1. Project Understanding

### 1.1 Objective
MediScript AI is a **patient-facing** system that takes a photographed/scanned/PDF **medical prescription**, digitizes it, converts medical shorthand into plain language, grounds all medical facts in a verified knowledge base (RAG), personalizes guidance against a user's health profile, and never makes diagnostic or dosage-altering decisions itself. The doctor's written prescription remains the source of truth; the AI is a translator/organizer/safety-checker layered on top of it.

This is fundamentally **three systems fused together**:
1. A **document AI system** (vision → structured text, i.e., "read the doctor's handwriting reliably").
2. A **grounded-knowledge chat/explanation system** (RAG so the LLM never invents drug facts).
3. A **personal health record / reminder application** (profile, timeline, interaction checks, notifications).

### 1.2 Expected Inputs and Outputs

| | Description |
|---|---|
| **Input** | Prescription image (camera photo), scanned PDF, or gallery upload. Optionally: voice description of a prescription. Optionally: user profile data (age, weight, allergies, chronic conditions, current medicines). |
| **Output** | Structured JSON per medicine (`medicine`, `strength`, `dosage`, `duration`, `instruction`, `route`), a plain-language explanation per item, RAG-grounded medicine facts, interaction/allergy warnings, a visual medicine timeline, and an interactive chat interface scoped to the uploaded prescription. |
| **Workflow** | Upload → image pre-processing → OCR/VLM text extraction → entity extraction/structuring → rule-based validation → confidence scoring (manual verification if low) → RAG grounding → translation/simplification → profile cross-check (allergies/interactions) → interactive UI (viewer, timeline, chat, reminders). |

### 1.3 What the Two Sample Images Reveal About the Data

Both images are **real handwritten clinical documents**, and they immediately expose the hardest engineering problems in this project — they are more informative than any spec document:

- **Image 1 (Hameed Latif Hospital prescription pad):** Dense cursive handwriting in blue ink, a long free-text medical history list (GERD, hypothyroid, migraine, IBS, appendectomy, endometriosis, cardiac arrest, asthma, anxiety/depression, etc.), a separate allergy list naming multiple drugs, lab values (e.g., "ESR-22"), an `Rx` section with **injectable** medicines, doses in mg, routes (`IV`, `SOS`), and **visible strikethroughs/corrections** (e.g., "x SOS" struck through). The letterhead itself contains three doctors' names, qualifications, and hospital contact details printed in a structured header — a very different text style (printed, multi-column) from the handwritten body.
- **Image 2 (bilingual pre-printed physical-examination form):** A **structured template** with a printed Hindi/English body-system checklist on the left, and free-hand clinical notes on the right (referral to Neurosurgery, gunshot injury, paraplegia, MRI recommendation), plus a handwritten disclaimer ("We don't take MLC cases"), a signature stamp, and a date in a different format (`6.03.2020`) from Image 1 (`26/10/20`).

**Implications for system design (this is the single most important input to the architecture):**

| Observation | Design consequence |
|---|---|
| Handwriting is highly variable, connected/cursive, and doctor-specific | Pure OCR (Tesseract) will fail on the handwritten portions; a **VLM-first approach** (Florence-2 / Qwen2.5-VL / GPT-4o-vision) is needed, with classic OCR only for the printed letterhead/form-label regions. |
| Documents mix **printed** (letterhead, form labels) and **handwritten** (clinical content) regions in the same page | Pipeline needs **layout/region detection** before recognition — don't treat the page as one OCR pass. |
| One image is bilingual (Hindi labels + English clinical notes) | Confirms Module 11 (multi-language) isn't a "nice to have" — the extraction stage must be script-agnostic from day one. |
| Strikethroughs and corrections appear inline | The model (or a rule/heuristic layer) must learn to **ignore struck-through text** rather than transcribing it as active instructions — a real patient-safety issue if mis-handled. |
| Documents carry real patient names, hospital names, and detailed personal health history | These are **PHI (Protected Health Information)**. Any dataset built from images like these needs a **de-identification step before storage or training** — this is a hard requirement, not an optimization, and is treated as its own phase below. |
| Two documents, two totally different layouts (free prescription pad vs. structured checklist form) | The model/pipeline cannot assume a single fixed template; it needs to generalize across **layout diversity**, which argues for VLM-based document understanding over template-matching OCR. |
| Domain shorthand (`SOS`, `IV`, `Inj.`, drug abbreviations) is dense and inconsistent | A **medical abbreviation dictionary + rule-based validator** (as recommended in the research-integration report) is necessary alongside the ML model, not optional polish. |

---

## 2. System Architecture

### 2.1 High-Level Flow

```
                         ┌────────────────────────────┐
   Image / PDF / Photo ─▶│  Module 1: Upload & Pre-    │
   Voice description ───▶│  processing (+ ASR path)   │
                         └──────────────┬─────────────┘
                                        ▼
                         ┌────────────────────────────┐
                         │ Module 2: Vision/OCR Service│
                         │ (layout detect → VLM/OCR)  │
                         └──────────────┬─────────────┘
                                        ▼  (raw prescription text — shared contract)
                         ┌────────────────────────────┐
                         │ Entity Extraction Service   │
                         │ (NER: medicine/dose/freq/   │
                         │  duration/route, IOB tags)  │
                         └──────────────┬─────────────┘
                                        ▼
                         ┌────────────────────────────┐
                         │ Rule-Based Validation +     │
                         │ Confidence Scoring Gate     │
                         └──────────────┬─────────────┘
                             low conf. │        │ passes
                                        ▼        ▼
                       ┌──────────────────┐  ┌─────────────────────┐
                       │ Manual Verify UI │  │ Module 3: RAG        │
                       │ (correction log) │  │ Knowledge Retrieval  │
                       └────────┬─────────┘  └──────────┬───────────┘
                                │ fine-tune data          ▼
                                │                ┌─────────────────────┐
                                │                │ Module 4: Simplify + │
                                │                │ Translate + Safety   │
                                │                │ Tiering (LLM+RAG)    │
                                │                └──────────┬───────────┘
                                │                            ▼
                                │                ┌─────────────────────┐
                                └───────────────▶│ Modules 5–14: UI,     │
                                                  │ Profile, Timeline,    │
                                                  │ Interactions, Chat    │
                                                  └───────────┬───────────┘
                                                              ▼
                                                        End User (Patient/
                                                        Caregiver/Pharmacist)
```

### 2.2 Component Breakdown

| Layer | Responsibility | Key tech |
|---|---|---|
| **Data pipeline** | Image ingestion, PHI de-identification, augmentation, dataset versioning | OpenCV, Pillow, Presidio/regex PHI scrubber, DVC |
| **Model/training pipeline** | Fine-tuning OCR/VLM (if needed), training/fine-tuning the NER head, evaluation harness | HuggingFace Transformers, PyTorch, Label Studio |
| **Inference pipeline** | Real-time request handling: pre-process → OCR/VLM → NER → validation → RAG → LLM response | FastAPI, ONNX/TorchServe or hosted API |
| **Backend/API** | Auth, profile storage, prescription storage, interaction checks, reminders, orchestration | FastAPI, PostgreSQL, Redis, Celery |
| **Frontend/UI** | Upload flow, interactive prescription viewer, chat, timeline, dashboard | Next.js, TypeScript, Tailwind CSS |
| **Deployment** | Containerization, CI/CD, monitoring, secrets | Docker, GitHub Actions, NGINX, AWS/Render |

### 2.3 Why Two Microservices (Vision/OCR vs. Entity Extraction)
Per the research-integration analysis, splitting **image → raw text** from **raw text → structured JSON** behind a single shared text contract means: (a) the same Entity Extraction Service can later accept transcribed voice input through the identical contract, (b) each service can be scaled/updated independently, and (c) the NER model can be evaluated and improved without touching the vision stack at all — a much faster iteration loop for a solo/small-team student project.

### 2.4 Additional Refinements Suggested by Comparable Published Systems
Two more recent papers tackling essentially the same problem were reviewed: Sharjeel & Arif, 2025 (CNN-LSTM + Tesseract + Streamlit) and Kanisshka et al., 2024 (EasyOCR + BioBERT). Their published architectures largely validate the two-microservice split in §2.3, and suggest three refinements worth adopting:

1. **Persist raw OCR/VLM text, not just the final structured JSON.** Kanisshka et al.'s architecture explicitly stores raw-text output in a temporary bucket between the OCR and NLP stages. Do the same in Phase 4.3: if the Entity Extraction Service has a bug or gets retrained, you can re-run extraction on stored raw text without re-running OCR/VLM — the slower, costlier step.
2. **Treat Logging & Monitoring as a first-class architecture component, not a Phase 10 afterthought.** Kanisshka et al. draw it directly on their system diagram, alongside the OCR/NLP services. Wire structured logging into every service starting in Phase 1 (even if it just writes to stdout at first) so Phase 10.4 is a matter of pointing an existing log stream at a dashboard, not building logging from scratch under deadline pressure.
3. **A dedicated API Gateway in front of the microservices is optional, not required, at this project's scale.** Kanisshka et al. include one; for a solo/small-team student build, the `backend-api` orchestration service (Phase 7.3) already plays this role well enough — add a standalone gateway only if you specifically want that pattern on your resume.

---

## 3. Implementation Phases (Overview)

| Phase | Name | Primary Deliverable |
|---|---|---|
| 0 | Requirements, Assumptions & Data Governance | Signed-off scope, PHI policy, environment plan |
| 1 | Project Setup | Running repo skeleton, CI, empty services that talk to each other |
| 2 | Dataset Collection, De-identification & Exploration | Cleaned, labeled, versioned prescription dataset |
| 3 | Data Preprocessing & Augmentation | Deterministic image pre-processing pipeline |
| 4 | Vision/OCR Baseline | Working image → raw text service |
| 5 | Entity Extraction (NER) Model | Working raw text → structured JSON service |
| 6 | RAG Knowledge Base | Grounded medicine-fact retrieval service |
| 7 | Backend/API Integration | Orchestrated FastAPI backend, profile & auth |
| 8 | Frontend/UI Integration | Full interactive app (upload → chat → timeline) |
| 9 | Testing & Validation | Automated test suite + safety guardrail tests |
| 10 | Optimization & Deployment | Deployed, monitored, versioned production system |

Phases 4–6 are the ML-heavy phases and can be developed **in parallel with dummy/mock data** while Phase 1–2 finish, if you want to move faster — but build them in this order the first time through so each stage is validated before the next depends on it.

---

## 4. Detailed Steps Within Each Phase

### Phase 0 — Requirements, Assumptions & Data Governance

**Goal:** Nail down what "done" means and — critically for a medical project — what you are *not* allowed to do with the data before you collect any of it.

| Task | What / Why | Input → Output | Tools | Considerations | Verify |
|---|---|---|---|---|---|
| 0.1 Define MVP scope | Decide which of the 14 modules are in the graded/demo MVP vs. stretch goals (recommend: Modules 1–6 + 9 for MVP; 7,8,11–14 as stretch) | Full spec → written MVP scope doc | Markdown | Don't try to build all 14 modules before Milestone 5 exists | A one-page MVP doc exists and is followed |
| 0.2 Data governance policy | Both sample images contain **real patient PHI** (names, hospital, health history). Define now: no real PHI ever committed to git, all training images are de-identified before storage, synthetic/consented data preferred for anything shared publicly (e.g., a GitHub repo or demo video) | — → Data handling policy doc | Markdown | This is a hard rule, not a suggestion — a leaked real prescription image is a real privacy harm | Policy doc reviewed before Phase 2 starts |
| 0.3 LLM/RAG choice | Decide LLM provider now (cost/latency/offline constraints) — affects everything downstream | Constraints → Decision record | GPT-4o / Gemini / local Llama 3 | A hosted API is far faster to prototype with than self-hosting an LLM as a student | Decision documented with rationale |
| 0.4 Environment plan | Python version, GPU availability (Colab/Kaggle/local), package manager | — → `environment.md` | `uv` or `conda` | If no local GPU, plan fine-tuning on Colab/Kaggle free tier from the start | `python --version`, GPU check script runs |

### Phase 1 — Project Setup

**Goal:** A repo that runs, even if every service just returns dummy data — this is your integration skeleton.

| Task | What / Why | Input → Output | Tools | Considerations | Verify |
|---|---|---|---|---|---|
| 1.1 Monorepo scaffold | Create the folder structure (see §6) so every later phase has a home | — → repo skeleton | Git, GitHub | Keep `services/` independently runnable from day 1 | `git log` shows initial commit; tree matches §6 |
| 1.2 Dockerize each service stub | Even empty FastAPI apps get a Dockerfile now, so deployment is never a last-minute problem | Stub code → Docker images | Docker | One `docker-compose.yml` should bring up all services + Postgres + Redis | `docker compose up` starts all containers healthy |
| 1.3 CI skeleton | Lint + test-runner on every push, even with zero real tests yet | Repo → GitHub Actions workflow | GitHub Actions | Fail fast on formatting (black/ruff, eslint) before logic bugs pile up | A PR triggers CI and it goes green |
| 1.4 Shared text contract | Define the JSON schema for "raw prescription text" (OCR/VLM/ASR output) and "structured entity" (NER output) *before* writing any model code | Spec → `schemas/` (Pydantic models) | Pydantic | This is the seam the whole architecture depends on — get it right once | `pytest` validates a sample payload against schema |

### Phase 2 — Dataset Collection, De-identification & Exploration

**Goal:** A labeled, privacy-safe dataset you can actually train/evaluate against.

| Task | What / Why | Input → Output | Tools | Considerations | Verify |
|---|---|---|---|---|---|
| 2.1 Source images | Collect real (with consent/appropriate sourcing) and/or public handwriting datasets (e.g., IAM handwriting for general cursive robustness) plus your own prescription samples | Raw images → `data/raw/` | — | Do not scrape random prescriptions off the internet/WhatsApp without consent — treat every image like Image 1/2 above (real PHI) | Dataset manifest lists source + consent status per image |
| 2.2 De-identify | Blur/redact patient name, hospital identifying numbers, phone numbers from every image and any transcribed text before it touches training data or git | `data/raw/` → `data/deidentified/` | OpenCV (manual bounding-box redaction), Presidio (for text) | This step is **mandatory before Phase 2.4** | Spot-check 20 random de-identified images manually |
| 2.3 Label ground truth | For a subset (start with 50–100 images), manually transcribe medicine/dose/frequency/duration/route into the JSON schema from 1.4 — this becomes your eval set | `data/deidentified/` → `data/labels/*.json` | Label Studio | Two annotators + adjudication improves label quality if you have help; otherwise be consistent with your own rules | Every labeled file validates against the Phase-1 schema |
| 2.4 Exploratory analysis | Quantify what you saw qualitatively in Images 1–2: % handwritten vs. printed area, language mix, common abbreviations, doctor-to-doctor variability | `data/deidentified/` → EDA notebook + report | Jupyter, matplotlib | This directly informs Phase 4/5 model choice — don't skip it | Notebook produces a short written summary of dataset characteristics |
| 2.5 Split dataset | Train/val/test split, stratified by document type (free-form pad vs. structured form) so both layout types appear in every split | Labeled set → `splits.json` | scikit-learn `train_test_split` | With small data (likely <500 images), keep test set small but *never* touch it until final eval | Split sizes and class balance printed and reviewed |

### Phase 3 — Data Preprocessing & Augmentation

**Goal:** A deterministic function `raw_image -> model_ready_image` used identically in training and production.

| Task | What / Why | Input → Output | Tools | Considerations | Verify |
|---|---|---|---|---|---|
| 3.1 Region detection | Separate printed letterhead/form-label regions from handwritten regions (as Images 1–2 demonstrate is necessary) | Image → bounding boxes per region type | OpenCV contour detection, or a lightweight layout model (LayoutParser) | Start rule-based (e.g., top N% = header) before reaching for a trained layout model | Visual overlay of detected regions matches human judgment on 10 samples |
| 3.2 Enhancement pipeline | Denoise, deskew, contrast-normalize, crop to content | Raw image → enhanced image | OpenCV/Pillow | Test on the two sample images specifically — Image 1's blue ink vs. Image 2's form lines need different contrast handling | Before/after visual diff on sample images; OCR confidence improves post-enhancement |
| 3.3 Augmentation for training | Synthetic variation (rotation, noise, ink-bleed, brightness) to compensate for small dataset | Enhanced images → augmented training set | `albumentations` | Don't augment the validation/test sets — only training data | Augmented samples visually inspected for realism |
| 3.4 Strike-through handling | Detect struck-through text so it isn't mis-extracted as an active instruction (per the Image-1 correction observed) | Region → flag "struck" spans | Heuristic line-detection over text bounding boxes, or VLM prompted to note strikethroughs | Safety-critical: a struck-through dose read as valid is a real harm | Unit test on a synthetically generated struck-through sample |

### Phase 4 — Vision/OCR Service (Image → Raw Text)

**Goal:** Given a prescription image, reliably output raw text (this is the "OCR/Vision Language Model" box in the architecture).

| Task | What / Why | Input → Output | Tools | Considerations | Verify |
|---|---|---|---|---|---|
| 4.0 Same-day baseline with EasyOCR | Before reaching for a VLM, try EasyOCR — open-source, handles handwritten *and* printed text, multi-language out of the box, no bounding-box config needed. A comparable published system (Kanisshka et al., 2024) used exactly this as its entire OCR stage | Enhanced image → raw text | `easyocr` (`pip install easyocr`, no GPU required to start) | Cheapest possible thing to stand up (minutes, not hours) — treat it as a lower bound to beat, not the final answer; expect it to struggle on dense cursive like Image 1 | Run against 5 held-out labeled images before investing in anything heavier |
| 4.1 Baseline with pretrained VLM | Given the handwriting variability observed, if 4.0's EasyOCR baseline underperforms, move to a strong pretrained VLM (Qwen2.5-VL or GPT-4o-vision) via prompt engineering — no training required | Enhanced image → raw text | Qwen2.5-VL (self-hosted) or hosted VLM API | This is your fastest path to "handles the hard cases" — do this before touching Tesseract/CNN-LSTM fine-tuning | Run against 10 held-out labeled images; eyeball transcription quality, especially vs. 4.0's output |
| 4.2 Classic OCR fallback for printed regions | Use Tesseract/PaddleOCR specifically on the letterhead/form-label regions detected in 3.1, since printed text doesn't need a VLM | Printed region → text | Tesseract / PaddleOCR | Cheaper and more accurate than VLM for clean printed text — use the right tool per region | CER on printed-only regions < 5% |
| 4.3 Build the microservice | Wrap 4.0/4.1+4.2 behind the shared text contract (`schemas/raw_text.py`) as an independent FastAPI service, and persist the raw extracted text (not just the final structured JSON) so extraction can be re-run later without re-running OCR/VLM | Image → `RawPrescriptionText` (stored + returned) | FastAPI | This service should know nothing about downstream NER — keep the boundary clean | `POST /extract-text` returns valid schema for a sample image, and a row appears in raw-text storage |
| 4.4 Evaluate | Compute CER/WER against the Phase-2 labeled set | Predictions vs. labels → metrics | `jiwer` (WER/CER library) | This is your first real evaluation metric for the project defense (Section 11 of the spec). A comparable published system (Sharjeel & Arif, 2025) reported ~92% recognition accuracy and 1.5 sec/image latency with a CNN-LSTM+Tesseract pipeline — a useful reference point, though your dense-cursive/bilingual samples (Images 1–2) are harder than a typical reported dataset, so don't expect to match it immediately | CER/WER numbers logged and tracked across runs |

### Phase 5 — Entity Extraction (NER) Service (Raw Text → Structured JSON)

**Goal:** Convert raw text into the `{medicine, strength, dosage, duration, instruction, route}` schema.

| Task | What / Why | Input → Output | Tools | Considerations | Verify |
|---|---|---|---|---|---|
| 5.1 Baseline with spaCy/scispaCy rules + gazetteer | Fastest path: regex + a drug-name gazetteer (RxNorm or a scraped Indian drug-name list) + spaCy's rule matcher for dose/frequency patterns (`\d+mg`, `SOS`, `OD`, `BD`, `1-0-1`) | Raw text → structured JSON | spaCy, scispaCy | This baseline alone may cover a large fraction of cases and gives you something to beat | Precision/Recall/F1 on labeled set, even if modest |
| 5.2 Trained IOB-tagging model | Per the research-integration recommendations, fine-tune a transformer encoder + BiLSTM + CRF head over IOB tags for medicine/dose/frequency/duration/route entities. Use **BioBERT** (`dmis-lab/biobert-base-cased-v1.2`) as the encoder rather than generic BERT — a comparable published system (Kanisshka et al., 2024) found BioBERT consistently outperforms generic BERT on biomedical NER F1, and that both biomedical corpus size and pretraining steps correlate with better downstream results. Their label set (`DRUG`, `DOSAGE`, `DURATION`, `TIME`, `PATIENT`) is also a useful simplified starting taxonomy if your own schema feels too granular for the data volume you have | Labeled IOB data → fine-tuned model | HuggingFace Transformers (`dmis-lab/biobert-*`) + `torchcrf` | Needs labeled data volume — if Phase 2 dataset is small, this phase may underperform 5.1 initially; that's expected and worth reporting. **Caveat:** BioBERT is English-only, which conflicts with Module 11's multilingual goal and with Image 2's bilingual content — see the corresponding entry in §10 Risks | F1 on held-out test set beats the 5.1 baseline before you switch to it in production |
| 5.3 Abbreviation/shorthand normalizer | Translate `1-0-1`, `SOS`, `OD`, `BD`, `TDS` into structured, human-readable dosage timing (feeds Module 4) | Structured JSON → normalized JSON | Rule dictionary (`abbreviations.yaml`) | Build this as a versioned, editable config file, not hardcoded — makes it easy to extend to more shorthand later | Unit tests for every abbreviation in your dictionary |
| 5.4 Rule-based validation layer | Independent safety check: dosage units plausible, frequency codes match known set, duration in sane range — forces manual verification on failure regardless of ML confidence | Structured JSON → validation result | Custom rule engine (Pydantic validators) | This is the second, independent safety net recommended in the research-integration report — do not skip even if the ML model looks accurate | Deliberately malformed inputs correctly trigger manual-verification flag |
| 5.5 Confidence scoring & gate | Combine ML confidence + rule-pass status into one verification gate | Model output + rule result → `needs_manual_review: bool` | — | Threshold should be tuned, not guessed — sweep thresholds against labeled set and pick by precision/recall trade-off | ROC-style sweep documented; threshold chosen and justified |

### Phase 6 — RAG Knowledge Base (Medical Knowledge Retrieval)

**Goal:** Ground every medicine fact in retrieved, verified sources — never let the LLM answer drug questions from parametric memory alone.

| Task | What / Why | Input → Output | Tools | Considerations | Verify |
|---|---|---|---|---|---|
| 6.1 Source verified medical content | Curate a knowledge base from trusted sources (e.g., openFDA, DrugBank open data, WHO Essential Medicines, or a licensed Indian drug database) | Public drug data → cleaned corpus | openFDA API, DrugBank (check license terms) | Do not scrape random health blogs — "verified" is the whole point of this module | Corpus has source attribution per entry |
| 6.2 Chunk & embed | Split drug monographs into retrievable chunks, embed them | Corpus → vector index | LangChain/LlamaIndex + `sentence-transformers` or OpenAI embeddings | Chunk by drug + fact-type (uses, side effects, interactions) so retrieval is precise | Spot-check retrieval for 10 known drugs returns correct chunks |
| 6.3 Vector DB deployment | Stand up FAISS (local/simple) or Qdrant (if you want a server with filtering) | Embeddings → running vector DB | FAISS or Qdrant (Docker) | FAISS is simpler for a student project; Qdrant if you need metadata filtering (e.g., by language) | `docker compose` brings up Qdrant/FAISS service and returns nearest neighbors |
| 6.4 Retrieval + generation service | Given a medicine name/question, retrieve top-K chunks and generate a grounded, cited answer | Query → grounded answer + sources | LangChain/LlamaIndex + chosen LLM | Always pass retrieved chunks into the prompt and instruct the LLM to answer *only* from them; log a refusal if nothing relevant is retrieved | Groundedness spot-check: manually verify 20 answers match their cited source |
| 6.5 Three-tier safety routing | Classify incoming questions into Explanation / Information / Safety-Guidance-only-redirect-to-doctor, per spec §5.1 | Question → tier + response | Prompt-based classifier (LLM) or simple rule+LLM hybrid | This is the core patient-safety feature of the whole product — test it adversarially (Phase 9) | Hand-written test set of "trick" questions (e.g., "should I double my dose?") all correctly route to Safety Guidance |

### Phase 7 — Backend/API Integration

**Goal:** One coherent FastAPI backend that orchestrates Phases 4–6 plus auth, profile, and persistence.

| Task | What / Why | Input → Output | Tools | Considerations | Verify |
|---|---|---|---|---|---|
| 7.1 Auth & user model | JWT-based auth, user + caregiver roles (Caregiver Mode from spec §8) | — → `/auth/*` endpoints | FastAPI + `python-jose`, PostgreSQL | Role-based access needs to be designed at the schema level now, not retrofitted | Login/signup/token-refresh flow tested with Postman/pytest |
| 7.2 Profile & prescription storage | Persist user profile (allergies, chronic conditions), prescriptions, extracted entities | Schema → PostgreSQL tables | SQLAlchemy/Alembic migrations | Encrypt PHI fields at rest per NFR (AES-256) | Migration runs cleanly; CRUD endpoints tested |
| 7.3 Orchestration endpoint | Single `/prescriptions/upload` endpoint that calls Vision service → Extraction service → Validation → RAG → returns full result | Image upload → full structured response | FastAPI, httpx (inter-service calls) | Make each inter-service call async and add timeouts — a single slow call shouldn't hang the whole request | End-to-end call with a real image from Phase 2 test set returns full pipeline output |
| 7.4 Allergy/interaction cross-check | Compare newly extracted medicines against profile allergies and current medicines (Module 9) | Structured JSON + profile → warnings list | Rule engine + small interaction dataset | Start with a small curated interaction table (5–10 well-known interaction pairs) rather than promising full coverage | Known allergy case (e.g., Amoxicillin vs. Penicillin allergy from spec example) correctly flags |
| 7.5 Correction/fine-tuning log | Persist (original, corrected) pairs whenever a user manually fixes a low-confidence field, with consent | Manual correction → logged pair | PostgreSQL table + consent flag | This is the human-in-the-loop data flywheel from the research-integration report — build the *logging* now even if you don't fine-tune again until later | A manual correction in the UI creates a row in the correction log table |

### Phase 8 — Frontend/UI Integration

**Goal:** The full patient-facing experience: upload → interactive viewer → chat → timeline → dashboard.

| Task | What / Why | Input → Output | Tools | Considerations | Verify |
|---|---|---|---|---|---|
| 8.1 Upload flow | Camera/gallery/PDF upload with pre-processing preview | UI → API call | Next.js, `react-dropzone` | Show the enhanced image next to the original so users trust what was read | Manual QA: upload each of the two sample-style images and confirm smooth flow |
| 8.2 Interactive prescription viewer | Clickable "digital twin" — clicking a medicine opens contextual chat (Module 5) | Structured JSON → UI components | React, Tailwind | Highlight low-confidence fields visually so manual verification is obvious, not hidden | Clicking each extracted medicine opens the correct chat context |
| 8.3 Manual verification UI | Where users confirm/correct low-confidence or rule-flagged fields | Flagged fields → edit form | React controlled forms | This is the UI half of Phase 5.5/7.5 — must be simple, since users may be elderly per NFR §10 | Edited field updates both displayed result and correction log |
| 8.4 Chat interface | RAG-grounded Q&A scoped to the current prescription | User question → grounded answer | Server-sent events or polling for streaming | Always render source citations for the "Information" tier answers | Ask 5 sample questions per tier and confirm correct tier + grounded answer |
| 8.5 Timeline & dashboard | Medicine Timeline (Module 7) and Health Dashboard (Module 14) | Structured data → calendar/dashboard views | React, a charting lib (recharts) | Keep this simple for MVP — a list grouped by time slot is enough before building a full calendar widget | Dashboard reflects current/past medicines correctly after a few test uploads |

### Phase 9 — Testing and Validation

**Goal:** Confidence that the system is both functionally correct and safe.

| Test type | What it covers | Example |
|---|---|---|
| **Unit tests** | Individual functions: abbreviation normalizer, rule validators, schema validation | `test_normalize_sos()`, `test_reject_invalid_dosage_unit()` |
| **Data validation tests** | Every labeled/training file conforms to schema; no PHI leakage in `data/deidentified/` | Automated PHI-pattern scanner run in CI on any new data commit |
| **Model evaluation** | CER/WER (Phase 4.4), Precision/Recall/F1 (Phase 5.2), Retriever Recall@K / MRR (Phase 6) | Tracked per model version in an experiment log (e.g., a simple CSV or Weights & Biases) |
| **Integration tests** | Full `/prescriptions/upload` pipeline against fixture images | pytest hitting a docker-compose test stack |
| **Edge-case tests** | Struck-through text, bilingual documents, blurry photos, empty/corrupt uploads, unknown drug names | Reuse Image-1/Image-2-style fixtures (de-identified/synthetic versions) specifically because they contain these edge cases |
| **Safety/adversarial tests** | Three-tier routing under trick questions ("can I stop my antibiotic early?", "can I take double the dose?") | Hand-written adversarial question set; every case must NOT return direct dosing/diagnostic advice |
| **Usability testing** | Real target users (not just you) attempt the upload → verify → chat flow unscripted — a comparable published system (Sharjeel & Arif, 2025) ran exactly this with pharmacists and reported it as their most convincing evidence of real-world fit | 3–5 informal sessions with friends/family playing "patient" or "caregiver"; note where they get confused, especially at the manual-verification step (Phase 8.3) |
| **End-to-end (E2E) tests** | Full user journey: signup → upload → verify → chat → timeline | Playwright/Cypress scripted through the UI |

### Phase 10 — Optimization and Deployment

**Goal:** A reproducible, monitored, versioned production deployment.

| Task | What / Why | Considerations |
|---|---|---|
| 10.1 Containerize all services | Each of Vision, Extraction, RAG, Backend, Frontend gets its own Dockerfile + a `docker-compose.prod.yml` | Keep dev and prod compose files close in structure to avoid "works on my machine" |
| 10.2 CI/CD pipeline | On merge to `main`: run tests → build images → push to registry → deploy | GitHub Actions | Gate deployment on the Phase 9 test suite passing, especially safety tests |
| 10.3 Model & data versioning | Every model checkpoint and dataset version gets a tag; log which model version served which prediction | DVC or simple checkpoint-naming convention + a `MODEL_VERSION` env var surfaced in API responses | Reproducibility for the project defense — you should be able to say exactly which model produced a given output |
| 10.4 Logging & monitoring | Structured logs per request (latency per stage, confidence scores, which tier triggered), access logs for PHI-adjacent endpoints (security NFR) | Python `structlog`, a simple hosted dashboard (Grafana/Cloud provider default) | Track the "process in under 10 seconds" NFR directly in logs |
| 10.5 Retraining loop | Periodically retrain/fine-tune the NER model on the accumulated correction log (Phase 7.5) | Manual trigger is fine for a student project — full automation is a stretch goal | Document the retraining procedure even if you only run it once or twice |
| 10.6 Security pass | TLS in transit, per-record access logging, a pre-release checklist (from the research-integration report's Point 5) | Let's Encrypt/NGINX, access-log review | Do this **before** any public demo deployment, not after |

---

## 5. Dataset and Model Strategy

### 5.1 Dataset Organization
```
data/
  raw/                 # never committed to git — real PHI lives here only, locally/private storage
  deidentified/         # PHI-redacted images, safe to version with DVC
  labels/               # ground-truth JSON per image, matching schemas/raw_text.py + entity schema
  splits.json            # train/val/test file lists, stratified by layout type
  synthetic/              # augmented + synthetically generated prescription-style images
```

### 5.2 Preprocessing Pipeline
`raw_image → region-detect → deskew/denoise/contrast → crop → (train: augment) → model input`, implemented as one shared, tested function used identically in training and inference (Phase 3).

### 5.3 Train/Val/Test Splitting
- Stratify by **document layout type** (free-form pad vs. structured form) and, if possible, by **originating clinic/doctor**, so the model isn't evaluated on handwriting it implicitly memorized from the same doctor it trained on.
- With a small dataset, prefer **k-fold cross-validation** over a single fixed split for more reliable metrics — report mean ± std, not a single number.

### 5.4 Data-Quality Issues to Expect (based on the sample images)
- Inconsistent date formats (`26/10/20` vs `6.03.2020`).
- Struck-through/corrected text.
- Mixed scripts (Hindi + English) even outside the explicitly "multilingual" use case.
- Printed stamps/signatures overlapping handwritten text.
- Very small sample counts relative to handwriting diversity — expect the model to plateau early; document this honestly as a limitation.

### 5.5 Model Architecture Recommendations
| Component | Recommendation | Why |
|---|---|---|
| Vision/OCR | Pretrained VLM (Qwen2.5-VL or hosted GPT-4o-vision) via prompting first; fine-tune only if baseline CER is unacceptably high and you have enough labeled pairs | Training a VLM from scratch is infeasible for a student project and unnecessary — transfer learning is clearly correct here |
| Entity extraction | Rule/gazetteer baseline (5.1) in the MVP. For the "advanced" version: fine-tune **BioBERT** + BiLSTM + CRF over IOB tags if English-only accuracy is the priority (published evidence favors this — see §5.6). Switch to a multilingual encoder instead (e.g., `xlm-roberta-base`) if Hindi/Marathi/Gujarati support (Module 11) is needed before the defense, since BioBERT itself is English-only | Small dataset favors fine-tuning a strong pretrained encoder either way; the BioBERT-vs-multilingual choice is a scope decision, not a modeling one — make it explicitly (Phase 0.1) |
| RAG embeddings | Off-the-shelf sentence-transformer or provider embedding API | No training needed; this is a retrieval-engineering problem, not a modeling one |

### 5.6 Evaluation Metrics
- OCR/Vision: **CER, WER** (Section 11 of spec).
- Extraction: **Precision, Recall, F1** per entity type.
- RAG: **Recall@K, MRR**.
- Safety: **Hallucination rate** (manual audit sample), **groundedness** (does the answer's claims appear in the retrieved chunks — checkable programmatically via simple substring/semantic-similarity checks, or manually for a defense demo).
- **Reference benchmarks from comparable published systems** (useful targets, not guarantees — their datasets were likely cleaner and less bilingual than yours): Sharjeel & Arif, 2025 reported ~92% recognition accuracy, 90% precision, 88% recall, and 1.5 sec/image latency with a CNN-LSTM+Tesseract pipeline; Kanisshka et al., 2024 found BioBERT consistently beats generic BERT on biomedical NER F1, with both biomedical pretraining-corpus size and pretraining-step count correlating with better downstream performance.

### 5.7 Handling Class Imbalance, Overfitting, Insufficient Data
- **Insufficient data:** lean harder on pretrained-model transfer learning; supplement with synthetic augmentation (3.3) and public handwriting datasets (IAM) for general robustness, even though they aren't medical-specific — they still help the vision backbone generalize to messy cursive.
- **Overfitting:** with small data, use k-fold CV, early stopping on validation F1/CER, and dropout/weight-decay on any fine-tuned head.
- **Class imbalance in entities** (e.g., `route` appearing far less often than `medicine`): report per-class F1, not just micro-averaged F1, so a defense committee can see where the model is weak.

---

## 6. Codebase Structure

```
mediscript-ai/
├── services/
│   ├── vision-ocr/               # Phase 4: image -> raw text microservice
│   │   ├── app/
│   │   │   ├── main.py           # FastAPI entrypoint
│   │   │   ├── preprocessing.py  # Phase 3 pipeline
│   │   │   ├── vlm_client.py     # VLM/OCR calls
│   │   │   └── schemas.py
│   │   ├── tests/
│   │   └── Dockerfile
│   ├── entity-extraction/        # Phase 5: raw text -> structured JSON microservice
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── ner_model.py
│   │   │   ├── rules/
│   │   │   │   ├── abbreviations.yaml
│   │   │   │   └── validators.py
│   │   │   └── schemas.py
│   │   ├── tests/
│   │   └── Dockerfile
│   ├── rag-service/               # Phase 6: retrieval + grounded generation
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── retriever.py
│   │   │   ├── safety_tiering.py
│   │   │   └── vector_store/
│   │   ├── tests/
│   │   └── Dockerfile
│   └── backend-api/                # Phase 7: orchestration, auth, persistence
│       ├── app/
│       │   ├── main.py
│       │   ├── routers/ (auth.py, profile.py, prescriptions.py)
│       │   ├── models/ (SQLAlchemy models)
│       │   ├── db.py
│       │   └── clients/ (calls to the three services above)
│       ├── alembic/
│       ├── tests/
│       └── Dockerfile
├── frontend/                       # Phase 8
│   ├── app/ (Next.js routes)
│   ├── components/
│   └── package.json
├── ml/
│   ├── notebooks/                  # Phase 2.4 EDA, experiments
│   ├── training/
│   │   ├── train_ner.py
│   │   └── eval_ner.py
│   └── experiments/                # logged run configs + metrics
├── data/                             # per §5.1 (mostly git-ignored/DVC-tracked)
├── schemas/                          # shared Pydantic contracts (Phase 1.4)
├── docker-compose.yml
├── docker-compose.prod.yml
├── .github/workflows/ci.yml
└── docs/
    ├── data_governance.md            # Phase 0.2
    └── architecture.md
```

---

## 7. Milestone-Based Development

| Milestone | "Done" means |
|---|---|
| **M1 — Minimal working prototype** | A hardcoded/dummy pipeline: upload an image, get back a *mocked* structured JSON response rendered in a bare UI. Proves the plumbing (Docker, API, frontend call) works end to end before any ML is real. |
| **M2 — Working data pipeline** | Phase 2+3 complete: de-identified, labeled, split dataset with a working preprocessing function, verified against the two sample-style images. |
| **M3 — First trained baseline model** | Phase 4.1 (VLM baseline text extraction) and Phase 5.1 (rule/gazetteer extraction) both return real, non-mocked structured JSON for a held-out image, with CER/WER and F1 numbers recorded. |
| **M4 — Reliable inference** | Phase 5.2 (trained NER), 5.4 (validation), 5.5 (confidence gating) integrated; the pipeline correctly flags at least one deliberately malformed test case for manual review. |
| **M5 — End-to-end application** | Phases 6–8 complete: a real user can sign up, upload a prescription, see the interactive viewer, ask a RAG-grounded question, and see it on their timeline. |
| **M6 — Production-ready deployment** | Phase 9 test suite green (including safety/adversarial tests), Phase 10 deployment live behind HTTPS with logging/monitoring and a documented model version. |

---

## 8. Testing and Validation
*(Summarized here; full detail in Phase 9 above.)* Every phase should produce something independently testable — this is why each phase above ends with a "Verify" step. At the system level, before calling M6 "done," run the full pipeline against **both original sample-style scenarios**: a dense free-form multi-condition prescription pad (Image 1 style) and a bilingual structured form with a referral note (Image 2 style). If both process without crashing and produce sensible, appropriately-flagged output, you have empirical evidence the system generalizes across the two layout extremes you were given.

---

## 9. Deployment and Production Readiness
- **Packaging:** one Docker image per service, orchestrated via `docker-compose.prod.yml` or a lightweight orchestrator (Render/Railway for a student budget; k8s only if you specifically want that on your resume).
- **Model versioning:** tag every NER/VLM-prompt-version change; store the tag alongside every prediction log so you can always trace an output back to the exact model/prompt that produced it.
- **Reproducibility:** pin all dependency versions (`requirements.txt`/`poetry.lock`), and keep the preprocessing function byte-for-byte identical between training and serving (Phase 3).
- **Logging/error handling:** structured logs per pipeline stage; graceful degradation (e.g., if the RAG service times out, still return the extracted structured data with a "explanation unavailable" note rather than failing the whole request).
- **Scalability:** stateless services behind the API gateway scale horizontally trivially; the stateful pieces (Postgres, vector DB) are the ones to plan capacity for.
- **Retraining:** documented, repeatable procedure (Phase 10.5) using the correction log (Phase 7.5) as the data flywheel.

---

## 10. Risks and Unknowns

| Risk/Unknown | Why it matters | What to do |
|---|---|---|
| **Dataset size and sourcing is not yet defined** | The entire ML strategy (transfer learning vs. training from scratch, expected accuracy) depends on how many labeled images you can realistically obtain | Decide and document a target dataset size (e.g., "200 de-identified images, 100 hand-labeled") before Phase 2 begins |
| **PHI in source images** | Both sample images contain real, identifiable patient information; mishandling this is a real privacy/ethics issue, not just a technical one | Enforce Phase 0.2/2.2 de-identification as a hard gate before any data is stored or committed |
| **Licensing of medical knowledge sources for RAG** | Some drug databases require licenses or have usage restrictions | Verify license terms for DrugBank/openFDA/whatever source you pick before building the whole RAG service on it |
| **Handwriting generalization** | A model tuned on a handful of doctors' handwriting may not generalize to new doctors at demo time | Explicitly test on out-of-sample handwriting (e.g., a friend's prescription you didn't train on) before the defense |
| **LLM cost/latency for RAG + chat** | Hosted LLM calls have per-token cost and latency that affects the "<10 second" NFR | Prototype with a hosted API, but benchmark latency early (Phase 6.4) so the 10-second budget is validated, not assumed |
| **Regulatory framing ("HIPAA-compliant design")** | HIPAA is a US regulation; if this is an academic project in India (per hospital examples), the actually-applicable framework may differ (e.g., India's DPDP Act) | Clarify which regulatory framework is actually relevant to your deployment context and adjust NFR language accordingly — this is worth clarifying for the project defense |
| **Struck-through/corrected text handling accuracy** | Mis-reading a struck-through instruction as active is a direct patient-safety failure mode | Treat Phase 3.4 and its test coverage as non-negotiable, not a stretch feature |
| **BioBERT (English-only) vs. multilingual requirement (Module 11)** | The strongest published domain-specific NER encoder (BioBERT) is trained only on English biomedical text, but Image 2 already shows real prescriptions/forms mixing Hindi and English | Decide explicitly in Phase 0.1 whether the MVP/defense targets English-only accuracy (favor BioBERT) or early multilingual support (favor a multilingual encoder like XLM-R, accepting a probable biomedical-accuracy trade-off) — don't discover this tension mid-Phase-5 |

---

## 11. Recommended Build Order

1. **Phase 0** — write the MVP scope + data governance policy (half a day).
2. **Phase 1** — repo skeleton, Docker Compose, CI, shared schemas (get `docker compose up` working before anything else).
3. **Milestone 1** — wire a dummy end-to-end call (upload → mocked JSON → rendered in a bare frontend page) so the integration seam is proven early. *Optional shortcut:* build this first pass in **Streamlit** instead of Next.js — a comparable published system (Sharjeel & Arif, 2025) built its entire working prototype this way, and it can get you a clickable end-to-end demo in hours rather than days. Migrate to the Phase 8 Next.js frontend once the pipeline is real; Streamlit can even stick around afterward as an internal debugging/admin tool.
4. **Phase 2 (2.1–2.3)** — collect and de-identify ~20–30 sample images first (not the full target count) so Phase 3/4 have real data to test against immediately.
5. **Phase 3** — build and unit-test the preprocessing pipeline against those first 20–30 images, explicitly including one Image-1-style and one Image-2-style sample.
6. **Phase 4.1** — get the VLM baseline returning real text on real images; this is usually the single most motivating milestone since it's the first "wow, it actually read the handwriting" moment.
7. **Phase 5.1** — rule-based extraction on top of 4.1's output; you now have a real (if rough) end-to-end structured result — replace the Milestone-1 mock with this.
8. **Phase 5.4–5.5** — validation + confidence gating, so the system is safe-by-default before it's smart.
9. **Phase 6.1–6.4** — RAG service, tested standalone against known drugs before wiring into the pipeline.
10. **Phase 7** — backend orchestration tying 4–6 together behind one API, plus auth/profile.
11. **Phase 8** — frontend, starting with upload + viewer, then chat, then timeline/dashboard last (lowest risk, most "polish").
12. **Finish remaining Phase 2 data collection + Phase 5.2 (trained NER)** in parallel with Phase 7/8, since the rule-based baseline already keeps the system usable while the trained model is developed.
13. **Phase 9** — full test suite, with safety/adversarial tests written *before* the demo, not after.
14. **Phase 10** — containerize, deploy, add monitoring, and do the security pass, in that order — don't deploy publicly before the security pass.

Each numbered step above should leave you with something you can run and show — that is the guiding principle throughout: never move to the next step without a working, verifiable artifact from the current one.
