# Databricks notebook source
# MAGIC %md
# MAGIC # Beema Claims Investigation System - RAW Delta Lake Ingestion
# MAGIC 
# MAGIC **Pipeline Stage**: RAW (Bronze) Layer Data Acquisition  
# MAGIC **Storage Target**: GCS / DBFS / Unity Catalog Delta Lake  
# MAGIC **Datasets**:
# MAGIC 1. Primary: Hugging Face `ziadatalabs/FreeInsuranceClaims100M`
# MAGIC 2. Secondary: Kaggle `warranty-claims`
# MAGIC 3. Tertiary: Kaggle `frauddetection` (Oracle Benchmark)

# COMMAND ----------
import uuid
from datetime import datetime, timezone
from pyspark.sql import functions as F
from pyspark.sql.types import *

# 1. Configuration & Storage Paths (GCS or Unity Catalog)
# In production, point to your GCS bucket: "gs://beema-lake-prod/raw/delta/..."
# Or Unity Catalog: "catalog_name.raw_schema.table_name"
CATALOG_NAME = "hive_metastore"  # Or your Unity Catalog name
SCHEMA_NAME = "beema_raw"

BASE_DELTA_PATH = "dbfs:/FileStore/beema/data/raw/delta"  # Or "gs://your-gcs-bucket/raw/delta"
TABLE_PRIMARY = f"{BASE_DELTA_PATH}/raw_free_insurance_claims"
TABLE_SECONDARY = f"{BASE_DELTA_PATH}/raw_warranty_claims"
TABLE_TERTIARY = f"{BASE_DELTA_PATH}/raw_car_insurance_fraud"

PRIMARY_SAMPLE_SIZE = 25000
DATASET_VERSION = "v1.0.0"

# Generate Batch ID and Timestamp
CURRENT_TIMESTAMP = datetime.now(timezone.utc).isoformat()
BATCH_ID = f"batch_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}"

print(f"Batch Execution ID: {BATCH_ID}")
print(f"Timestamp:          {CURRENT_TIMESTAMP}")

# COMMAND ----------
# MAGIC %md
# MAGIC ### Step 1: Ingest Primary Dataset (`FreeInsuranceClaims100M`)
# MAGIC In Databricks, we read the remote Parquet stream directly into a distributed Spark DataFrame.

# COMMAND ----------
primary_parquet_url = (
    "https://huggingface.co/datasets/ziadatalabs/FreeInsuranceClaims100M/resolve/main/insurance_claims_100M.parquet"
)

print(f"Reading primary dataset from {primary_parquet_url}...")
# In Databricks, Spark reads the parquet URL using HTTP/HTTPS or GCS landing path
df_primary_raw = spark.read.parquet(primary_parquet_url).limit(PRIMARY_SAMPLE_SIZE)

# Append mandatory governance metadata fields
df_primary_enriched = df_primary_raw \
    .withColumn("ingestion_timestamp", F.lit(CURRENT_TIMESTAMP)) \
    .withColumn("source_dataset", F.lit("ziadatalabs/FreeInsuranceClaims100M")) \
    .withColumn("batch_id", F.lit(BATCH_ID)) \
    .withColumn("dataset_version", F.lit(DATASET_VERSION))

# Write to Delta Lake with ACID guarantees
print(f"Writing to Delta Lake at {TABLE_PRIMARY}...")
df_primary_enriched.write \
    .format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .save(TABLE_PRIMARY)

# Register in Databricks metastore/Unity Catalog
spark.sql(f"CREATE DATABASE IF NOT EXISTS {SCHEMA_NAME}")
spark.sql(f"""
    CREATE TABLE IF NOT EXISTS {SCHEMA_NAME}.raw_free_insurance_claims
    USING DELTA
    LOCATION '{TABLE_PRIMARY}'
""")

print("Primary table successfully committed to Delta Lake!")

# COMMAND ----------
# MAGIC %md
# MAGIC ### Step 2: Ingest Secondary Dataset (`warranty-claims`)

# COMMAND ----------
# Databricks reads from GCS landing zone or uploaded DBFS staging file
secondary_landing_path = "dbfs:/FileStore/beema/data/raw/landing/warranty_claims.csv"

# If file exists on storage, load it; otherwise Spark creates the schema-compliant sample
try:
    df_secondary_raw = spark.read.option("header", "true").option("inferSchema", "true").csv(secondary_landing_path)
    print("Loaded secondary dataset from landing path.")
except Exception as e:
    print("Landing file not found, loading sample extract...")
    # Read from local landing copy or GCS
    df_secondary_raw = spark.read.parquet(f"{BASE_DELTA_PATH}/raw_warranty_claims")

df_secondary_enriched = df_secondary_raw \
    .withColumn("ingestion_timestamp", F.lit(CURRENT_TIMESTAMP)) \
    .withColumn("source_dataset", F.lit("kaggle/competitions/warranty-claims")) \
    .withColumn("batch_id", F.lit(BATCH_ID)) \
    .withColumn("dataset_version", F.lit(DATASET_VERSION))

df_secondary_enriched.write \
    .format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .save(TABLE_SECONDARY)

spark.sql(f"""
    CREATE TABLE IF NOT EXISTS {SCHEMA_NAME}.raw_warranty_claims
    USING DELTA
    LOCATION '{TABLE_SECONDARY}'
""")

# COMMAND ----------
# MAGIC %md
# MAGIC ### Step 3: Ingest Tertiary Dataset (`frauddetection` / Oracle Benchmark)

# COMMAND ----------
df_tertiary_raw = spark.read.parquet(f"{BASE_DELTA_PATH}/raw_car_insurance_fraud")

df_tertiary_enriched = df_tertiary_raw \
    .withColumn("ingestion_timestamp", F.lit(CURRENT_TIMESTAMP)) \
    .withColumn("source_dataset", F.lit("kaggle/competitions/frauddetection")) \
    .withColumn("batch_id", F.lit(BATCH_ID)) \
    .withColumn("dataset_version", F.lit(DATASET_VERSION))

df_tertiary_enriched.write \
    .format("delta") \
    .mode("overwrite") \
    .option("overwriteSchema", "true") \
    .save(TABLE_TERTIARY)

spark.sql(f"""
    CREATE TABLE IF NOT EXISTS {SCHEMA_NAME}.raw_car_insurance_fraud
    USING DELTA
    LOCATION '{TABLE_TERTIARY}'
""")

# COMMAND ----------
# MAGIC %md
# MAGIC ### Step 4: Verify Delta Lake Tables via Databricks SQL

# COMMAND ----------
# MAGIC %sql
# MAGIC SELECT 
# MAGIC     'raw_free_insurance_claims' AS table_name, 
# MAGIC     count(*) AS total_records, 
# MAGIC     count(DISTINCT claim_id) AS unique_ids,
# MAGIC     sum(CASE WHEN is_fraud_flagged_ground_truth THEN 1 ELSE 0 END) AS fraud_records
# MAGIC FROM beema_raw.raw_free_insurance_claims
# MAGIC UNION ALL
# MAGIC SELECT 
# MAGIC     'raw_warranty_claims', 
# MAGIC     count(*), 
# MAGIC     count(DISTINCT claim_value),
# MAGIC     sum(CASE WHEN Fraud = 1 THEN 1 ELSE 0 END)
# MAGIC FROM beema_raw.raw_warranty_claims
# MAGIC UNION ALL
# MAGIC SELECT 
# MAGIC     'raw_car_insurance_fraud', 
# MAGIC     count(*), 
# MAGIC     count(DISTINCT PolicyNumber),
# MAGIC     sum(CASE WHEN FraudFound_P = 1 THEN 1 ELSE 0 END)
# MAGIC FROM beema_raw.raw_car_insurance_fraud;

# COMMAND ----------
# MAGIC %md
# MAGIC ### Step 5: View Delta Table History (ACID Transaction Log)

# COMMAND ----------
# MAGIC %sql
# MAGIC DESCRIBE HISTORY beema_raw.raw_free_insurance_claims;
