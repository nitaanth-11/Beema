import sys
from pathlib import Path
import polars as pl
from deltalake import DeltaTable
from src.config import (
    DELTA_TABLE_PRIMARY,
    DELTA_TABLE_CLEANED_PRIMARY,
    DELTA_TABLE_CLEANED_SECONDARY,
    DELTA_TABLE_CLEANED_TERTIARY,
    DELTA_TABLE_MODEL_READY,
    DELTA_TABLE_QUARANTINE
)
from src.transformation.cleaner import SilverClaimsCleaner
from src.features.engineer import ClaimsFeatureEngineer
from src.utils.logger import get_logger

# Configure utf-8 output in Windows shell
sys.stdout.reconfigure(encoding="utf-8")
logger = get_logger("MedallionPipeline")

def run_pipeline(mode: str = "overwrite"):
    logger.info("=" * 75)
    logger.info("STARTING BEEMA MEDALLION DATA PROCESSING PIPELINE")
    logger.info("Stage: BRONZE (RAW) -> SILVER (CLEANED) -> GOLD (MODEL_READY) + QUARANTINE")
    logger.info("=" * 75)

    # -------------------------------------------------------------
    # 1. SILVER LAYER: Data Cleaning, Standardization, Validation
    # -------------------------------------------------------------
    logger.info("\n>>> [1/3] Executing Silver Cleaning & Integrity Validation...")
    
    # 1a. Primary Claims
    df_clean_primary = SilverClaimsCleaner.clean_primary_claims(mode=mode)
    logger.info(f"Silver Primary Cleaned:   {len(df_clean_primary):,} valid records.")

    # 1b. Secondary Warranty Claims
    df_clean_sec = SilverClaimsCleaner.clean_warranty_claims(mode=mode)
    logger.info(f"Silver Warranty Cleaned:  {len(df_clean_sec):,} valid records.")

    # 1c. Tertiary Car Claims
    df_clean_tert = SilverClaimsCleaner.clean_car_fraud_claims(mode=mode)
    logger.info(f"Silver Car Fraud Cleaned: {len(df_clean_tert):,} valid records.")

    # Check Quarantine status
    if DELTA_TABLE_QUARANTINE.exists():
        dt_q = DeltaTable(str(DELTA_TABLE_QUARANTINE).replace("\\", "/"))
        df_q = pl.read_delta(str(DELTA_TABLE_QUARANTINE).replace("\\", "/"))
        logger.info(f"Quarantine DLQ:           {len(df_q):,} anomalous records isolated.")
    else:
        logger.info("Quarantine DLQ:           0 records (100% data pass rate).")

    # -------------------------------------------------------------
    # 2. GOLD LAYER: Fraud Feature Engineering & Model-Ready Matrices
    # -------------------------------------------------------------
    logger.info("\n>>> [2/3] Executing Gold Feature Engineering & Risk Scoring...")
    df_gold = ClaimsFeatureEngineer.generate_gold_features(mode=mode)
    logger.info(f"Gold Features Generated:  {df_gold.shape[0]:,} rows, {df_gold.shape[1]:,} features.")

    # -------------------------------------------------------------
    # 3. VERIFICATION & METRICS SUMMARY
    # -------------------------------------------------------------
    logger.info("\n>>> [3/3] Auditing Delta Lake Table Versions & Transactions...")
    
    tables = [
        ("Bronze (Raw Primary)", DELTA_TABLE_PRIMARY),
        ("Silver (Cleaned Primary)", DELTA_TABLE_CLEANED_PRIMARY),
        ("Silver (Cleaned Warranty)", DELTA_TABLE_CLEANED_SECONDARY),
        ("Silver (Cleaned Car Fraud)", DELTA_TABLE_CLEANED_TERTIARY),
        ("Gold (Model-Ready Features)", DELTA_TABLE_MODEL_READY)
    ]

    print("\n" + "=" * 90)
    print(f"{'Table Tier & Name':<32} | {'Records':<9} | {'Columns':<8} | {'Delta Ver':<10} | {'ACID Files':<10}")
    print("-" * 90)
    for label, path in tables:
        path_str = str(path).replace("\\", "/")
        dt = DeltaTable(path_str)
        df_t = pl.read_delta(path_str)
        print(f"{label:<32} | {len(df_t):<9,} | {len(df_t.columns):<8} | v{dt.version():<9} | {len(dt.file_uris()):<10}")
    print("=" * 90)

    # Preview Top Engineered Features
    print("\nSample Engineered Features (First 3 Rows):")
    sample_cols = [
        "claim_id", "claim_amount", "deductible", "filing_delay_days", 
        "claim_to_deductible_ratio", "is_new_policyholder", 
        "claim_velocity_per_year", "new_policy_high_claim_interaction",
        "laya_heuristic_risk_score", "is_fraud_flagged_ground_truth"
    ]
    print(df_gold.select(sample_cols).head(3))

    logger.info("\nMEDALLION DATA PROCESSING PIPELINE COMPLETED SUCCESSFULLY!\n")

if __name__ == "__main__":
    mode_arg = sys.argv[1] if len(sys.argv) > 1 else "overwrite"
    run_pipeline(mode=mode_arg)
