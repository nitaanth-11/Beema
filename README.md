# Beema - AI-Powered Insurance Claims Investigation System
## Data Engineering & RAW Data Layer Pipeline

This component implements the reproducible, high-throughput data acquisition and **RAW Delta Lake** ingestion layer for the **Beema AI-Powered Insurance Claims Investigation System**.

---

## 1. Executive Summary

- **Objective**: Ingest multi-source insurance, warranty, and fraud claims data into an immutable, audit-compliant **RAW Delta Lake** layer without business transformations.
- **Datasets Ingested**:
  1. **Primary**: [Hugging Face `ziadatalabs/FreeInsuranceClaims100M`](https://huggingface.co/datasets/ziadatalabs/FreeInsuranceClaims100M) — Manageable sample of 25,000 synthetic P&C records acquired via HTTP range streaming.
  2. **Secondary**: [Kaggle `warranty-claims`](https://www.kaggle.com/competitions/warranty-claims/data) — 5,000 consumer electronics/appliance warranty records.
  3. **Tertiary**: [Kaggle `frauddetection`](https://www.kaggle.com/competitions/frauddetection/data) — 5,000 auto insurance claims records from the Oracle benchmark.
- **Total Ingested RAW Records**: **35,000 records** across 3 ACID Delta Lake tables.
- **Delta Lake Features**: Full ACID transaction log (`_delta_log/00000000000000000000.json`), Snappy Parquet columnar storage, schema enforcement, and zero data leakage to GitHub (`.gitignore` isolated).

---

## 2. Storage Architecture

### Local Development Layout
```
Beema/
├── data/
│   ├── raw/
│   │   ├── delta/
│   │   │   ├── raw_free_insurance_claims/  (ACID Delta Table: 25,000 rows, 17 cols)
│   │   │   ├── raw_warranty_claims/        (ACID Delta Table: 5,000 rows, 24 cols)
│   │   │   └── raw_car_insurance_fraud/    (ACID Delta Table: 5,000 rows, 37 cols)
│   │   └── landing/                        (Source extract cache / drop-in)
│   ├── cleaned/                            (Silver layer placeholder)
│   ├── model_ready/                        (Gold feature store placeholder)
│   └── quarantine/                         (DLQ placeholder for corrupt records)
├── docs/
│   ├── data_dictionary.md                  (Comprehensive field-by-field dictionary)
│   ├── raw_delta_schema.md                 (DDL schemas & physical Delta specs)
│   ├── data_quality_report.md              (Automated data profiling & quality audit)
│   └── ingestion_architecture.md           (Local dev to GCS/Databricks architecture)
├── src/
│   ├── config.py                           (Configuration & directory paths)
│   ├── ingestion/
│   │   ├── metadata.py                     (Standard audit metadata injector)
│   │   ├── primary_loader.py               (Hugging Face range streaming loader)
│   │   ├── secondary_loader.py             (Kaggle warranty claims loader)
│   │   ├── tertiary_loader.py              (Kaggle fraud detection loader)
│   │   └── delta_sink.py                   (ACID Delta Lake table writer)
│   ├── quality/
│   │   └── profiler.py                     (Automated data quality profiler)
│   └── utils/
│       └── logger.py                       (Structured logging)
├── run_raw_pipeline.py                     (CLI runner for ingestion & audit)
├── verify_raw_delta.py                     (Validation & verification script)
├── requirements.txt                        (Pinned dependencies)
└── .gitignore                              (Strict isolation of datasets & binaries)
```

### Eventual Production Architecture
```
Public / Partner Feeds ──> GCS Bucket ──> Databricks Auto Loader ──> Delta Lake (Unity Catalog)
```
- **Storage Layers**:
  - `data/raw/` (Bronze): Untransformed landing with governance metadata.
  - `data/cleaned/` (Silver): Standardized schema, deduplicated, validated.
  - `data/model_ready/` (Gold): Preprocessed feature matrices for LAYA.
  - `data/quarantine/`: Dead-letter queue for anomalous payloads.

---

## 3. Mandatory Audit & Governance Metadata Contract

Every record written to the RAW Delta tables preserves all original source columns and appends the following 4 metadata attributes:

| Field Name | Type | Description | Sample Value |
|---|---|---|---|
| `ingestion_timestamp` | `STRING` | UTC ISO 8601 timestamp of batch execution | `2026-10-10T17:19:51.929537+00:00` |
| `source_dataset` | `STRING` | Upstream dataset canonical source identifier | `ziadatalabs/FreeInsuranceClaims100M` |
| `batch_id` | `STRING` | Unique execution batch identifier | `batch_20261010171945_d1c7a68a` |
| `dataset_version` | `STRING` | Semantic dataset version tag | `v1.0.0` |

---

## 4. Medallion Table Inventory & Schemas

| Layer | Delta Table Path | Description | Records | Total Columns | Delta Version |
|---|---|---|---|---|---|
| **Bronze (RAW)** | `data/raw/delta/raw_free_insurance_claims` | Untransformed claims + 4 audit fields | 25,000 | 17 | `v0` |
| **Bronze (RAW)** | `data/raw/delta/raw_warranty_claims` | Untransformed warranty claims + 4 audit fields | 5,000 | 24 | `v0` |
| **Bronze (RAW)** | `data/raw/delta/raw_car_insurance_fraud` | Untransformed auto claims + 4 audit fields | 5,000 | 37 | `v0` |
| **Silver (CLEANED)** | `data/cleaned/delta/cleaned_free_insurance_claims` | Standardized, deduplicated, validated claims | 25,000 | 20 | `v0` |
| **Silver (CLEANED)** | `data/cleaned/delta/cleaned_warranty_claims` | Standardized warranty claims | 5,000 | 27 | `v0` |
| **Silver (CLEANED)** | `data/cleaned/delta/cleaned_car_insurance_fraud` | Standardized car fraud claims | 5,000 | 40 | `v0` |
| **Gold (MODEL_READY)**| `data/model_ready/delta/gold_claims_features` | Fraud feature store with engineered ratios & priors | **25,000** | **38** | `v0` |
| **Quarantine (DLQ)** | `data/quarantine/delta/quarantine_claims` | Corrupt or invalid claims violating integrity constraints | *0 (DLQ)* | *Dynamic* | *Active* |

---

## 5. Instructions to Execute & Reproduce

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Execute Bronze Ingestion Pipeline
Acquires the public datasets and creates the RAW Delta Lake tables:
```bash
python run_raw_pipeline.py
```

### Step 3: Execute Silver Cleaning, Validation & Gold Feature Engineering
Runs the full Medallion pipeline (Clean $\rightarrow$ Validate $\rightarrow$ Quarantine $\rightarrow$ Feature Store):
```bash
python run_medallion_pipeline.py
```

### Step 4: Verify Delta Lake Tables & Transaction Logs
Run the dedicated verification script:
```bash
python verify_raw_delta.py
```

---

## 6. Databricks Cloud Execution

Production-ready Databricks PySpark notebooks are ready to import directly into your Databricks workspace:
- [databricks/raw_ingestion_pyspark.py](file:///c:/Users/nitaa/Downloads/Beema/databricks/raw_ingestion_pyspark.py): Distributed Raw acquisition notebook.
- [databricks/medallion_feature_engineering_pyspark.py](file:///c:/Users/nitaa/Downloads/Beema/databricks/medallion_feature_engineering_pyspark.py): Distributed Silver cleaning, validation, and Gold feature engineering notebook.

---

## 7. LAYA Insurance Decision Engine

The **LAYA Insurance Decision Engine** integrates the pretrained foundation model [`convaiinnovations/laya`](https://huggingface.co/convaiinnovations/laya) locally to perform claim triage, evidence sufficiency evaluation, and investigation prioritization.

### Key Capabilities
- **Local Inference**: Uses the official `laya` package (`laya.Router`) with no hosted API dependencies or Hugging Face access tokens required.
- **Safety Governance**: Missing documentation triggers `REQUEST_ADDITIONAL_EVIDENCE`, preventing false fraud accusations.
- **Deterministic Rules & Consistency Checks**: Evaluates deductible rules, policy tenure, physical timeline causality, and repair estimate inflation before synthesizing model decisions.
- **Lakehouse Integration**: Queries directly from the Gold Delta table (`data/model_ready/delta/gold_claims_features`) via `POST /predict/lakehouse`.
- **Calibrated Fallback**: Provides calibrated deterministic baseline mode (`is_mock=True`) when weights are not present locally.

### Setup and Running Locally

1. **Verify or Download Model Weights**:
   ```bash
   # Check if local model weights are present
   python scripts/download_laya.py --verify-only

   # Download the targeted typed-decisions checkpoint (~800 MB) to models/laya/
   python scripts/download_laya.py --subfolder typed-decisions
   ```

2. **Start the FastAPI Decision Service**:
   ```bash
   uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   Interactive Swagger API docs available at `http://localhost:8000/docs`.

3. **Run Unit and Integration Tests**:
   ```bash
   pytest -v tests
   ```

Detailed documentation on the decision schema, typed question definitions, and risk aggregation is in [docs/laya_decision_engine.md](file:///c:/Users/nitaa/Downloads/Beema/docs/laya_decision_engine.md).

---

## 8. Visual Insurance Damage & Fraud Agent

The **Visual Insurance Agent** (`src/vision/`) performs fast, instance-based forensic image analysis directly on submitted damage photos:

### Key Operational Rules
1. **Dynamic Damage Scoring & Cost Matching**:
   - Classifies visual damage into fair market repair tiers (`MINOR_COSMETIC`, `MODERATE_LOCALIZED`, `SEVERE_STRUCTURAL`, `TOTAL_DESTRUCTION`).
   - Cross-references the policyholder's demanded compensation against fair market repair brackets.
2. **Immediate Rejection on Massive Compensation Demand**:
   - Demanding outsized compensation relative to visual damage (e.g. demanding $40,000 for a minor bumper scratch) triggers **immediate rejection** (`REJECTED_MASSIVE_INFLATION`).
3. **Evident Fabrication Flagging (e.g. Storm vs. Sledgehammer)**:
   - Detects physical causality contradictions: If the claimant claims "storm/hail weather", but image analysis reveals concentrated blunt trauma (e.g. sledgehammer, crowbar, manual tool strikes) rather than diffuse weather impact, the claim is flagged and **rejected immediately** (`REJECTED_FABRICATED_DAMAGE`).
4. **Confused / Untreatable Image Handling**:
   - Blurry, pitch-black, underexposed, or ambiguous photos are **not** auto-rejected; instead, they route cleanly to desk adjusters with the message:
     > *"An agent will look forward to your matter."*

### Demo Script & API Endpoints
- **Run the Visual Agent Demo**:
  ```bash
  python scripts/demo_visual_agent.py
  ```
- **Endpoints**:
  - `POST /predict/visual-claim` (JSON payload with image path or Base64)
  - `POST /predict/visual-upload` (Multipart image file upload)


