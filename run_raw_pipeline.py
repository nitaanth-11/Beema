import argparse
import sys
from pathlib import Path
from src.config import (
    DELTA_TABLE_PRIMARY,
    DELTA_TABLE_SECONDARY,
    DELTA_TABLE_TERTIARY,
    DEFAULT_PRIMARY_SAMPLE_SIZE,
    DEFAULT_SECONDARY_SAMPLE_SIZE,
    DEFAULT_TERTIARY_SAMPLE_SIZE,
    DOCS_DIR,
    generate_batch_id
)
from src.ingestion.primary_loader import FreeInsuranceClaimsLoader
from src.ingestion.secondary_loader import WarrantyClaimsLoader
from src.ingestion.tertiary_loader import CarInsuranceFraudLoader
from src.ingestion.delta_sink import DeltaSink
from src.quality.profiler import RawDataProfiler
from src.utils.logger import get_logger

logger = get_logger("RawIngestionPipeline")

def run_pipeline(
    primary_sample_size: int = DEFAULT_PRIMARY_SAMPLE_SIZE,
    secondary_sample_size: int = DEFAULT_SECONDARY_SAMPLE_SIZE,
    tertiary_sample_size: int = DEFAULT_TERTIARY_SAMPLE_SIZE,
    write_mode: str = "overwrite"
):
    """
    Executes the end-to-end RAW data acquisition and Delta Lake ingestion pipeline.
    """
    batch_id = generate_batch_id()
    logger.info("=" * 70)
    logger.info("STARTING BEEMA RAW DATA INGESTION PIPELINE")
    logger.info(f"Batch Execution ID: {batch_id}")
    logger.info(f"Write Mode: {write_mode}")
    logger.info("=" * 70)

    # 1. Primary Dataset: Hugging Face FreeInsuranceClaims100M
    logger.info("\n>>> [1/3] Ingesting Primary Dataset: FreeInsuranceClaims100M...")
    primary_loader = FreeInsuranceClaimsLoader()
    df_primary = primary_loader.fetch_sample(
        sample_size=primary_sample_size,
        batch_id=batch_id
    )
    delta_primary = DeltaSink.write_raw_table(
        df=df_primary,
        table_path=DELTA_TABLE_PRIMARY,
        mode=write_mode
    )

    # 2. Secondary Dataset: Kaggle Warranty Claims
    logger.info("\n>>> [2/3] Ingesting Secondary Dataset: Kaggle Warranty Claims...")
    secondary_loader = WarrantyClaimsLoader()
    df_secondary = secondary_loader.load_data(
        sample_size=secondary_sample_size,
        batch_id=batch_id
    )
    delta_secondary = DeltaSink.write_raw_table(
        df=df_secondary,
        table_path=DELTA_TABLE_SECONDARY,
        mode=write_mode
    )

    # 3. Tertiary Dataset: Kaggle frauddetection / Oracle Car Insurance Fraud
    logger.info("\n>>> [3/3] Ingesting Tertiary Dataset: Kaggle frauddetection (Oracle Car Insurance)...")
    tertiary_loader = CarInsuranceFraudLoader()
    df_tertiary = tertiary_loader.load_data(
        sample_size=tertiary_sample_size,
        batch_id=batch_id
    )
    delta_tertiary = DeltaSink.write_raw_table(
        df=df_tertiary,
        table_path=DELTA_TABLE_TERTIARY,
        mode=write_mode
    )

    # 4. Automated Quality Audit & Profiling
    logger.info("\n>>> [4/4] Profiling RAW Delta Lake Tables & Generating Quality Report...")
    tables_to_profile = [
        DELTA_TABLE_PRIMARY,
        DELTA_TABLE_SECONDARY,
        DELTA_TABLE_TERTIARY
    ]
    profiles = [RawDataProfiler.profile_delta_table(t) for t in tables_to_profile]

    # Write Markdown Quality Report
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    report_md = RawDataProfiler.generate_markdown_summary(profiles)
    report_path = DOCS_DIR / "data_quality_report.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_md)
    logger.info(f"Quality and profiling report generated at: {report_path}")

    logger.info("\n" + "=" * 70)
    logger.info("RAW INGESTION PIPELINE FINISHED SUCCESSFULLY")
    logger.info(f"Primary Table:   {DELTA_TABLE_PRIMARY} ({len(df_primary):,} rows)")
    logger.info(f"Secondary Table: {DELTA_TABLE_SECONDARY} ({len(df_secondary):,} rows)")
    logger.info(f"Tertiary Table:  {DELTA_TABLE_TERTIARY} ({len(df_tertiary):,} rows)")
    logger.info("=" * 70)

    return profiles

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Beema RAW Data Ingestion Runner")
    parser.add_argument("--primary-sample-size", type=int, default=DEFAULT_PRIMARY_SAMPLE_SIZE,
                        help=f"Sample size for primary dataset (default: {DEFAULT_PRIMARY_SAMPLE_SIZE})")
    parser.add_argument("--secondary-sample-size", type=int, default=DEFAULT_SECONDARY_SAMPLE_SIZE,
                        help=f"Sample size for secondary dataset (default: {DEFAULT_SECONDARY_SAMPLE_SIZE})")
    parser.add_argument("--tertiary-sample-size", type=int, default=DEFAULT_TERTIARY_SAMPLE_SIZE,
                        help=f"Sample size for tertiary dataset (default: {DEFAULT_TERTIARY_SAMPLE_SIZE})")
    parser.add_argument("--mode", type=str, default="overwrite", choices=["overwrite", "append"],
                        help="Delta write mode (default: overwrite)")

    args = parser.parse_args()
    run_pipeline(
        primary_sample_size=args.primary_sample_size,
        secondary_sample_size=args.secondary_sample_size,
        tertiary_sample_size=args.tertiary_sample_size,
        write_mode=args.mode
    )
