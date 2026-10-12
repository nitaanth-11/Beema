from pathlib import Path
import os
import uuid
from datetime import datetime, timezone

# Project Base Paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
CLEANED_DIR = DATA_DIR / "cleaned"
MODEL_READY_DIR = DATA_DIR / "model_ready"
QUARANTINE_DIR = DATA_DIR / "quarantine"

# Raw Layer Subdirectories
DELTA_RAW_DIR = RAW_DIR / "delta"
LANDING_DIR = RAW_DIR / "landing"
DOCS_DIR = PROJECT_ROOT / "docs"

# Table Specific Raw Delta Paths
DELTA_TABLE_PRIMARY = DELTA_RAW_DIR / "raw_free_insurance_claims"
DELTA_TABLE_SECONDARY = DELTA_RAW_DIR / "raw_warranty_claims"
DELTA_TABLE_TERTIARY = DELTA_RAW_DIR / "raw_car_insurance_fraud"

# Medallion Delta Storage Paths (Cleaned Silver, Model Ready Gold, Quarantine DLQ)
DELTA_CLEANED_DIR = CLEANED_DIR / "delta"
DELTA_TABLE_CLEANED_PRIMARY = DELTA_CLEANED_DIR / "cleaned_free_insurance_claims"
DELTA_TABLE_CLEANED_SECONDARY = DELTA_CLEANED_DIR / "cleaned_warranty_claims"
DELTA_TABLE_CLEANED_TERTIARY = DELTA_CLEANED_DIR / "cleaned_car_insurance_fraud"

DELTA_MODEL_READY_DIR = MODEL_READY_DIR / "delta"
DELTA_TABLE_MODEL_READY = DELTA_MODEL_READY_DIR / "gold_claims_features"

DELTA_QUARANTINE_DIR = QUARANTINE_DIR / "delta"
DELTA_TABLE_QUARANTINE = DELTA_QUARANTINE_DIR / "quarantine_claims"

CLEANED_VERSION = "v1.0.0"
FEATURE_VERSION = "v1.0.0"

# Public Dataset Remote Sources
PRIMARY_DATASET_ID = "ziadatalabs/FreeInsuranceClaims100M"
PRIMARY_PARQUET_URL = (
    "https://huggingface.co/datasets/ziadatalabs/FreeInsuranceClaims100M/resolve/main/insurance_claims_100M.parquet"
)
SECONDARY_COMPETITION = "warranty-claims"
TERTIARY_COMPETITION = "frauddetection"

# LAYA Model Engine Configurations
MODELS_DIR = PROJECT_ROOT / "models"
LAYA_MODEL_DIR = Path(os.getenv("LAYA_MODEL_DIR", str(MODELS_DIR / "laya")))
LAYA_MODEL_ID = os.getenv("LAYA_MODEL_ID", "convaiinnovations/laya")
LAYA_DEFAULT_SUBFOLDER = os.getenv("LAYA_SUBFOLDER", "typed-decisions")
LAYA_DEVICE = os.getenv("LAYA_DEVICE", "cpu")
LAYA_FALLBACK_MOCK = os.getenv("LAYA_FALLBACK_MOCK", "false").lower() in ("true", "1", "yes")

# Pipeline Parameters
DEFAULT_PRIMARY_SAMPLE_SIZE = 25000
DEFAULT_SECONDARY_SAMPLE_SIZE = 5000
DEFAULT_TERTIARY_SAMPLE_SIZE = 5000
DATASET_VERSION = "v1.0.0"

def generate_batch_id(prefix: str = "batch") -> str:
    """Generates a unique ingestion batch identifier with timestamp and UUID."""
    ts = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    uid = uuid.uuid4().hex[:8]
    return f"{prefix}_{ts}_{uid}"

def get_utc_timestamp() -> str:
    """Returns current UTC ISO 8601 timestamp."""
    return datetime.now(timezone.utc).isoformat()
