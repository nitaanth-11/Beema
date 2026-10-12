import polars as pl
from typing import Tuple, List, Dict, Any
from datetime import datetime, timezone
from src.utils.logger import get_logger

logger = get_logger("DataValidator")

class ClaimsDataValidator:
    """
    Validates claim records against business integrity rules.
    Partitions datasets into Validated (Silver) and Quarantined (DLQ) sets.
    """

    @classmethod
    def validate_primary_claims(cls, df: pl.DataFrame) -> Tuple[pl.DataFrame, pl.DataFrame]:
        """
        Validates FreeInsuranceClaims100M schema and business constraints.
        
        Rules:
        1. claim_amount must be strictly positive (> 0)
        2. deductible must be non-negative (>= 0)
        3. policyholder_tenure_years must be non-negative (>= 0)
        4. claim_filed_date must be on or after incident_date (causality check)
        5. claim_id must be non-null and non-empty
        """
        now_ts = datetime.now(timezone.utc).isoformat()
        
        # Ensure incident_date and claim_filed_date are Date types
        df_casted = df.with_columns([
            pl.col("incident_date").cast(pl.Date, strict=False),
            pl.col("claim_filed_date").cast(pl.Date, strict=False)
        ])

        # Define violation expressions
        violations = []
        
        # Condition 1: Missing or blank ID
        c_bad_id = pl.col("claim_id").is_null() | (pl.col("claim_id").str.strip_chars() == "")
        # Condition 2: Non-positive claim amount
        c_bad_amount = pl.col("claim_amount").is_null() | (pl.col("claim_amount") <= 0)
        # Condition 3: Negative deductible
        c_bad_deductible = pl.col("deductible").is_null() | (pl.col("deductible") < 0)
        # Condition 4: Negative tenure
        c_bad_tenure = pl.col("policyholder_tenure_years").is_null() | (pl.col("policyholder_tenure_years") < 0)
        # Condition 5: Date causality violation (filed before incident)
        c_bad_dates = pl.col("claim_filed_date") < pl.col("incident_date")

        # Composite quarantine filter
        is_invalid = c_bad_id | c_bad_amount | c_bad_deductible | c_bad_tenure | c_bad_dates

        df_quarantine = df_casted.filter(is_invalid)
        df_valid = df_casted.filter(~is_invalid)

        if len(df_quarantine) > 0:
            # Build diagnostic reason string
            reasons = (
                pl.when(c_bad_id).then(pl.lit("INVALID_CLAIM_ID; "))
                .otherwise(pl.lit(""))
                + pl.when(c_bad_amount).then(pl.lit("NON_POSITIVE_CLAIM_AMOUNT; "))
                .otherwise(pl.lit(""))
                + pl.when(c_bad_deductible).then(pl.lit("NEGATIVE_DEDUCTIBLE; "))
                .otherwise(pl.lit(""))
                + pl.when(c_bad_tenure).then(pl.lit("NEGATIVE_TENURE; "))
                .otherwise(pl.lit(""))
                + pl.when(c_bad_dates).then(pl.lit("FILED_BEFORE_INCIDENT; "))
                .otherwise(pl.lit(""))
            )
            df_quarantine = df_quarantine.with_columns([
                reasons.str.strip_chars("; ").alias("quarantine_reason"),
                pl.lit(now_ts).alias("quarantined_at")
            ])
            logger.warning(f"Quarantined {len(df_quarantine)} records failing validation constraints.")
        else:
            logger.info("Validation complete: 100% of records passed business integrity constraints.")
            # Empty quarantine DataFrame with schema
            df_quarantine = df_casted.filter(pl.lit(False)).with_columns([
                pl.lit("").alias("quarantine_reason"),
                pl.lit(now_ts).alias("quarantined_at")
            ])

        return df_valid, df_quarantine

    @classmethod
    def validate_warranty_claims(cls, df: pl.DataFrame) -> Tuple[pl.DataFrame, pl.DataFrame]:
        """
        Validates Warranty Claims constraints.
        claim_value > 0, Product_Age >= 0, Call_details >= 0
        """
        now_ts = datetime.now(timezone.utc).isoformat()
        c_bad_val = pl.col("claim_value").is_null() | (pl.col("claim_value") <= 0)
        c_bad_age = pl.col("Product_Age").is_null() | (pl.col("Product_Age") < 0)
        c_bad_call = pl.col("Call_details").is_null() | (pl.col("Call_details") < 0)

        is_invalid = c_bad_val | c_bad_age | c_bad_call
        df_quarantine = df.filter(is_invalid)
        df_valid = df.filter(~is_invalid)

        if len(df_quarantine) > 0:
            df_quarantine = df_quarantine.with_columns([
                pl.lit("WARRANTY_CONSTRAINT_VIOLATION").alias("quarantine_reason"),
                pl.lit(now_ts).alias("quarantined_at")
            ])
        else:
            df_quarantine = df.filter(pl.lit(False)).with_columns([
                pl.lit("").alias("quarantine_reason"),
                pl.lit(now_ts).alias("quarantined_at")
            ])

        return df_valid, df_quarantine

    @classmethod
    def validate_car_fraud_claims(cls, df: pl.DataFrame) -> Tuple[pl.DataFrame, pl.DataFrame]:
        """
        Validates Car Insurance Fraud constraints.
        PolicyNumber > 0, Age between 16 and 100, Deductible >= 0
        """
        now_ts = datetime.now(timezone.utc).isoformat()
        c_bad_pol = pl.col("PolicyNumber").is_null() | (pl.col("PolicyNumber") <= 0)
        c_bad_age = pl.col("Age").is_null() | (pl.col("Age") < 16) | (pl.col("Age") > 110)
        c_bad_ded = pl.col("Deductible").is_null() | (pl.col("Deductible") < 0)

        is_invalid = c_bad_pol | c_bad_age | c_bad_ded
        df_quarantine = df.filter(is_invalid)
        df_valid = df.filter(~is_invalid)

        if len(df_quarantine) > 0:
            df_quarantine = df_quarantine.with_columns([
                pl.lit("AUTO_INSURANCE_CONSTRAINT_VIOLATION").alias("quarantine_reason"),
                pl.lit(now_ts).alias("quarantined_at")
            ])
        else:
            df_quarantine = df.filter(pl.lit(False)).with_columns([
                pl.lit("").alias("quarantine_reason"),
                pl.lit(now_ts).alias("quarantined_at")
            ])

        return df_valid, df_quarantine
