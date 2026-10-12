import polars as pl
from pathlib import Path
from datetime import datetime, timezone
from src.config import (
    DELTA_TABLE_PRIMARY,
    DELTA_TABLE_SECONDARY,
    DELTA_TABLE_TERTIARY,
    DELTA_TABLE_CLEANED_PRIMARY,
    DELTA_TABLE_CLEANED_SECONDARY,
    DELTA_TABLE_CLEANED_TERTIARY,
    DELTA_TABLE_QUARANTINE,
    CLEANED_VERSION
)
from src.transformation.validator import ClaimsDataValidator
from src.ingestion.delta_sink import DeltaSink
from src.utils.logger import get_logger

logger = get_logger("SilverCleaner")

class SilverClaimsCleaner:
    """
    Cleans, validates, and standardizes RAW Delta tables into Silver (CLEANED) Delta tables.
    Diverts invalid payloads into Quarantine (DLQ).
    """

    @classmethod
    def clean_primary_claims(cls, mode: str = "overwrite") -> pl.DataFrame:
        """
        Cleans and standardizes raw_free_insurance_claims.
        """
        logger.info(f"Reading RAW table from {DELTA_TABLE_PRIMARY}...")
        df_raw = pl.read_delta(str(DELTA_TABLE_PRIMARY).replace("\\", "/"))
        now_ts = datetime.now(timezone.utc).isoformat()

        # Step 1: Standardize text casing and trim
        df_standardized = df_raw.with_columns([
            pl.col("claim_id").str.strip_chars().str.to_uppercase(),
            pl.col("policy_id").str.strip_chars().str.to_uppercase(),
            pl.col("claim_type").str.strip_chars().str.to_lowercase(),
            pl.col("state").str.strip_chars().str.to_uppercase(),
            pl.col("claim_status").str.strip_chars().str.to_lowercase(),
            pl.col("incident_date").cast(pl.Date),
            pl.col("claim_filed_date").cast(pl.Date),
            pl.col("claim_amount").cast(pl.Float64).round(2),
            pl.col("deductible").cast(pl.Float64).round(2),
            pl.col("policyholder_tenure_years").cast(pl.Float32).round(2),
            pl.col("previous_claims_count").cast(pl.Int32),
            pl.col("is_fraud_flagged_ground_truth").cast(pl.Boolean)
        ])

        # Step 2: Deduplication on primary key
        initial_count = len(df_standardized)
        df_deduped = df_standardized.unique(subset=["claim_id"], keep="first")
        dups_removed = initial_count - len(df_deduped)
        if dups_removed > 0:
            logger.info(f"Removed {dups_removed} duplicate claim_id records.")

        # Step 3: Validate and partition into Cleaned vs Quarantine
        df_valid, df_quarantine = ClaimsDataValidator.validate_primary_claims(df_deduped)

        # Step 4: Write Quarantined records if any exist
        if len(df_quarantine) > 0:
            DeltaSink.write_raw_table(
                df=df_quarantine,
                table_path=DELTA_TABLE_QUARANTINE,
                mode="append"
            )

        # Step 5: Enrich valid records with Silver audit metadata
        df_cleaned = df_valid.with_columns([
            pl.lit(now_ts).alias("cleaned_timestamp"),
            pl.lit(CLEANED_VERSION).alias("cleaned_version"),
            pl.lit("VALIDATED").alias("validation_status")
        ])

        # Step 6: Persist Silver Delta Table
        DeltaSink.write_raw_table(
            df=df_cleaned,
            table_path=DELTA_TABLE_CLEANED_PRIMARY,
            mode=mode
        )
        logger.info(f"Silver table committed: {DELTA_TABLE_CLEANED_PRIMARY} ({len(df_cleaned)} rows)")
        return df_cleaned

    @classmethod
    def clean_warranty_claims(cls, mode: str = "overwrite") -> pl.DataFrame:
        """
        Cleans and standardizes raw_warranty_claims.
        """
        logger.info(f"Reading RAW table from {DELTA_TABLE_SECONDARY}...")
        df_raw = pl.read_delta(str(DELTA_TABLE_SECONDARY).replace("\\", "/"))
        now_ts = datetime.now(timezone.utc).isoformat()

        df_standardized = df_raw.with_columns([
            pl.col("Region").str.strip_chars().str.to_titlecase(),
            pl.col("state").str.strip_chars().str.to_titlecase(),
            pl.col("Area").str.strip_chars().str.to_titlecase(),
            pl.col("City").str.strip_chars().str.to_titlecase(),
            pl.col("Consumer_profile").str.strip_chars().str.to_titlecase(),
            pl.col("Product_category").str.strip_chars().str.to_titlecase(),
            pl.col("Product_type").str.strip_chars().str.to_uppercase(),
            pl.col("claim_value").cast(pl.Float64).round(2),
            pl.col("Call_details").cast(pl.Float64).round(2),
            pl.col("Product_Age").cast(pl.Int64),
            pl.col("Service_Centre").cast(pl.Int64),
            pl.col("Fraud").cast(pl.Int64)
        ])

        df_valid, df_quarantine = ClaimsDataValidator.validate_warranty_claims(df_standardized)

        if len(df_quarantine) > 0:
            DeltaSink.write_raw_table(
                df=df_quarantine,
                table_path=DELTA_TABLE_QUARANTINE,
                mode="append"
            )

        df_cleaned = df_valid.with_columns([
            pl.lit(now_ts).alias("cleaned_timestamp"),
            pl.lit(CLEANED_VERSION).alias("cleaned_version"),
            pl.lit("VALIDATED").alias("validation_status")
        ])

        DeltaSink.write_raw_table(
            df=df_cleaned,
            table_path=DELTA_TABLE_CLEANED_SECONDARY,
            mode=mode
        )
        logger.info(f"Silver table committed: {DELTA_TABLE_CLEANED_SECONDARY} ({len(df_cleaned)} rows)")
        return df_cleaned

    @classmethod
    def clean_car_fraud_claims(cls, mode: str = "overwrite") -> pl.DataFrame:
        """
        Cleans and standardizes raw_car_insurance_fraud.
        """
        logger.info(f"Reading RAW table from {DELTA_TABLE_TERTIARY}...")
        df_raw = pl.read_delta(str(DELTA_TABLE_TERTIARY).replace("\\", "/"))
        now_ts = datetime.now(timezone.utc).isoformat()

        df_standardized = df_raw.with_columns([
            pl.col("Make").str.strip_chars().str.to_titlecase(),
            pl.col("AccidentArea").str.strip_chars().str.to_titlecase(),
            pl.col("Sex").str.strip_chars().str.to_titlecase(),
            pl.col("MaritalStatus").str.strip_chars().str.to_titlecase(),
            pl.col("Age").cast(pl.Int64),
            pl.col("Fault").str.strip_chars().str.to_titlecase(),
            pl.col("PolicyType").str.strip_chars(),
            pl.col("VehicleCategory").str.strip_chars().str.to_titlecase(),
            pl.col("FraudFound_P").cast(pl.Int64),
            pl.col("PolicyNumber").cast(pl.Int64),
            pl.col("Deductible").cast(pl.Int64)
        ])

        df_valid, df_quarantine = ClaimsDataValidator.validate_car_fraud_claims(df_standardized)

        if len(df_quarantine) > 0:
            DeltaSink.write_raw_table(
                df=df_quarantine,
                table_path=DELTA_TABLE_QUARANTINE,
                mode="append"
            )

        df_cleaned = df_valid.with_columns([
            pl.lit(now_ts).alias("cleaned_timestamp"),
            pl.lit(CLEANED_VERSION).alias("cleaned_version"),
            pl.lit("VALIDATED").alias("validation_status")
        ])

        DeltaSink.write_raw_table(
            df=df_cleaned,
            table_path=DELTA_TABLE_CLEANED_TERTIARY,
            mode=mode
        )
        logger.info(f"Silver table committed: {DELTA_TABLE_CLEANED_TERTIARY} ({len(df_cleaned)} rows)")
        return df_cleaned
