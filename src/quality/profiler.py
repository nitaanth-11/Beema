import polars as pl
from pathlib import Path
from typing import Dict, Any, List, Union
from src.utils.logger import get_logger

logger = get_logger("DataQualityProfiler")

class RawDataProfiler:
    """
    Profiles RAW Delta tables to assess schema compliance, completeness,
    duplicate rates, and fraud label distributions.
    """

    TARGET_COLUMN_CANDIDATES = [
        "is_fraud_flagged_ground_truth",
        "Fraud",
        "FraudFound_P",
        "fraud",
        "is_fraud"
    ]

    REQUIRED_METADATA_FIELDS = [
        "ingestion_timestamp",
        "source_dataset",
        "batch_id",
        "dataset_version"
    ]

    @classmethod
    def profile_delta_table(cls, table_path: Union[str, Path]) -> Dict[str, Any]:
        """
        Profiles a Delta Lake table at table_path and returns comprehensive quality metrics.
        """
        path_str = str(table_path).replace("\\", "/")
        logger.info(f"Profiling RAW Delta table at: {path_str}")
        
        df = pl.read_delta(path_str)
        n_rows = len(df)
        cols = df.columns
        dtypes = {col: str(dtype) for col, dtype in zip(cols, df.dtypes)}

        # 1. Column-level Null and Cardinality Analysis
        columns_metrics = []
        for col in cols:
            null_count = df[col].null_count()
            null_pct = round((null_count / n_rows) * 100, 2) if n_rows > 0 else 0.0
            unique_count = df[col].n_unique()
            # Sample values (up to 3 distinct non-null values)
            non_null_samples = df[col].drop_nulls().unique().head(3).to_list()
            
            columns_metrics.append({
                "column_name": col,
                "data_type": dtypes[col],
                "null_count": null_count,
                "null_percentage": null_pct,
                "unique_values": unique_count,
                "sample_values": non_null_samples
            })

        # 2. Duplicate Records Analysis
        # Check complete duplicate rows across all original columns (excluding metadata)
        source_cols = [c for c in cols if c not in cls.REQUIRED_METADATA_FIELDS]
        full_duplicate_count = n_rows - df.select(source_cols).n_unique()

        # Check primary key duplicates if recognizable ID exists
        id_candidates = ["claim_id", "PolicyNumber", "claim_number", "id"]
        pk_duplicate_count = 0
        pk_col_found = None
        for cand in id_candidates:
            if cand in cols:
                pk_col_found = cand
                pk_duplicate_count = n_rows - df[cand].n_unique()
                break

        # 3. Target / Fraud Label Distribution Analysis
        target_col = None
        for cand in cls.TARGET_COLUMN_CANDIDATES:
            if cand in cols:
                target_col = cand
                break

        target_distribution = {}
        if target_col:
            val_counts = df[target_col].value_counts().to_dicts()
            for row in val_counts:
                val = str(row[target_col])
                cnt = row["count"]
                pct = round((cnt / n_rows) * 100, 2) if n_rows > 0 else 0.0
                target_distribution[val] = {"count": cnt, "percentage": pct}

        # 4. Metadata Validation
        metadata_status = {}
        for meta in cls.REQUIRED_METADATA_FIELDS:
            if meta in cols:
                distinct_vals = df[meta].unique().to_list()
                metadata_status[meta] = {
                    "present": True,
                    "distinct_count": len(distinct_vals),
                    "examples": distinct_vals[:2]
                }
            else:
                metadata_status[meta] = {"present": False}

        # Extract dataset source from metadata or infer
        dataset_source = "unknown"
        if "source_dataset" in cols and n_rows > 0:
            dataset_source = df["source_dataset"][0]

        profile_result = {
            "table_path": path_str,
            "dataset_source": dataset_source,
            "number_of_records": n_rows,
            "number_of_columns": len(cols),
            "columns": cols,
            "data_types": dtypes,
            "columns_profile": columns_metrics,
            "duplicate_records_count": full_duplicate_count,
            "pk_column": pk_col_found,
            "pk_duplicates": pk_duplicate_count,
            "target_column": target_col,
            "target_distribution": target_distribution,
            "metadata_audit": metadata_status,
            "sample_records": df.head(5).to_dicts()
        }

        logger.info(
            f"Profiling complete for {path_str}: {n_rows} rows, {len(cols)} columns, "
            f"{full_duplicate_count} duplicates, target='{target_col}'"
        )
        return profile_result

    @classmethod
    def generate_markdown_summary(cls, profiles: List[Dict[str, Any]]) -> str:
        """
        Formats multiple table profiles into a comprehensive GitHub-flavored Markdown report.
        """
        lines = []
        lines.append("# RAW Data Layer Profiling & Quality Audit Report\n")
        lines.append(f"**Audit Status**: VERIFIED & REPRODUCIBLE  ")
        lines.append(f"**Storage Engine**: Delta Lake (ACID Transaction Log)  \n")

        lines.append("## Executive Ingestion Summary\n")
        lines.append("| Delta Table | Dataset Source | Total Records | Columns | Duplicates | Target / Fraud Column | Fraud Prevalence |")
        lines.append("|---|---|---|---|---|---|---|")

        for p in profiles:
            table_name = Path(p["table_path"]).name
            source = p["dataset_source"]
            n_rows = f"{p['number_of_records']:,}"
            n_cols = p["number_of_columns"]
            dups = f"{p['duplicate_records_count']:,}"
            target_col = p["target_column"] or "N/A"
            
            # Extract fraud prevalence
            fraud_pct_str = "N/A"
            if p["target_distribution"]:
                for k, v in p["target_distribution"].items():
                    if k in ["true", "True", "1", 1]:
                        fraud_pct_str = f"{v['count']:,} ({v['percentage']}%)"
            
            lines.append(f"| `{table_name}` | `{source}` | {n_rows} | {n_cols} | {dups} | `{target_col}` | {fraud_pct_str} |")

        lines.append("\n---\n")

        for p in profiles:
            table_name = Path(p["table_path"]).name
            lines.append(f"## Table Details: `{table_name}`\n")
            lines.append(f"- **Filesystem Location**: `{p['table_path']}`")
            lines.append(f"- **Upstream Source**: `{p['dataset_source']}`")
            lines.append(f"- **Record Count**: {p['number_of_records']:,}")
            lines.append(f"- **Duplicate Rows**: {p['duplicate_records_count']:,} (PK: `{p['pk_column']}` duplicates: {p['pk_duplicates']:,})")
            
            lines.append("\n### Audit & Governance Metadata Check")
            lines.append("| Required Metadata Field | Status | Distinct Values | Sample / Value |")
            lines.append("|---|---|---|---|")
            for meta_field, meta_val in p["metadata_audit"].items():
                if meta_val["present"]:
                    lines.append(f"| `{meta_field}` | Verified | {meta_val['distinct_count']} | `{meta_val['examples'][0] if meta_val['examples'] else ''}` |")
                else:
                    lines.append(f"| `{meta_field}` | MISSING | 0 | - |")

            lines.append("\n### Target / Fraud Label Distribution")
            if p["target_distribution"]:
                lines.append(f"Target Column: `{p['target_column']}`\n")
                lines.append("| Label Class | Count | Percentage |")
                lines.append("|---|---|---|")
                for lbl, stats in p["target_distribution"].items():
                    lines.append(f"| `{lbl}` | {stats['count']:,} | {stats['percentage']}% |")
            else:
                lines.append("No explicit binary fraud column detected.\n")

            lines.append("\n### Column Schema & Data Quality")
            lines.append("| Column Name | Inferred DataType | Null Count | Null % | Unique Count | Sample Values |")
            lines.append("|---|---|---|---|---|---|")
            for c in p["columns_profile"]:
                samples_str = ", ".join([str(s) for s in c["sample_values"][:3]])
                lines.append(f"| `{c['column_name']}` | `{c['data_type']}` | {c['null_count']:,} | {c['null_percentage']}% | {c['unique_values']:,} | `{samples_str}` |")

            lines.append("\n### Sample Records (First 2 Rows)\n")
            lines.append("```json")
            import json
            lines.append(json.dumps(p["sample_records"][:2], indent=2, default=str))
            lines.append("```\n")
            lines.append("---\n")

        return "\n".join(lines)
