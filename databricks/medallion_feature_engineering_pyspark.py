# Databricks notebook source
# MAGIC %md
# MAGIC # Beema Claims Investigation System - Complete Medallion Processing Pipeline
# MAGIC 
# MAGIC **Architecture Stages**:
# MAGIC 1. **Silver Layer**: Cleaning, Standardization, Deduplication, and Business Rule Validation
# MAGIC 2. **Quarantine DLQ**: Isolation of corrupt or invalid claims
# MAGIC 3. **Gold Layer**: Risk Ratios, Temporal Deltas, Interaction Terms, and Feature Store Tables

# COMMAND ----------
import uuid
from datetime import datetime, timezone
from pyspark.sql import functions as F
from pyspark.sql.types import *

# Storage Paths (DBFS / GCS / Unity Catalog)
BASE_PATH = "dbfs:/FileStore/beema/data"
RAW_PRIMARY = f"{BASE_PATH}/raw/delta/raw_free_insurance_claims"
SILVER_PRIMARY = f"{BASE_PATH}/cleaned/delta/cleaned_free_insurance_claims"
GOLD_FEATURES = f"{BASE_PATH}/model_ready/delta/gold_claims_features"
QUARANTINE_PATH = f"{BASE_PATH}/quarantine/delta/quarantine_claims"

CATALOG_SCHEMA = "beema_lakehouse"

spark.sql(f"CREATE DATABASE IF NOT EXISTS {CATALOG_SCHEMA}")

CURRENT_TIMESTAMP = datetime.now(timezone.utc).isoformat()
CLEANED_VERSION = "v1.0.0"
FEATURE_VERSION = "v1.0.0"

print("Databricks Medallion Engine Initialized.")

# COMMAND ----------
# MAGIC %md
# MAGIC ## Stage 1: Silver Layer - Cleaning, Type Standardization & Deduplication

# COMMAND ----------
# Read Bronze (RAW) Delta Table
df_raw = spark.read.format("delta").load(RAW_PRIMARY)

# 1. Clean & Standardize strings
df_standardized = df_raw \
    .withColumn("claim_id", F.upper(F.trim(F.col("claim_id")))) \
    .withColumn("policy_id", F.upper(F.trim(F.col("policy_id")))) \
    .withColumn("claim_type", F.lower(F.trim(F.col("claim_type")))) \
    .withColumn("state", F.upper(F.trim(F.col("state")))) \
    .withColumn("claim_status", F.lower(F.trim(F.col("claim_status")))) \
    .withColumn("incident_date", F.to_date(F.col("incident_date"))) \
    .withColumn("claim_filed_date", F.to_date(F.col("claim_filed_date"))) \
    .withColumn("claim_amount", F.round(F.col("claim_amount").cast("double"), 2)) \
    .withColumn("deductible", F.round(F.col("deductible").cast("double"), 2))

# 2. Deduplicate by Primary Key
df_deduped = df_standardized.dropDuplicates(["claim_id"])

# 3. Business Integrity Validation Rules
is_invalid_expr = (
    F.col("claim_id").isNull() |
    (F.col("claim_amount") <= 0) |
    (F.col("deductible") < 0) |
    (F.col("policyholder_tenure_years") < 0) |
    (F.col("claim_filed_date") < F.col("incident_date"))
)

df_valid = df_deduped.filter(~is_invalid_expr)
df_quarantine = df_deduped.filter(is_invalid_expr) \
    .withColumn("quarantine_reason", F.lit("CONSTRAINT_VALIDATION_FAILURE")) \
    .withColumn("quarantined_at", F.lit(CURRENT_TIMESTAMP))

# Route Quarantined records if present
if df_quarantine.count() > 0:
    df_quarantine.write.format("delta").mode("append").save(QUARANTINE_PATH)
    print(f"Quarantined {df_quarantine.count()} invalid records to {QUARANTINE_PATH}")

# Add Silver Audit Columns
df_silver = df_valid \
    .withColumn("cleaned_timestamp", F.lit(CURRENT_TIMESTAMP)) \
    .withColumn("cleaned_version", F.lit(CLEANED_VERSION)) \
    .withColumn("validation_status", F.lit("VALIDATED"))

# Commit Silver Delta Table
df_silver.write.format("delta").mode("overwrite").option("overwriteSchema", "true").save(SILVER_PRIMARY)
spark.sql(f"""
    CREATE TABLE IF NOT EXISTS {CATALOG_SCHEMA}.cleaned_free_insurance_claims
    USING DELTA LOCATION '{SILVER_PRIMARY}'
""")

print(f"Silver Delta table committed: {df_silver.count()} records.")

# COMMAND ----------
# MAGIC %md
# MAGIC ## Stage 2: Gold Layer - Fraud Feature Engineering & Prior Risk Scoring

# COMMAND ----------
# 1. Temporal Ratios & Flags
df_f1 = df_silver \
    .withColumn("filing_delay_days", F.datediff(F.col("claim_filed_date"), F.col("incident_date"))) \
    .withColumn("incident_month", F.month(F.col("incident_date"))) \
    .withColumn("incident_weekday", F.dayofweek(F.col("incident_date")))

df_f2 = df_f1 \
    .withColumn("is_same_day_filing", F.when(F.col("filing_delay_days") == 0, 1).otherwise(0)) \
    .withColumn("is_delayed_filing", F.when(F.col("filing_delay_days") > 30, 1).otherwise(0)) \
    .withColumn("is_weekend_incident", F.when(F.col("incident_weekday").isin([1, 7]), 1).otherwise(0))

# 2. Exposure & Loss Ratios
df_f3 = df_f2 \
    .withColumn("claim_to_deductible_ratio", 
        F.round(F.col("claim_amount") / F.when(F.col("deductible") > 0, F.col("deductible")).otherwise(1.0), 2)) \
    .withColumn("log_claim_amount", F.round(F.log1p(F.col("claim_amount")), 4))

# 3. Tenure Risk & Repeat Claimant Signals
df_f4 = df_f3 \
    .withColumn("is_new_policyholder", F.when(F.col("policyholder_tenure_years") < 1.0, 1).otherwise(0)) \
    .withColumn("claim_velocity_per_year", 
        F.round(F.col("previous_claims_count") / (F.col("policyholder_tenure_years") + 0.1), 2)) \
    .withColumn("is_repeat_claimant", F.when(F.col("previous_claims_count") >= 2, 1).otherwise(0))

# 4. Critical High-Risk Interaction Term (New Policy + High Claim Value)
df_f5 = df_f4 \
    .withColumn("new_policy_high_claim_interaction", 
        F.when((F.col("is_new_policyholder") == 1) & (F.col("claim_amount") > 15000.0), 1).otherwise(0))

# 5. Composite Prior Heuristic Score for LAYA
laya_score_expr = (
    (F.col("new_policy_high_claim_interaction") * 0.35) +
    (F.col("is_new_policyholder") * 0.25) +
    (F.col("is_repeat_claimant") * 0.20) +
    (F.col("is_same_day_filing") * 0.10) +
    (F.when(F.col("claim_to_deductible_ratio") > 20.0, 1.0).otherwise(0.0) * 0.10)
)

df_gold = df_f5 \
    .withColumn("laya_heuristic_risk_score", F.round(laya_score_expr, 4)) \
    .withColumn("feature_created_timestamp", F.lit(CURRENT_TIMESTAMP)) \
    .withColumn("feature_pipeline_version", F.lit(FEATURE_VERSION)) \
    .withColumn("feature_tier", F.lit("GOLD_MODEL_READY"))

# Commit Gold Delta Table
df_gold.write.format("delta").mode("overwrite").option("overwriteSchema", "true").save(GOLD_FEATURES)
spark.sql(f"""
    CREATE TABLE IF NOT EXISTS {CATALOG_SCHEMA}.gold_claims_features
    USING DELTA LOCATION '{GOLD_FEATURES}'
""")

print(f"Gold Model-Ready Delta table committed: {df_gold.count()} rows, {len(df_gold.columns)} features.")

# COMMAND ----------
# MAGIC %md
# MAGIC ## Stage 3: Querying the Gold Feature Store via Databricks SQL

# COMMAND ----------
# MAGIC %sql
# MAGIC SELECT 
# MAGIC     claim_id,
# MAGIC     claim_type,
# MAGIC     claim_amount,
# MAGIC     deductible,
# MAGIC     filing_delay_days,
# MAGIC     claim_to_deductible_ratio,
# MAGIC     is_new_policyholder,
# MAGIC     new_policy_high_claim_interaction,
# MAGIC     laya_heuristic_risk_score,
# MAGIC     is_fraud_flagged_ground_truth
# MAGIC FROM beema_lakehouse.gold_claims_features
# MAGIC ORDER BY laya_heuristic_risk_score DESC
# MAGIC LIMIT 10;
