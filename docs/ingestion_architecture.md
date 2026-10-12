# End-to-End Ingestion & Storage Architecture

This document details the transition from the current development environment to the target enterprise production architecture for the **Beema AI-Powered Insurance Claims Investigation System**.

---

## 1. Development vs. Production Architecture

### Development Environment (Local / Workstation)
```
[ Public Datasets ]
  ├── Hugging Face (FreeInsuranceClaims100M - HTTP Range Stream)
  ├── Kaggle (Warranty Claims)
  └── Kaggle (Car Insurance Fraud - Oracle Benchmark)
        │
        ▼
[ Local Acquisition & Ingestion Pipeline (src/ingestion) ]
  ├── Enforce Raw Representation (No business mutations)
  ├── Append 4 Mandatory Governance Metadata Fields
  └── Write via delta-rs (write_deltalake)
        │
        ▼
[ Local File-System Storage (ACID Delta Lake) ]
  ├── data/raw/delta/raw_free_insurance_claims/
  ├── data/raw/delta/raw_warranty_claims/
  └── data/raw/delta/raw_car_insurance_fraud/
        │
        ├── data/cleaned/     (Silver Layer - Ready for next phase)
        ├── data/model_ready/ (Gold Layer - Feature Matrices for LAYA)
        └── data/quarantine/  (Quarantine / Dead Letter Queue)
```

---

### Target Production Architecture (Enterprise Cloud)
```
[ Upstream Data Ingestion ]
  ├── Public Datasets / Carrier Claims Partner Feeds
  ├── Cloud Run / Airflow Ingestion Microservices
        │
        ▼
[ Google Cloud Storage (GCS) Landing Zone ]
  └── gs://beema-data-lake-prod/landing/batch_YYYYMMDD/
        │
        ▼
[ Databricks Lakehouse Platform ]
  ├── Auto Loader / Databricks Delta Live Tables (DLT)
  ├── Cluster Compute (Spark 3.5+)
  ├── Unity Catalog Access Governance & Lineage
        │
        ▼
[ Cloud Delta Lake (Medallion Lakehouse) ]
  ├── Bronze (RAW):  gs://beema-data-lake-prod/raw/delta/
  ├── Silver (CLEANED): gs://beema-data-lake-prod/cleaned/delta/
  ├── Gold (MODEL_READY): gs://beema-data-lake-prod/model_ready/delta/
  └── Quarantine (DLQ): gs://beema-data-lake-prod/quarantine/
```

---

## 2. Medallion Storage Progression

| Storage Layer | Local Dev Path | Production GCS Path | Ingestion Purpose & Lifecycle |
|---|---|---|---|
| **RAW (Bronze)** | `data/raw/delta/` | `gs://beema-lake-prod/raw/delta/` | Pure immutable landing of original source data. Exact column preservation + ingestion audit metadata (`ingestion_timestamp`, `source_dataset`, `batch_id`, `dataset_version`). |
| **CLEANED (Silver)** | `data/cleaned/` | `gs://beema-lake-prod/cleaned/delta/` | Type-standardized, validated, deduplicated, and unified schema for cross-carrier investigation. |
| **MODEL_READY (Gold)** | `data/model_ready/` | `gs://beema-lake-prod/model_ready/delta/` | Normalized feature vectors, tabular matrices, embeddings, and target labels for LAYA ML training & inference. |
| **QUARANTINE** | `data/quarantine/` | `gs://beema-lake-prod/quarantine/` | Quarantined records with schema violations, corrupt payloads, or impossible temporal values. |

---

## 3. Privacy, Security & Data Ethics Compliance

1. **Strict Prohibition on Private Scraping**:
   - The pipeline exclusively connects to verified public synthetic benchmarks (`ziadatalabs/FreeInsuranceClaims100M`) and open competition datasets (`warranty-claims`, `frauddetection`).
   - Zero private policyholder scraping or confidential health data ingestion.
2. **Git Repository Isolation**:
   - The root `.gitignore` enforces exclusion of all `data/` directories, parquet binaries, and Delta transaction logs.
   - Prevents accidental leaks of dataset extracts to GitHub.
3. **Idempotence & Audit Lineage**:
   - Every batch generates an immutable `batch_id` and UTC `ingestion_timestamp` to trace exact data provenance from source to Delta Lake.
