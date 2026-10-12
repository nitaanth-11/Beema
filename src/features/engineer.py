import polars as pl
import numpy as np
from datetime import datetime, timezone
from src.config import (
    DELTA_TABLE_CLEANED_PRIMARY,
    DELTA_TABLE_MODEL_READY,
    FEATURE_VERSION
)
from src.ingestion.delta_sink import DeltaSink
from src.utils.logger import get_logger

logger = get_logger("FeatureEngineer")

class ClaimsFeatureEngineer:
    """
    Transforms Cleaned (Silver) claim records into a Model-Ready (Gold) Feature Store table
    with statistical ratios, temporal metrics, interaction indicators, and risk priors.
    """

    @classmethod
    def generate_gold_features(cls, mode: str = "overwrite") -> pl.DataFrame:
        """
        Extracts, computes, and writes gold-standard feature vectors for fraud detection.
        """
        logger.info(f"Reading Silver cleaned claims from {DELTA_TABLE_CLEANED_PRIMARY}...")
        df_silver = pl.read_delta(str(DELTA_TABLE_CLEANED_PRIMARY).replace("\\", "/"))
        now_ts = datetime.now(timezone.utc).isoformat()

        # Step 1: Temporal Engineering
        # filing delay = claim_filed_date - incident_date
        df_step1 = df_silver.with_columns([
            (pl.col("claim_filed_date") - pl.col("incident_date")).dt.total_days().cast(pl.Int32).alias("filing_delay_days"),
            pl.col("incident_date").dt.month().alias("incident_month"),
            pl.col("incident_date").dt.weekday().alias("incident_weekday")
        ])

        df_step2 = df_step1.with_columns([
            (pl.col("filing_delay_days") == 0).cast(pl.Int32).alias("is_same_day_filing"),
            (pl.col("filing_delay_days") > 30).cast(pl.Int32).alias("is_delayed_filing"),
            (pl.col("incident_weekday") >= 6).cast(pl.Int32).alias("is_weekend_incident")
        ])

        # Step 2: Financial Ratios & Transformations
        df_step3 = df_step2.with_columns([
            # Ratio of claim amount to deductible (handle deductible=0 safely)
            (pl.col("claim_amount") / pl.when(pl.col("deductible") > 0).then(pl.col("deductible")).otherwise(1.0))
            .round(2).alias("claim_to_deductible_ratio"),
            # Log transformed amount to stabilize skewed loss distributions
            pl.col("claim_amount").log1p().round(4).alias("log_claim_amount")
        ])

        # Step 3: Tenure Risk & Habitual Claimant Signals
        df_step4 = df_step3.with_columns([
            # Core Red Flag 1: Policyholder tenure < 1.0 year
            (pl.col("policyholder_tenure_years") < 1.0).cast(pl.Int32).alias("is_new_policyholder"),
            # Core Red Flag 2: Historical claim velocity (claims per year of tenure)
            (pl.col("previous_claims_count") / (pl.col("policyholder_tenure_years") + 0.1)).round(2).alias("claim_velocity_per_year"),
            # Core Red Flag 3: Repeat claimant
            (pl.col("previous_claims_count") >= 2).cast(pl.Int32).alias("is_repeat_claimant")
        ])

        # Step 4: High-Risk Interaction Term
        # New policyholder (< 1 year) combined with high claim amount (> $15,000)
        df_step5 = df_step4.with_columns([
            ((pl.col("is_new_policyholder") == 1) & (pl.col("claim_amount") > 15000.0))
            .cast(pl.Int32).alias("new_policy_high_claim_interaction")
        ])

        # Step 5: Categorical Target Encoding (Historical Claim Line Risk)
        # Calculate mean fraud rate by claim_type in dataset
        claim_type_risk = df_step5.group_by("claim_type").agg(
            pl.col("is_fraud_flagged_ground_truth").cast(pl.Float64).mean().alias("claim_type_fraud_rate")
        )
        state_risk = df_step5.group_by("state").agg(
            pl.col("is_fraud_flagged_ground_truth").cast(pl.Float64).mean().alias("state_fraud_rate")
        )

        df_step6 = df_step5.join(claim_type_risk, on="claim_type", how="left")
        df_step7 = df_step6.join(state_risk, on="state", how="left")

        # Step 6: Composite Prior Risk Score (Baseline heuristic score before neural/tree models)
        # Normalized weighted sum:
        # 0.35 * new_policy_high_claim + 0.25 * is_new_policyholder + 0.20 * is_repeat_claimant + 0.10 * is_same_day_filing + 0.10 * (claim_to_deductible_ratio > 20)
        risk_score_expr = (
            (pl.col("new_policy_high_claim_interaction") * 0.35)
            + (pl.col("is_new_policyholder") * 0.25)
            + (pl.col("is_repeat_claimant") * 0.20)
            + (pl.col("is_same_day_filing") * 0.10)
            + ((pl.col("claim_to_deductible_ratio") > 20.0).cast(pl.Float64) * 0.10)
        ).round(4)

        df_step8 = df_step7.with_columns([
            risk_score_expr.alias("laya_heuristic_risk_score")
        ])

        # Step 7: Gold Layer Governance & Metadata
        df_gold = df_step8.with_columns([
            pl.lit(now_ts).alias("feature_created_timestamp"),
            pl.lit(FEATURE_VERSION).alias("feature_pipeline_version"),
            pl.lit("GOLD_MODEL_READY").alias("feature_tier")
        ])

        # Step 8: Persist to Gold Delta Table
        logger.info(f"Persisting {len(df_gold)} records to Gold Feature Store at {DELTA_TABLE_MODEL_READY}...")
        DeltaSink.write_raw_table(
            df=df_gold,
            table_path=DELTA_TABLE_MODEL_READY,
            mode=mode
        )

        logger.info(
            f"Gold Feature Store table successfully created: {df_gold.shape[0]} rows, "
            f"{df_gold.shape[1]} features and metadata columns."
        )
        return df_gold
