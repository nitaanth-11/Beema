from pathlib import Path
from typing import Union
import polars as pl
import pyarrow as pa
from deltalake import write_deltalake, DeltaTable
from src.utils.logger import get_logger

logger = get_logger("DeltaSink")

class DeltaSink:
    """
    Handles writes and transaction management for RAW Delta Lake tables.
    Guarantees ACID transactions, schema enforcement, and version tracking.
    """

    @staticmethod
    def write_raw_table(
        df: pl.DataFrame,
        table_path: Union[str, Path],
        mode: str = "overwrite"
    ) -> DeltaTable:
        """
        Writes a Polars DataFrame to a Delta Lake table at table_path.
        
        Args:
            df: Enriched Polars DataFrame containing source data + audit metadata.
            table_path: Filesystem path to the Delta table directory.
            mode: Write mode ('overwrite', 'append', or 'error').
        
        Returns:
            DeltaTable instance pointing to the persisted table.
        """
        path_str = str(table_path).replace("\\", "/")
        Path(table_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Convert Polars DataFrame to PyArrow Table for standard Arrow IPC
        arrow_table = df.to_arrow()
        
        logger.info(f"Writing {len(df)} records to RAW Delta Lake table at: {path_str} (mode={mode})")
        write_deltalake(
            table_or_uri=path_str,
            data=arrow_table,
            mode=mode,
            schema_mode="overwrite" if mode == "overwrite" else "merge"
        )
        
        # Verify and load Delta table instance
        delta_table = DeltaTable(path_str)
        current_version = delta_table.version()
        files = delta_table.file_uris()
        
        logger.info(
            f"Delta Lake write committed successfully! "
            f"Table Version: {current_version}, Total Parquet Data Files: {len(files)}"
        )
        return delta_table
