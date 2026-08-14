# MediScript-AI

MediScript-AI is an intelligent medical document processing and entity extraction pipeline that converts messy, handwritten doctor prescriptions and medical records into structured, validated clinical data with grounded explanations.

## Project Structure

```
MediScript-AI/
├── data/
│   ├── raw/            # Raw input documents/prescriptions (unredacted PHI - local only)
│   ├── deidentified/   # De-identified/redacted images
│   └── labels/         # Ground truth annotations and structured JSON schemas
├── notebooks/          # Exploratory data analysis, baseline experiments & prototyping
├── services/
│   ├── vision/         # Vision / OCR microservice (Image -> Raw Text)
│   ├── extraction/     # Entity Extraction & NER microservice (Raw Text -> Structured JSON)
│   └── rag/            # Retrieval-Augmented Generation service for clinical grounded context
├── backend/            # Central orchestration API, auth, database, and business logic
├── frontend/           # Web interface for document upload, review, and validation
├── tests/              # End-to-end and cross-service test suites
├── requirements.txt    # Project dependencies
└── README.md           # Project documentation
```
