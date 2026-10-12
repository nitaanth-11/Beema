import polars as pl
from typing import Optional
from src.config import get_utc_timestamp, DATASET_VERSION

def append_raw_metadata(
    df: pl.DataFrame,
    source_dataset_name: str,
    batch_id: str,
    dataset_version: Optional[str] = None,
    ingestion_timestamp: Optional[str] = None
) -> pl.DataFrame:
    """
    Enriches a raw Polars DataFrame with standard audit and governance metadata fields.
    Preserves all original source fields unchanged.
    
    Injected fields:
      - ingestion_timestamp: ISO 8601 UTC timestamp of ingestion execution
      - source_dataset: Identifier of the upstream source dataset
      - batch_id: Unique batch execution ID
      - dataset_version: Version tracking identifier
    """
    ts = ingestion_timestamp or get_utc_timestamp()
    version = dataset_version or DATASET_VERSION
    
    return df.with_columns([
        pl.lit(ts).alias("ingestion_timestamp"),
        pl.lit(source_dataset_name).alias("source_dataset"),
        pl.lit(batch_id).alias("batch_id"),
        pl.lit(version).alias("dataset_version")
    ])
