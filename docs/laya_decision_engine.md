# LAYA Insurance Decision Engine — Beema

## Overview

The **LAYA Insurance Decision Engine** integrates the pretrained foundation model [`convaiinnovations/laya`](https://huggingface.co/convaiinnovations/laya) into the **Beema** AI-powered Insurance Claims Investigation platform.

Operating directly on top of the **Databricks Medallion Lakehouse** (`Gold` layer: `data/model_ready/delta/gold_claims_features`), the decision engine provides an end-to-end, multi-stage adjudication layer that combines:
1. **Deterministic Rules Engine**: Strictly enforced insurance policy boundaries and statutory compliance.
2. **Consistency & Forensic Checker**: Cross-field audits detecting inflation, causal timeline violations, and documentation gaps.
3. **LAYA Decision Model (System 1)**: Non-autoregressive discrete question router predicting triage categories, evidence sufficiency, and investigation priority via calibrated scoring.
4. **Decision Aggregator**: Safety-critical synthesis layer that reconciles model predictions with business rules, guaranteeing that missing documentation triggers `REQUEST_ADDITIONAL_EVIDENCE` rather than premature fraud accusations.

---

## Architecture

```
                  ┌─────────────────────────────────────────┐
                  │ Databricks Medallion Lakehouse (Gold)   │
                  │ data/model_ready/delta/gold_claims_...  │
                  └────────────────────┬────────────────────┘
                                       │ (Claim ID / Features)
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │   Feature Engineering & Dossier Builder │
                  │      (src/decision/feature_engineering) │
                  └──────┬─────────────────┬────────────────┘
                         │                 │
           ┌─────────────┴────────┐        │ Text Dossier + Typed Questions
           │                      │        │
           ▼                      ▼        ▼
┌────────────────────┐ ┌────────────────────┐ ┌───────────────────────────┐
│ Rules Engine       │ │ Consistency Checker│ │ LAYA Model (Local Router) │
│ - Deductible check │ │ - Amount inflation │ │ - Claim Triage            │
│ - Inception tenure │ │ - Physical timeline│ │ - Evidence Sufficiency    │
│ - Serial claimant  │ │ - Narrative audit  │ │ - Investigation Priority  │
└──────────┬─────────┘ └──────────┬─────────┘ └─────────────┬─────────────┘
           │                      │                         │
           └────────────────► ┌───▼─────────────────────┐ ◄─┘
                              │   Decision Aggregator   │
                              │ (src/decision/aggregator│
                              └───┬─────────────────────┘
                                  │
                                  ▼
           ┌────────────────────────────────────────────────────────┐
           │                     Final Action                       │
           │  • FAST_TRACK_PAYOUT       • STANDARD_ADJUDICATION     │
           │  • REQUEST_ADDITIONAL_EVIDENCE                         │
           │  • SIU_FRAUD_INVESTIGATION                             │
           └────────────────────────────────────────────────────────┘
```

---

## 1. Modular Components

The decision subsystem is located in `src/decision/` and `src/api/`:

| Module | Purpose |
|---|---|
| [`schemas.py`](file:///c:/Users/nitaa/Downloads/Beema/src/decision/schemas.py) | Pydantic v2 data models for claims, rules findings, discrepancies, model outputs, and API responses. |
| [`rules_engine.py`](file:///c:/Users/nitaa/Downloads/Beema/src/decision/rules_engine.py) | Deterministic insurance policy checks (below deductible, inception tenure < 1yr with high payout, extreme deductible multiples, serial claims, filing delays). |
| [`consistency_checker.py`](file:///c:/Users/nitaa/Downloads/Beema/src/decision/consistency_checker.py) | Audits repair estimate vs claimed amount, physical causality (incident before policy start, incident after filing), and corroborating document presence. |
| [`feature_engineering.py`](file:///c:/Users/nitaa/Downloads/Beema/src/decision/feature_engineering.py) | Transforms raw and Gold lakehouse records into calculated metrics (ratios, durations) and synthesized contextual dossiers for the LAYA router. |
| [`laya_model.py`](file:///c:/Users/nitaa/Downloads/Beema/src/decision/laya_model.py) | Wraps `laya.Router`, manages local checkpoint loading (`models/laya/typed-decisions`), executes typed routing passes, and provides calibrated fallback inference when weights are unpopulated. |
| [`decision_aggregator.py`](file:///c:/Users/nitaa/Downloads/Beema/src/decision/decision_aggregator.py) | Synthesizes deterministic rules, forensic discrepancies, and model triage scores into an actionable operational claim recommendation. |
| [`service.py`](file:///c:/Users/nitaa/Downloads/Beema/src/decision/service.py) | Service orchestrator coordinating data ingestion, rules evaluation, model inference, and lakehouse lookup. |
| [`main.py`](file:///c:/Users/nitaa/Downloads/Beema/src/api/main.py) | FastAPI service exposing `GET /health`, `POST /predict`, and `POST /predict/lakehouse`. |

---

## 2. Insurance Decision Model Design

`convaiinnovations/laya` uses non-autoregressive discrete decision routing trained with RLCD. Unlike generative LLMs, it outputs direct categorical selections and probabilities for defined typed questions.

### Typed Questions

The Beema decision engine defines 3 typed questions for each claim dossier:

1. **`claim_triage`** (`choice` question):
   - **Options**: `fast_track`, `standard_review`, `complex_review`, `investigation`
   - **Criteria**:
     - `fast_track`: Low claim amount, clean history, complete documentation, low fraud probability.
     - `standard_review`: Ordinary claim within expected policy parameters, standard adjustment.
     - `complex_review`: High value claim, multiple parties, or ambiguous liability.
     - `investigation`: Irregular patterns, contradictory evidence, or multiple risk indicators.

2. **`evidence_sufficiency`** (`choice` question):
   - **Options**: `complete`, `sufficient_with_minor_gaps`, `insufficient_needs_more_info`
   - **Criteria**:
     - `complete`: All corroborating documents (police reports, repair estimates, itemized receipts) present.
     - `sufficient_with_minor_gaps`: Essential proof exists, secondary clarifications required.
     - `insufficient_needs_more_info`: Missing critical evidence needed to establish cause of loss or validate damages.

3. **`investigation_priority`** (`choice` question):
   - **Options**: `low`, `medium`, `high`, `critical`
   - **Criteria**:
     - `low`: Routine claim with low suspicion index.
     - `medium`: Mild anomalies or unverified minor claims.
     - `high`: Multiple policy red flags, short policy inception with large claim, significant amount inflation.
     - `critical`: Causal timeline contradiction (e.g. incident before policy start) or major fabrication signals.

---

## 3. Decision Matrix & Aggregation Policy

The aggregation layer enforces strict insurance governance:

| Condition | Aggregated Recommendation | SIU Referral | Rationale |
|---|---|---|---|
| Deterministic Denial Rule Triggered (e.g., Claim amount < Deductible) | `DENIAL_RECOMMENDED` | `false` | Statutory rule violation; claim falls below deductible threshold. |
| Critical Causal Contradiction (Incident prior to policy inception or after filing) | `SIU_FRAUD_INVESTIGATION` | `true` | Physical impossibility indicating fabricated or misdated occurrence. |
| Incomplete Evidence / Missing Proof (without fraud anomalies) | `REQUEST_ADDITIONAL_EVIDENCE` | `false` | **Safety Principle**: A missing receipt or pending police report is an evidentiary gap, NOT proof of fraud. |
| High Risk Score (Model > 0.70 or Priority `high`/`critical`) + Discrepancies | `SIU_FRAUD_INVESTIGATION` | `true` | Convergence of statistical anomalies and substantive document discrepancies. |
| Low Risk (< 0.20), Complete Evidence, No Violations | `FAST_TRACK_PAYOUT` | `false` | Instant straight-through processing eligibility. |
| Standard Claim Profile | `STANDARD_ADJUDICATION` | `false` | Standard human desk adjuster workflow. |

---

## 4. Local Model Setup & Hardware Requirements

### Hardware Requirements
- **Inference Runtime**: CPU (Intel / AMD / Apple Silicon) or CUDA GPU.
- **Model Size**: ~803 MB (`typed-decisions` weights) or ~803 MB (base English checkpoint).
- **RAM**: Minimum 4 GB available system RAM (8 GB recommended).
- **Disk Space**: ~2 GB local disk storage under `models/laya/`.
- **Python Version**: 3.10+ (tested on Python 3.12).

### Model Download Script
Use the provided script to verify or perform a targeted download without downloading unnecessary variants or requiring Hugging Face credentials:

```bash
# Verify existing local files
python scripts/download_laya.py --verify-only

# Download the typed-decisions checkpoint to models/laya/
python scripts/download_laya.py --subfolder typed-decisions
```

> **Note**: `models/` is included in `.gitignore` to prevent committing model binaries or credentials.

### Fallback Mode
If local model weights have not been downloaded yet, the decision engine automatically engages **calibrated fallback mode** (`is_mock=True` flag in response). The fallback uses deterministic heuristics and calibrated scoring baselines to enable testing and CI/CD pipelines without downloading large weights.

---

## 5. API Contract & Endpoints

### 1. `GET /health`
Returns service status, loaded model type, and local weight verification.

```json
{
  "status": "healthy",
  "service": "beema-laya-decision-engine",
  "version": "1.0.0",
  "model_loaded": true,
  "using_mock": true
}
```

### 2. `POST /predict`
Evaluates a single claim provided in JSON format.

#### Request Body
```json
{
  "claim_id": "CLM-AUTO-2026-001",
  "policy_id": "POL-99214",
  "claim_amount": 3200.0,
  "deductible": 500.0,
  "claim_type": "Auto Collision",
  "policy_tenure_months": 24,
  "customer_prior_claims": 0,
  "claim_description": "Rear bumper damage from low speed parking incident",
  "has_police_report": true,
  "has_repair_estimate": true,
  "repair_estimate_amount": 3150.0,
  "policy_start_date": "2024-01-01",
  "incident_date": "2026-01-15",
  "claim_filing_date": "2026-01-17"
}
```

#### Response Body
```json
{
  "claim_id": "CLM-AUTO-2026-001",
  "recommended_action": "FAST_TRACK_PAYOUT",
  "siu_referral_required": false,
  "confidence_score": 0.92,
  "composite_risk_score": 0.08,
  "rationale": "Claim meets all requirements for fast-track straight-through payout: low risk profile, comprehensive evidence, and no policy violations.",
  "rules_evaluation": {
    "is_eligible": true,
    "violations": [],
    "flags": []
  },
  "consistency_evaluation": {
    "has_discrepancies": false,
    "discrepancy_count": 0,
    "findings": []
  },
  "model_decisions": {
    "is_mock": true,
    "decisions": {
      "claim_triage": {
        "choice": "fast_track",
        "confidence": 0.92
      },
      "evidence_sufficiency": {
        "choice": "complete",
        "confidence": 0.95
      },
      "investigation_priority": {
        "choice": "low",
        "confidence": 0.90
      }
    }
  },
  "timestamp": "2026-10-10T18:25:00.000000Z"
}
```

### 3. `POST /predict/lakehouse`
Fetches a claim record directly from the Databricks Delta Gold table (`data/model_ready/delta/gold_claims_features`) by `claim_id` and runs the full decision engine.

```bash
curl -X POST "http://localhost:8000/predict/lakehouse" \
     -H "Content-Type: application/json" \
     -d '{"claim_id": "CLM-RAW-00001"}'
```

---

## 6. Running the Service & Tests

### Start the FastAPI Server
```bash
uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger documentation is available at `http://localhost:8000/docs`.

### Run the Test Suite
```bash
pytest -v tests
```
Tests cover:
- Deterministic rules engine (`tests/test_rules_engine.py`)
- Consistency and causality audit (`tests/test_consistency_checker.py`)
- Multi-signal decision aggregator (`tests/test_decision_aggregator.py`)
- Full API integration & endpoints (`tests/test_api.py`)
- Visual damage & fraud agent (`tests/test_visual_agent.py`)

---

## 7. Visual Insurance Damage & Fraud Agent

The **Visual Insurance Agent** (`src/vision/`) evaluates submitted damage photographs at First Notice of Loss (FNOL):

### Core Architecture
1. **Quality & Treatability Guardrail** (`quality_checker.py`):
   - Audits image sharpness, resolution, exposure, and color entropy.
   - **Confused / Untreatable Policy**: Blurry, unidentifiable, or corrupted photos are **never** auto-rejected; they route to a desk adjuster with the courteous customer message:
     > *"An agent will look forward to your matter."*
2. **Visual Damage Scorer** (`damage_scorer.py`):
   - Computes structural edge density, texture disruption, and gradient fragmentation.
   - Maps damages into calibrated brackets:
     - `MINOR_COSMETIC`: $350 – $1,400 (scratches, small dents, light trim scuffs)
     - `MODERATE_LOCALIZED`: $1,400 – $4,800 (bumper collapse, fender dent, windshield)
     - `SEVERE_STRUCTURAL`: $4,800 – $18,500 (frame crumple, crushed quarter panel, roof)
     - `TOTAL_DESTRUCTION`: $18,500 – $65,000 (burned shell, chassis crushed)
3. **Cost Matching & Immediate Rejection** (`cost_matcher.py`):
   - Compares demanded compensation vs. visual damage bracket.
   - **Massive Compensation Rule**: Demands exceeding $3.0\times$ the visual ceiling (e.g. demanding $40,000 for a minor scratch) trigger **immediate rejection** (`REJECTED_MASSIVE_INFLATION`).
4. **Physical Fabrication & Causality Detector** (`fabrication_detector.py`):
   - **Weather vs. Manual Destruction**: If the user claims "storm/hail", but spatial damage analysis detects concentrated, localized blunt trauma (e.g. sledgehammer, crowbar impact) rather than diffuse storm impact, the claim is flagged and **rejected immediately** (`REJECTED_FABRICATED_DAMAGE`).
   - **Corrosion on Fresh Collision**: Detects deep rust/oxidation in damage crevices on claims reported as fresh incidents.

