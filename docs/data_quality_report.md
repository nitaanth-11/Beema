# RAW Data Layer Profiling & Quality Audit Report

**Audit Status**: VERIFIED & REPRODUCIBLE  
**Storage Engine**: Delta Lake (ACID Transaction Log)  

## Executive Ingestion Summary

| Delta Table | Dataset Source | Total Records | Columns | Duplicates | Target / Fraud Column | Fraud Prevalence |
|---|---|---|---|---|---|---|
| `raw_free_insurance_claims` | `ziadatalabs/FreeInsuranceClaims100M` | 25,000 | 17 | 0 | `is_fraud_flagged_ground_truth` | 2,033 (8.13%) |
| `raw_warranty_claims` | `kaggle/competitions/warranty-claims` | 5,000 | 24 | 0 | `Fraud` | 310 (6.2%) |
| `raw_car_insurance_fraud` | `kaggle/competitions/frauddetection` | 5,000 | 37 | 0 | `FraudFound_P` | 366 (7.32%) |

---

## Table Details: `raw_free_insurance_claims`

- **Filesystem Location**: `C:/Users/nitaa/Downloads/Beema/data/raw/delta/raw_free_insurance_claims`
- **Upstream Source**: `ziadatalabs/FreeInsuranceClaims100M`
- **Record Count**: 25,000
- **Duplicate Rows**: 0 (PK: `claim_id` duplicates: 0)

### Audit & Governance Metadata Check
| Required Metadata Field | Status | Distinct Values | Sample / Value |
|---|---|---|---|
| `ingestion_timestamp` | Verified | 1 | `2026-10-10T17:19:51.929537+00:00` |
| `source_dataset` | Verified | 1 | `ziadatalabs/FreeInsuranceClaims100M` |
| `batch_id` | Verified | 1 | `batch_20261010171945_d1c7a68a` |
| `dataset_version` | Verified | 1 | `v1.0.0` |

### Target / Fraud Label Distribution
Target Column: `is_fraud_flagged_ground_truth`

| Label Class | Count | Percentage |
|---|---|---|
| `False` | 22,967 | 91.87% |
| `True` | 2,033 | 8.13% |

### Column Schema & Data Quality
| Column Name | Inferred DataType | Null Count | Null % | Unique Count | Sample Values |
|---|---|---|---|---|---|
| `claim_id` | `String` | 0 | 0.0% | 25,000 | `CLM-0000018769, CLM-0000017529, CLM-0000014568` |
| `policy_id` | `String` | 0 | 0.0% | 24,361 | `POL-100457384, POL-100163487, POL-100255728` |
| `claim_type` | `String` | 0 | 0.0% | 5 | `renters, home, property` |
| `state` | `String` | 0 | 0.0% | 40 | `NE, IA, WI` |
| `policyholder_tenure_years` | `Float32` | 0 | 0.0% | 291 | `0.0, 0.10000000149011612, 0.20000000298023224` |
| `previous_claims_count` | `Int32` | 0 | 0.0% | 7 | `0, 1, 2` |
| `incident_date` | `Date` | 0 | 0.0% | 2,038 | `2021-01-01, 2021-01-02, 2021-01-03` |
| `claim_filed_date` | `Date` | 0 | 0.0% | 2,050 | `2021-01-02, 2021-01-03, 2021-01-04` |
| `claim_amount` | `Float64` | 0 | 0.0% | 24,807 | `200.0, 355.89, 375.97` |
| `deductible` | `Float64` | 0 | 0.0% | 7 | `250.0, 500.0, 1000.0` |
| `claim_status` | `String` | 0 | 0.0% | 4 | `under_review, pending, denied` |
| `days_to_resolution` | `Float32` | 0 | 0.0% | 78 | `0.0, 1.0, 2.0` |
| `is_fraud_flagged_ground_truth` | `Boolean` | 0 | 0.0% | 2 | `False, True` |
| `ingestion_timestamp` | `String` | 0 | 0.0% | 1 | `2026-10-10T17:19:51.929537+00:00` |
| `source_dataset` | `String` | 0 | 0.0% | 1 | `ziadatalabs/FreeInsuranceClaims100M` |
| `batch_id` | `String` | 0 | 0.0% | 1 | `batch_20261010171945_d1c7a68a` |
| `dataset_version` | `String` | 0 | 0.0% | 1 | `v1.0.0` |

### Sample Records (First 2 Rows)

```json
[
  {
    "claim_id": "CLM-0000018756",
    "policy_id": "POL-100374524",
    "claim_type": "business",
    "state": "CA",
    "policyholder_tenure_years": 0.0,
    "previous_claims_count": 1,
    "incident_date": "2023-06-23",
    "claim_filed_date": "2023-06-27",
    "claim_amount": 119678.66,
    "deductible": 10000.0,
    "claim_status": "approved",
    "days_to_resolution": 11.0,
    "is_fraud_flagged_ground_truth": false,
    "ingestion_timestamp": "2026-10-10T17:19:51.929537+00:00",
    "source_dataset": "ziadatalabs/FreeInsuranceClaims100M",
    "batch_id": "batch_20261010171945_d1c7a68a",
    "dataset_version": "v1.0.0"
  },
  {
    "claim_id": "CLM-0000018757",
    "policy_id": "POL-100156504",
    "claim_type": "renters",
    "state": "KY",
    "policyholder_tenure_years": 2.4000000953674316,
    "previous_claims_count": 2,
    "incident_date": "2025-02-07",
    "claim_filed_date": "2025-02-09",
    "claim_amount": 2767.04,
    "deductible": 250.0,
    "claim_status": "approved",
    "days_to_resolution": 14.0,
    "is_fraud_flagged_ground_truth": false,
    "ingestion_timestamp": "2026-10-10T17:19:51.929537+00:00",
    "source_dataset": "ziadatalabs/FreeInsuranceClaims100M",
    "batch_id": "batch_20261010171945_d1c7a68a",
    "dataset_version": "v1.0.0"
  }
]
```

---

## Table Details: `raw_warranty_claims`

- **Filesystem Location**: `C:/Users/nitaa/Downloads/Beema/data/raw/delta/raw_warranty_claims`
- **Upstream Source**: `kaggle/competitions/warranty-claims`
- **Record Count**: 5,000
- **Duplicate Rows**: 0 (PK: `None` duplicates: 0)

### Audit & Governance Metadata Check
| Required Metadata Field | Status | Distinct Values | Sample / Value |
|---|---|---|---|
| `ingestion_timestamp` | Verified | 1 | `2026-10-10T17:19:53.017934+00:00` |
| `source_dataset` | Verified | 1 | `kaggle/competitions/warranty-claims` |
| `batch_id` | Verified | 1 | `batch_20261010171945_d1c7a68a` |
| `dataset_version` | Verified | 1 | `v1.0.0` |

### Target / Fraud Label Distribution
Target Column: `Fraud`

| Label Class | Count | Percentage |
|---|---|---|
| `1` | 310 | 6.2% |
| `0` | 4,690 | 93.8% |

### Column Schema & Data Quality
| Column Name | Inferred DataType | Null Count | Null % | Unique Count | Sample Values |
|---|---|---|---|---|---|
| `Region` | `String` | 0 | 0.0% | 4 | `East, West, South` |
| `state` | `String` | 0 | 0.0% | 7 | `Uttar Pradesh, Tamil Nadu, Delhi` |
| `Area` | `String` | 0 | 0.0% | 2 | `Rural, Urban` |
| `City` | `String` | 0 | 0.0% | 9 | `Bangalore, Pune, Delhi` |
| `Consumer_profile` | `String` | 0 | 0.0% | 5 | `Student, Salaried, Self-employed` |
| `Product_category` | `String` | 0 | 0.0% | 2 | `Entertainment, Household` |
| `Product_type` | `String` | 0 | 0.0% | 2 | `TV, AC` |
| `AC_1001_Issue` | `Int64` | 0 | 0.0% | 3 | `0, 1, 2` |
| `AC_1002_Issue` | `Int64` | 0 | 0.0% | 3 | `0, 1, 2` |
| `AC_1003_Issue` | `Int64` | 0 | 0.0% | 3 | `0, 1, 2` |
| `TV_2001_Issue` | `Int64` | 0 | 0.0% | 3 | `0, 1, 2` |
| `TV_2002_Issue` | `Int64` | 0 | 0.0% | 3 | `0, 1, 2` |
| `TV_2003_Issue` | `Int64` | 0 | 0.0% | 3 | `0, 1, 2` |
| `claim_value` | `Float64` | 0 | 0.0% | 4,991 | `1855.71, 1861.62, 1889.46` |
| `Service_Centre` | `Int64` | 0 | 0.0% | 7 | `10, 11, 12` |
| `Product_Age` | `Int64` | 0 | 0.0% | 735 | `15, 16, 17` |
| `Purchased_from` | `String` | 0 | 0.0% | 3 | `Dealer, Internet, Manufacturer` |
| `Call_details` | `Float64` | 0 | 0.0% | 1,687 | `0.5, 0.51, 0.52` |
| `Purpose` | `String` | 0 | 0.0% | 3 | `claim, other, complaint` |
| `Fraud` | `Int64` | 0 | 0.0% | 2 | `0, 1` |
| `ingestion_timestamp` | `String` | 0 | 0.0% | 1 | `2026-10-10T17:19:53.017934+00:00` |
| `source_dataset` | `String` | 0 | 0.0% | 1 | `kaggle/competitions/warranty-claims` |
| `batch_id` | `String` | 0 | 0.0% | 1 | `batch_20261010171945_d1c7a68a` |
| `dataset_version` | `String` | 0 | 0.0% | 1 | `v1.0.0` |

### Sample Records (First 2 Rows)

```json
[
  {
    "Region": "East",
    "state": "Tamil Nadu",
    "Area": "Urban",
    "City": "Bangalore",
    "Consumer_profile": "Business",
    "Product_category": "Household",
    "Product_type": "AC",
    "AC_1001_Issue": 1,
    "AC_1002_Issue": 2,
    "AC_1003_Issue": 2,
    "TV_2001_Issue": 2,
    "TV_2002_Issue": 2,
    "TV_2003_Issue": 2,
    "claim_value": 5811.62,
    "Service_Centre": 10,
    "Product_Age": 345,
    "Purchased_from": "Internet",
    "Call_details": 4.5,
    "Purpose": "other",
    "Fraud": 0,
    "ingestion_timestamp": "2026-10-10T17:19:53.017934+00:00",
    "source_dataset": "kaggle/competitions/warranty-claims",
    "batch_id": "batch_20261010171945_d1c7a68a",
    "dataset_version": "v1.0.0"
  },
  {
    "Region": "West",
    "state": "Maharashtra",
    "Area": "Urban",
    "City": "Chennai",
    "Consumer_profile": "Salaried",
    "Product_category": "Household",
    "Product_type": "AC",
    "AC_1001_Issue": 0,
    "AC_1002_Issue": 2,
    "AC_1003_Issue": 0,
    "TV_2001_Issue": 2,
    "TV_2002_Issue": 2,
    "TV_2003_Issue": 2,
    "claim_value": 12777.23,
    "Service_Centre": 14,
    "Product_Age": 428,
    "Purchased_from": "Dealer",
    "Call_details": 2.05,
    "Purpose": "other",
    "Fraud": 0,
    "ingestion_timestamp": "2026-10-10T17:19:53.017934+00:00",
    "source_dataset": "kaggle/competitions/warranty-claims",
    "batch_id": "batch_20261010171945_d1c7a68a",
    "dataset_version": "v1.0.0"
  }
]
```

---

## Table Details: `raw_car_insurance_fraud`

- **Filesystem Location**: `C:/Users/nitaa/Downloads/Beema/data/raw/delta/raw_car_insurance_fraud`
- **Upstream Source**: `kaggle/competitions/frauddetection`
- **Record Count**: 5,000
- **Duplicate Rows**: 0 (PK: `PolicyNumber` duplicates: 0)

### Audit & Governance Metadata Check
| Required Metadata Field | Status | Distinct Values | Sample / Value |
|---|---|---|---|
| `ingestion_timestamp` | Verified | 1 | `2026-10-10T17:19:53.655708+00:00` |
| `source_dataset` | Verified | 1 | `kaggle/competitions/frauddetection` |
| `batch_id` | Verified | 1 | `batch_20261010171945_d1c7a68a` |
| `dataset_version` | Verified | 1 | `v1.0.0` |

### Target / Fraud Label Distribution
Target Column: `FraudFound_P`

| Label Class | Count | Percentage |
|---|---|---|
| `0` | 4,634 | 92.68% |
| `1` | 366 | 7.32% |

### Column Schema & Data Quality
| Column Name | Inferred DataType | Null Count | Null % | Unique Count | Sample Values |
|---|---|---|---|---|---|
| `Month` | `String` | 0 | 0.0% | 12 | `Mar, May, Aug` |
| `WeekOfMonth` | `Int64` | 0 | 0.0% | 5 | `1, 2, 3` |
| `DayOfWeek` | `String` | 0 | 0.0% | 7 | `Sunday, Saturday, Thursday` |
| `Make` | `String` | 0 | 0.0% | 10 | `Dodge, Mercury, VW` |
| `AccidentArea` | `String` | 0 | 0.0% | 2 | `Urban, Rural` |
| `DayOfWeekClaimed` | `String` | 0 | 0.0% | 7 | `Monday, Wednesday, Saturday` |
| `MonthClaimed` | `String` | 0 | 0.0% | 12 | `Sep, Jan, Apr` |
| `WeekOfMonthClaimed` | `Int64` | 0 | 0.0% | 5 | `1, 2, 3` |
| `Sex` | `String` | 0 | 0.0% | 2 | `Female, Male` |
| `MaritalStatus` | `String` | 0 | 0.0% | 4 | `Divorced, Widow, Married` |
| `Age` | `Int64` | 0 | 0.0% | 63 | `18, 19, 20` |
| `Fault` | `String` | 0 | 0.0% | 2 | `Third Party, Policy Holder` |
| `PolicyType` | `String` | 0 | 0.0% | 9 | `Sport - Collision, Utility - Collision, Utility - All Perils` |
| `VehicleCategory` | `String` | 0 | 0.0% | 3 | `Utility, Sport, Sedan` |
| `VehiclePrice` | `String` | 0 | 0.0% | 6 | `40000 to 59000, 30000 to 39000, 60000 to 69000` |
| `FraudFound_P` | `Int64` | 0 | 0.0% | 2 | `0, 1` |
| `PolicyNumber` | `Int64` | 0 | 0.0% | 5,000 | `1, 2, 3` |
| `RepNumber` | `Int64` | 0 | 0.0% | 16 | `1, 2, 3` |
| `Deductible` | `Int64` | 0 | 0.0% | 4 | `300, 400, 500` |
| `DriverRating` | `Int64` | 0 | 0.0% | 4 | `1, 2, 3` |
| `Days_Policy_Accident` | `String` | 0 | 0.0% | 5 | `1 to 7, 15 to 30, 8 to 15` |
| `Days_Policy_Claim` | `String` | 0 | 0.0% | 5 | `8 to 15, 15 to 30, 1 to 7` |
| `PastNumberOfClaims` | `String` | 0 | 0.0% | 4 | `1, 2 to 4, none` |
| `AgeOfVehicle` | `String` | 0 | 0.0% | 8 | `7 years, 2 years, new` |
| `AgeOfPolicyHolder` | `String` | 0 | 0.0% | 9 | `over 65, 31 to 35, 36 to 40` |
| `PoliceReportFiled` | `String` | 0 | 0.0% | 2 | `Yes, No` |
| `WitnessPresent` | `String` | 0 | 0.0% | 2 | `No, Yes` |
| `AgentType` | `String` | 0 | 0.0% | 2 | `External, Internal` |
| `NumberOfSuppliments` | `String` | 0 | 0.0% | 4 | `3 to 5, none, 1 to 2` |
| `AddressChange_Claim` | `String` | 0 | 0.0% | 5 | `2 to 3 years, no change, 1 year` |
| `NumberOfCars` | `String` | 0 | 0.0% | 5 | `3 to 4, 1 vehicle, 5 to 8` |
| `Year` | `Int64` | 0 | 0.0% | 3 | `1994, 1995, 1996` |
| `BasePolicy` | `String` | 0 | 0.0% | 3 | `Liability, Collision, All Perils` |
| `ingestion_timestamp` | `String` | 0 | 0.0% | 1 | `2026-10-10T17:19:53.655708+00:00` |
| `source_dataset` | `String` | 0 | 0.0% | 1 | `kaggle/competitions/frauddetection` |
| `batch_id` | `String` | 0 | 0.0% | 1 | `batch_20261010171945_d1c7a68a` |
| `dataset_version` | `String` | 0 | 0.0% | 1 | `v1.0.0` |

### Sample Records (First 2 Rows)

```json
[
  {
    "Month": "Aug",
    "WeekOfMonth": 1,
    "DayOfWeek": "Saturday",
    "Make": "Mercury",
    "AccidentArea": "Urban",
    "DayOfWeekClaimed": "Friday",
    "MonthClaimed": "Apr",
    "WeekOfMonthClaimed": 3,
    "Sex": "Female",
    "MaritalStatus": "Married",
    "Age": 72,
    "Fault": "Third Party",
    "PolicyType": "Sedan - Liability",
    "VehicleCategory": "Sedan",
    "VehiclePrice": "30000 to 39000",
    "FraudFound_P": 0,
    "PolicyNumber": 1,
    "RepNumber": 15,
    "Deductible": 300,
    "DriverRating": 3,
    "Days_Policy_Accident": "15 to 30",
    "Days_Policy_Claim": "15 to 30",
    "PastNumberOfClaims": "none",
    "AgeOfVehicle": "more than 7",
    "AgeOfPolicyHolder": "over 65",
    "PoliceReportFiled": "No",
    "WitnessPresent": "No",
    "AgentType": "External",
    "NumberOfSuppliments": "3 to 5",
    "AddressChange_Claim": "under 6 months",
    "NumberOfCars": "5 to 8",
    "Year": 1995,
    "BasePolicy": "Liability",
    "ingestion_timestamp": "2026-10-10T17:19:53.655708+00:00",
    "source_dataset": "kaggle/competitions/frauddetection",
    "batch_id": "batch_20261010171945_d1c7a68a",
    "dataset_version": "v1.0.0"
  },
  {
    "Month": "Jul",
    "WeekOfMonth": 2,
    "DayOfWeek": "Monday",
    "Make": "Accura",
    "AccidentArea": "Rural",
    "DayOfWeekClaimed": "Wednesday",
    "MonthClaimed": "Apr",
    "WeekOfMonthClaimed": 1,
    "Sex": "Female",
    "MaritalStatus": "Divorced",
    "Age": 47,
    "Fault": "Third Party",
    "PolicyType": "Utility - All Perils",
    "VehicleCategory": "Utility",
    "VehiclePrice": "less than 20000",
    "FraudFound_P": 0,
    "PolicyNumber": 2,
    "RepNumber": 13,
    "Deductible": 400,
    "DriverRating": 4,
    "Days_Policy_Accident": "more than 30",
    "Days_Policy_Claim": "8 to 15",
    "PastNumberOfClaims": "more than 4",
    "AgeOfVehicle": "new",
    "AgeOfPolicyHolder": "51 to 65",
    "PoliceReportFiled": "No",
    "WitnessPresent": "No",
    "AgentType": "External",
    "NumberOfSuppliments": "1 to 2",
    "AddressChange_Claim": "4 to 8 years",
    "NumberOfCars": "1 vehicle",
    "Year": 1995,
    "BasePolicy": "All Perils",
    "ingestion_timestamp": "2026-10-10T17:19:53.655708+00:00",
    "source_dataset": "kaggle/competitions/frauddetection",
    "batch_id": "batch_20261010171945_d1c7a68a",
    "dataset_version": "v1.0.0"
  }
]
```

---
