import polars as pl
import requests
from typing import Optional
from src.config import (
    PRIMARY_PARQUET_URL,
    PRIMARY_DATASET_ID,
    DEFAULT_PRIMARY_SAMPLE_SIZE,
    LANDING_DIR
)
from src.ingestion.metadata import append_raw_metadata
from src.utils.logger import get_logger

logger = get_logger("PrimaryLoader")

class FreeInsuranceClaimsLoader:
    """
    Loader for the Primary Dataset: ziadatalabs/FreeInsuranceClaims100M.
    Fetches a manageable, high-fidelity sample directly from Hugging Face
    using HTTP range requests or the Datasets-Server API.
    """
    SOURCE_NAME = "ziadatalabs/FreeInsuranceClaims100M"

    def __init__(self, parquet_url: str = PRIMARY_PARQUET_URL):
        self.parquet_url = parquet_url

    def fetch_sample(
        self,
        sample_size: int = DEFAULT_PRIMARY_SAMPLE_SIZE,
        batch_id: str = "batch_default",
        cache_landing: bool = True
    ) -> pl.DataFrame:
        """
        Loads a manageable sample of FreeInsuranceClaims100M without downloading the entire 100M records.
        """
        logger.info(f"Initiating primary data acquisition from {self.SOURCE_NAME} (sample_size={sample_size})")
        df_raw = None

        # Strategy 1: Remote Parquet scan via Polars HTTP range requests
        try:
            logger.info(f"Querying Parquet directly over HTTP range requests: {self.parquet_url}")
            df_raw = pl.scan_parquet(self.parquet_url).limit(sample_size).collect()
            logger.info(f"Successfully loaded {len(df_raw)} records via Parquet range scan.")
        except Exception as e:
            logger.warning(f"Remote parquet scan failed ({e}). Attempting Strategy 2 (HF Server API)...")

        # Strategy 2: Hugging Face Datasets Server Rows API (Pagination fallback)
        if df_raw is None or len(df_raw) == 0:
            try:
                logger.info("Fetching rows via Hugging Face Datasets-Server REST API...")
                batch_limit = 100
                rows_accumulated = []
                offset = 0
                while len(rows_accumulated) < min(sample_size, 1000):
                    fetch_len = min(batch_limit, sample_size - len(rows_accumulated))
                    api_url = (
                        f"https://datasets-server.huggingface.co/rows?"
                        f"dataset={PRIMARY_DATASET_ID}&config=default&split=train&offset={offset}&length={fetch_len}"
                    )
                    resp = requests.get(api_url, timeout=15)
                    if resp.status_code == 200:
                        data = resp.json()
                        rows = [item["row"] for item in data.get("rows", [])]
                        if not rows:
                            break
                        rows_accumulated.extend(rows)
                        offset += len(rows)
                    else:
                        break
                if rows_accumulated:
                    df_raw = pl.DataFrame(rows_accumulated)
                    logger.info(f"Successfully fetched {len(df_raw)} rows via Datasets-Server API.")
            except Exception as e:
                logger.error(f"Datasets Server API fallback failed: {e}")

        if df_raw is None or len(df_raw) == 0:
            raise RuntimeError(f"Failed to acquire sample from primary dataset {self.SOURCE_NAME}")

        # Cache landed raw extract if enabled
        if cache_landing:
            LANDING_DIR.mkdir(parents=True, exist_ok=True)
            landing_path = LANDING_DIR / "free_insurance_claims_sample.parquet"
            df_raw.write_parquet(landing_path)
            logger.info(f"Landed raw sample cached to {landing_path}")

        # Append standard RAW metadata audit columns
        df_enriched = append_raw_metadata(
            df=df_raw,
            source_dataset_name=self.SOURCE_NAME,
            batch_id=batch_id
        )

        logger.info(
            f"Primary dataset ingestion prepared: {df_enriched.shape[0]} rows, "
            f"{df_enriched.shape[1]} columns (including 4 metadata fields)."
        )
        return df_enriched
