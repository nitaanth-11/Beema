from pathlib import Path
import polars as pl
from src.config import DELTA_TABLE_PRIMARY, DELTA_TABLE_SECONDARY, DELTA_TABLE_TERTIARY, RAW_DIR

def export_delta_to_csv():
    """Utility to export RAW Delta tables to CSV format for ad-hoc inspection."""
    csv_dir = RAW_DIR / "csv"
    csv_dir.mkdir(parents=True, exist_ok=True)

    # Primary
    df_primary = pl.read_delta(str(DELTA_TABLE_PRIMARY).replace("\\", "/"))
    df_primary.write_csv(csv_dir / "raw_free_insurance_claims.csv")
    df_primary.head(100).write_csv(csv_dir / "raw_free_insurance_claims_sample_100.csv")

    # Secondary
    df_secondary = pl.read_delta(str(DELTA_TABLE_SECONDARY).replace("\\", "/"))
    df_secondary.write_csv(csv_dir / "raw_warranty_claims.csv")

    # Tertiary
    df_tertiary = pl.read_delta(str(DELTA_TABLE_TERTIARY).replace("\\", "/"))
    df_tertiary.write_csv(csv_dir / "raw_car_insurance_fraud.csv")
    print(f"Exported Delta tables to CSV in {csv_dir}")

if __name__ == "__main__":
    export_delta_to_csv()
