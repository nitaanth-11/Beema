import sys
from pathlib import Path
import polars as pl
from deltalake import DeltaTable
from src.config import (
    DELTA_TABLE_PRIMARY,
    DELTA_TABLE_SECONDARY,
    DELTA_TABLE_TERTIARY
)

# Ensure utf-8 output in Windows shell
sys.stdout.reconfigure(encoding="utf-8")

def verify_table(name: str, table_path: Path):
    print("=" * 80)
    print(f"VERIFYING RAW DELTA TABLE: {name}")
    print(f"Path: {table_path}")
    print("=" * 80)

    if not table_path.exists():
        print(f"ERROR: Table path does not exist: {table_path}")
        return

    path_str = str(table_path).replace("\\", "/")
    dt = DeltaTable(path_str)
    
    print(f"Delta Version:              {dt.version()}")
    print(f"Parquet Part Files Count:   {len(dt.file_uris())}")
    
    # Check Delta transaction log
    delta_log_dir = table_path / "_delta_log"
    log_files = list(delta_log_dir.glob("*.json"))
    print(f"Transaction Log Files:      {len(log_files)} ({[f.name for f in log_files[:3]]})")

    # Read records via Polars Delta reader
    df = pl.read_delta(path_str)
    print(f"Record Count:               {len(df):,}")
    print(f"Column Count:               {len(df.columns)}")
    print("\nColumns & Types:")
    for col, dtype in zip(df.columns, df.dtypes):
        print(f"  - {col:<32}: {str(dtype)}")

    print("\nMetadata Audit Check:")
    meta_cols = ["ingestion_timestamp", "source_dataset", "batch_id", "dataset_version"]
    for m in meta_cols:
        if m in df.columns:
            val = df[m][0]
            print(f"  [OK] {m}: {val}")
        else:
            print(f"  [FAIL] {m}: MISSING")

    print("\nSample Records (First 2):")
    print(df.head(2))
    print("\n")

def main():
    tables = [
        ("Primary (FreeInsuranceClaims100M)", DELTA_TABLE_PRIMARY),
        ("Secondary (WarrantyClaims)", DELTA_TABLE_SECONDARY),
        ("Tertiary (CarInsuranceFraud)", DELTA_TABLE_TERTIARY),
    ]
    for name, p in tables:
        verify_table(name, p)

if __name__ == "__main__":
    main()
