# RAW Delta Lake Architecture & Schema Specifications

This specification details the physical storage architecture, schema definitions, and transactional guarantees implemented in the **RAW Delta Lake** layer of the Beema platform.

---

## 1. Storage Architecture & Directory Topology

```
Beema/
├── data/
│   ├── raw/
│   │   ├── delta/
│   │   │   ├── raw_free_insurance_claims/
│   │   │   │   ├── _delta_log/
│   │   │   │   │   └── 00000000000000000000.json
│   │   │   │   └── part-00000-xxxx.snappy.parquet
│   │   │   ├── raw_warranty_claims/
│   │   │   │   ├── _delta_log/
│   │   │   │   │   └── 00000000000000000000.json
│   │   │   │   └── part-00000-xxxx.snappy.parquet
│   │   │   └── raw_car_insurance_fraud/
│   │   │       ├── _delta_log/
│   │   │       │   └── 00000000000000000000.json
│   │   │       └── part-00000-xxxx.snappy.parquet
│   │   └── landing/
│   │       ├── free_insurance_claims_sample.parquet
│   │       ├── warranty_claims.csv
│   │       └── car_insurance_fraud.csv
│   ├── cleaned/          # Placeholder for downstream Silver transformation layer
│   ├── model_ready/      # Placeholder for downstream Gold feature store layer
│   └── quarantine/       # Placeholder for malformed / quarantined payloads
```

### Git Isolation Policy
In accordance with production enterprise data compliance, the `.gitignore` explicitly isolates the entire `data/` directory. No raw data, parquet files, or Delta transaction logs are committed to GitHub.

---

## 2. Delta Lake Transactional Guarantees

The RAW layer utilizes **Delta Lake** (via `delta-rs` / `deltalake` 1.6.6) to guarantee:
1. **ACID Transactions**: Every ingestion run commits an atomic JSON manifest inside `_delta_log/`. Partial or interrupted writes never corrupt the table.
2. **Time Travel & Versioning**: Every write increments table version (`version=0`, `version=1`, etc.), enabling historical audits and reproducible pipeline execution.
3. **Schema Enforcement**: Schema is enforced at write time. Unmapped columns or type mutations trigger explicit verification before commitment.
4. **Columnar Compression**: Source data is persisted using Apache Parquet format with Snappy compression for optimal I/O throughput.

---

## 3. Schema Definitions

### 3.1 Primary Table: `raw_free_insurance_claims`
- **Location**: `data/raw/delta/raw_free_insurance_claims`
- **Source**: `ziadatalabs/FreeInsuranceClaims100M`
- **Record Count**: 25,000 records (manageable sample)

```sql
CREATE TABLE raw_free_insurance_claims (
    claim_id                        STRING NOT NULL,
    policy_id                       STRING NOT NULL,
    claim_type                      STRING NOT NULL,
    state                           STRING NOT NULL,
    policyholder_tenure_years       FLOAT,
    previous_claims_count           INT,
    incident_date                   DATE,
    claim_filed_date                DATE,
    claim_amount                    DOUBLE,
    deductible                      DOUBLE,
    claim_status                    STRING,
    days_to_resolution              FLOAT,
    is_fraud_flagged_ground_truth   BOOLEAN NOT NULL,
    -- Audit Metadata Columns
    ingestion_timestamp             STRING NOT NULL,
    source_dataset                  STRING NOT NULL,
    batch_id                        STRING NOT NULL,
    dataset_version                 STRING NOT NULL
) USING DELTA;
```

---

### 3.2 Secondary Table: `raw_warranty_claims`
- **Location**: `data/raw/delta/raw_warranty_claims`
- **Source**: `kaggle/competitions/warranty-claims`
- **Record Count**: 5,000 records

```sql
CREATE TABLE raw_warranty_claims (
    Region                          STRING NOT NULL,
    state                           STRING NOT NULL,
    Area                            STRING NOT NULL,
    City                            STRING NOT NULL,
    Consumer_profile                STRING NOT NULL,
    Product_category                STRING NOT NULL,
    Product_type                    STRING NOT NULL,
    AC_1001_Issue                   BIGINT NOT NULL,
    AC_1002_Issue                   BIGINT NOT NULL,
    AC_1003_Issue                   BIGINT NOT NULL,
    TV_2001_Issue                   BIGINT NOT NULL,
    TV_2002_Issue                   BIGINT NOT NULL,
    TV_2003_Issue                   BIGINT NOT NULL,
    claim_value                     DOUBLE NOT NULL,
    Service_Centre                  BIGINT NOT NULL,
    Product_Age                     BIGINT NOT NULL,
    Purchased_from                  STRING NOT NULL,
    Call_details                    DOUBLE NOT NULL,
    Purpose                         STRING NOT NULL,
    Fraud                           BIGINT NOT NULL,
    -- Audit Metadata Columns
    ingestion_timestamp             STRING NOT NULL,
    source_dataset                  STRING NOT NULL,
    batch_id                        STRING NOT NULL,
    dataset_version                 STRING NOT NULL
) USING DELTA;
```

---

### 3.3 Tertiary Table: `raw_car_insurance_fraud`
- **Location**: `data/raw/delta/raw_car_insurance_fraud`
- **Source**: `kaggle/competitions/frauddetection` (Oracle Car Insurance Fraud)
- **Record Count**: 5,000 records

```sql
CREATE TABLE raw_car_insurance_fraud (
    Month                           STRING NOT NULL,
    WeekOfMonth                     BIGINT NOT NULL,
    DayOfWeek                       STRING NOT NULL,
    Make                            STRING NOT NULL,
    AccidentArea                    STRING NOT NULL,
    DayOfWeekClaimed                STRING NOT NULL,
    MonthClaimed                    STRING NOT NULL,
    WeekOfMonthClaimed              BIGINT NOT NULL,
    Sex                             STRING NOT NULL,
    MaritalStatus                   STRING NOT NULL,
    Age                             BIGINT NOT NULL,
    Fault                           STRING NOT NULL,
    PolicyType                      STRING NOT NULL,
    VehicleCategory                 STRING NOT NULL,
    VehiclePrice                    STRING NOT NULL,
    FraudFound_P                    BIGINT NOT NULL,
    PolicyNumber                    BIGINT NOT NULL,
    RepNumber                       BIGINT NOT NULL,
    Deductible                      BIGINT NOT NULL,
    DriverRating                    BIGINT NOT NULL,
    Days_Policy_Accident            STRING NOT NULL,
    Days_Policy_Claim               STRING NOT NULL,
    PastNumberOfClaims              STRING NOT NULL,
    AgeOfVehicle                    STRING NOT NULL,
    AgeOfPolicyHolder               STRING NOT NULL,
    PoliceReportFiled               STRING NOT NULL,
    WitnessPresent                  STRING NOT NULL,
    AgentType                       STRING NOT NULL,
    NumberOfSuppliments             STRING NOT NULL,
    AddressChange_Claim             STRING NOT NULL,
    NumberOfCars                    STRING NOT NULL,
    Year                            BIGINT NOT NULL,
    BasePolicy                      STRING NOT NULL,
    -- Audit Metadata Columns
    ingestion_timestamp             STRING NOT NULL,
    source_dataset                  STRING NOT NULL,
    batch_id                        STRING NOT NULL,
    dataset_version                 STRING NOT NULL
) USING DELTA;
```

---

## 4. Ingestion Principles in the RAW Layer

1. **No Early Business Transformations**:
   - The RAW layer stores original source data without business transformations, lossy conversions, or imputation.
   - Column names and data types strictly adhere to upstream sources.
2. **Deterministic Governance Injection**:
   - Audit metadata (`ingestion_timestamp`, `source_dataset`, `batch_id`, `dataset_version`) are appended in a non-destructive manner.
3. **Reproducibility**:
   - Every batch is tagged with a unique batch ID (`batch_<timestamp>_<uuid>`).
   - If a batch fails mid-flight, Delta Lake atomicity ensures that zero partial records remain committed.
