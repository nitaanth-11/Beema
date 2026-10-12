# Enterprise Data Dictionary - Beema RAW Ingestion Layer

This data dictionary documents all source attributes and audit governance fields across the three ingested public datasets in the **Beema AI-Powered Insurance Claims Investigation System**.

---

## 1. Audit & Governance Metadata Fields (Universal Across All RAW Tables)

Every RAW Delta Lake table is systematically injected with these 4 standardized audit fields upon ingestion:

| Field Name | Inferred Type | Nullable | Description | Example Value |
|---|---|---|---|---|
| `ingestion_timestamp` | `String (ISO 8601)` | No | UTC timestamp when the batch was acquired and committed into Delta Lake. | `2026-10-10T17:19:51.929537+00:00` |
| `source_dataset` | `String` | No | Upstream canonical source dataset repository identifier. | `ziadatalabs/FreeInsuranceClaims100M` |
| `batch_id` | `String` | No | Unique batch execution UUID for lineage tracking and idempotent processing. | `batch_20261010171945_d1c7a68a` |
| `dataset_version` | `String` | No | Semantic version tag for dataset schema and pipeline contract tracking. | `v1.0.0` |

---

## 2. Primary Dataset: Free Synthetic Insurance Claims (100M)
- **Source**: Hugging Face (`ziadatalabs/FreeInsuranceClaims100M`)
- **Domain**: Property & Casualty (Auto, Home, Renters, Property, Business)
- **Target Label**: `is_fraud_flagged_ground_truth` (Binary Boolean)
- **Delta Table**: `data/raw/delta/raw_free_insurance_claims`

| Field Name | Inferred Type | Nullable | Description & Domain Rules | Investigation Signal / Business Significance |
|---|---|---|---|---|
| `claim_id` | `String` | No | Unique claim identifier (`CLM-xxxxxxxxxx`). | Primary key. Used to track individual claim entity. |
| `policy_id` | `String` | No | Policy identifier (`POL-xxxxxxxxx`). Policies can have multiple claims. | Entity linking. Multi-claim frequency analysis. |
| `claim_type` | `String` | No | Line of insurance: `auto`, `home`, `renters`, `property`, `business`. | Stratification of baseline claim amounts and loss models. |
| `state` | `String` | No | Two-letter US state code (e.g. `CA`, `TX`, `NY`). | Geographic fraud rings and jurisdictional risk analysis. |
| `policyholder_tenure_years`| `Float32` | No | Duration (in years) the policyholder has held the policy. | **Major Red Flag**: New policy (< 1 year) combined with high claim. |
| `previous_claims_count` | `Int32` | No | Number of historical claims previously filed under this policy. | Habitual claimant profiling and loss ratio escalation. |
| `incident_date` | `Date` | No | Date on which the underlying insured incident occurred. | Timeline reconstruction and date consistency auditing. |
| `claim_filed_date` | `Date` | No | Date when the claim was submitted to the carrier. | Filing latency (`claim_filed_date - incident_date`). |
| `claim_amount` | `Float64` | No | Monetary amount claimed in USD. | Outlier detection against policy type and deductible. |
| `deductible` | `Float64` | No | Policyholder deductible threshold in USD (e.g., 250, 500, 1000). | Baseline exposure and self-insured retention evaluation. |
| `claim_status` | `String` | No | Resolution state: `approved`, `denied`, `pending`, `under_review`. | Correlated with fraud flag (denied / under review elevated). |
| `days_to_resolution` | `Float32` | No | Working days between filing and final resolution. | Process efficiency and investigation duration benchmark. |
| `is_fraud_flagged_ground_truth` | `Boolean` | No | **Ground Truth Fraud Flag** (`True` = Fraudulent, `False` = Genuine). | Supervised learning ground truth label for LAYA model training. |

---

## 3. Secondary Dataset: Kaggle Warranty Claims
- **Source**: Kaggle Competition (`warranty-claims`)
- **Domain**: Consumer Electronics & Appliance Warranty Claims
- **Target Label**: `Fraud` (Binary Integer: 0 or 1)
- **Delta Table**: `data/raw/delta/raw_warranty_claims`

| Field Name | Inferred Type | Nullable | Description & Domain Rules | Investigation Signal / Business Significance |
|---|---|---|---|---|
| `Region` | `String` | No | Customer geographic zone (`North`, `South`, `East`, `West`). | Regional claim density and service partner fraud patterns. |
| `state` | `String` | No | Indian state name (e.g. `Maharashtra`, `Tamil Nadu`). | Jurisdictional and logistics validation. |
| `Area` | `String` | No | Customer living area: `Urban`, `Rural`. | Rural vs Urban service turnaround and supply-chain risk. |
| `City` | `String` | No | City of policyholder residence. | Micro-cluster anomaly identification. |
| `Consumer_profile` | `String` | No | Employment / consumer persona (`Business`, `Salaried`, etc.). | Socioeconomic profiling and fraud inclination correlation. |
| `Product_category` | `String` | No | General equipment category: `Household`, `Entertainment`. | Baseline equipment complexity. |
| `Product_type` | `String` | No | Specific device: `AC` (Air Conditioner) or `TV` (Television). | Determines which sub-component issue codes apply. |
| `AC_1001_Issue` | `Int64` | No | Compressor issue status (0 = Replace, 1 = Repair, 2 = No issue). | Component failure authenticity vs fraudulent replacement claims. |
| `AC_1002_Issue` | `Int64` | No | Condenser Coil issue status (0 = Replace, 1 = Repair, 2 = No issue). | High-value replacement fraud monitoring. |
| `AC_1003_Issue` | `Int64` | No | Evaporator Coil issue status (0 = Replace, 1 = Repair, 2 = No issue). | Wear-and-tear vs sudden failure verification. |
| `TV_2001_Issue` | `Int64` | No | Power Supply board issue (0 = Replace, 1 = Repair, 2 = No issue). | Common electronic surge fraud claim check. |
| `TV_2002_Issue` | `Int64` | No | Inverter Board issue (0 = Replace, 1 = Repair, 2 = No issue). | Display/power circuitry component triage. |
| `TV_2003_Issue` | `Int64` | No | Motherboard issue (0 = Replace, 1 = Repair, 2 = No issue). | Critical high-value replacement part check. |
| `claim_value` | `Float64` | No | Total warranty payout requested in INR (Rs). | Outlier payouts relative to product age and component failure. |
| `Service_Centre` | `Int64` | No | Service center location code (e.g., 10, 11, 12, 13, 14, 15, 16). | **Major Red Flag**: Collusive technician or rogue service center. |
| `Product_Age` | `Int64` | No | Elapsed time in days between retail purchase and claim date. | Claims filed right before warranty expiration or immediately after purchase. |
| `Purchased_from` | `String` | No | Retail channel: `Dealer`, `Manufacturer`, `Internet`. | E-commerce return fraud vs counterfeit purchase origin. |
| `Call_details` | `Float64` | No | Total customer support call duration in minutes. | Abnormally short calls or scripted complaint patterns. |
| `Purpose` | `String` | No | Nature of contact: `claim`, `complaint`, `other`. | Contact intent classification. |
| `Fraud` | `Int64` | No | **Ground Truth Fraud Flag** (`1` = Fraudulent, `0` = Genuine). | Supervised classification target for warranty claim triage. |

---

## 4. Tertiary Dataset: Oracle Car Insurance Claims Fraud (Kraket Case Day)
- **Source**: Kaggle Competition (`frauddetection` / Oracle Benchmark)
- **Domain**: Auto Casualty Insurance Claims
- **Target Label**: `FraudFound_P` (Binary Integer: 0 or 1)
- **Delta Table**: `data/raw/delta/raw_car_insurance_fraud`

| Field Name | Inferred Type | Nullable | Description & Domain Rules | Investigation Signal / Business Significance |
|---|---|---|---|---|
| `Month` | `String` | No | Incident occurrence month (`Jan` - `Dec`). | Seasonal fraud spikes (holiday periods, adverse weather). |
| `WeekOfMonth` | `Int64` | No | Week number within incident month (1 to 5). | Temporal granularity for loss clustering. |
| `DayOfWeek` | `String` | No | Day of incident (`Monday` - `Sunday`). | Weekend vs weekday staged accidents. |
| `Make` | `String` | No | Vehicle brand (e.g. `Honda`, `Toyota`, `Ford`, `Accura`). | High-theft or high-repair cost vehicle model vulnerability. |
| `AccidentArea` | `String` | No | Incident location setting: `Urban`, `Rural`. | Staged collisions are heavily concentrated in urban intersections. |
| `DayOfWeekClaimed` | `String` | No | Day of the week the claim was officially registered. | Immediate reporting vs suspicious delays. |
| `MonthClaimed` | `String` | No | Month when the claim was registered. | Delayed filing window analysis. |
| `WeekOfMonthClaimed`| `Int64` | No | Week number of the month when registered. | Temporal tracking. |
| `Sex` | `String` | No | Policyholder gender: `Male`, `Female`. | Demographic baseline. |
| `MaritalStatus` | `String` | No | Marital status: `Single`, `Married`, `Divorced`, `Widow`. | Behavioral stability and profile modeling. |
| `Age` | `Int64` | No | Policyholder chronological age in years. | High-risk age bracket identification (youth or senior risk). |
| `Fault` | `String` | No | Liability attribution: `Policy Holder`, `Third Party`. | **Major Indicator**: Fraudulent claims predominantly fault policyholder. |
| `PolicyType` | `String` | No | Combined category: e.g., `Sedan - All Perils`, `Sedan - Collision`. | Comprehensive coverage exploitation patterns. |
| `VehicleCategory` | `String` | No | Vehicle chassis: `Sedan`, `Sport`, `Utility`. | Sports/utility vehicles associated with inflated loss totals. |
| `VehiclePrice` | `String` | No | Categorical value bracket (e.g., `more than 69000`, `20000 to 29000`).| Total loss inflation against depreciated market value. |
| `FraudFound_P` | `Int64` | No | **Ground Truth Fraud Flag** (`1` = Fraudulent, `0` = Genuine). | Supervised target label for auto claim SIU referrals. |
| `PolicyNumber` | `Int64` | No | Unique policy sequential identifier. | Entity key. |
| `RepNumber` | `Int64` | No | Claims representative assigned (1 to 16). | Collusion analysis between claims adjusters and fraud rings. |
| `Deductible` | `Int64` | No | Monetary deductible amount (e.g., 300, 400, 500, 700). | Lower deductibles often targeted by opportunistic claimants. |
| `DriverRating` | `Int64` | No | Historical driver safety score (1 to 4). | Behavioral risk profile. |
| `Days_Policy_Accident` | `String` | No | Time between policy inception and accident (`more than 30`, `none`). | **Critical Indicator**: Accidents occurring immediately after binding. |
| `Days_Policy_Claim` | `String` | No | Time between policy inception and filing claim. | Inception-to-claim latency red flag. |
| `PastNumberOfClaims`| `String` | No | Past claims count (`none`, `1`, `2 to 4`, `more than 4`). | Repeat staged accident operators. |
| `AgeOfVehicle` | `String` | No | Age of vehicle (`new`, `2 years`, `more than 7`). | Older vehicles insured for inflated agreed values. |
| `AgeOfPolicyHolder` | `String` | No | Age bucket (`26 to 30`, `31 to 35`, etc.). | Cohort benchmarking. |
| `PoliceReportFiled` | `String` | No | Official police report present: `Yes`, `No`. | **Major Indicator**: Staged/fictitious accidents rarely involve police. |
| `WitnessPresent` | `String` | No | Independent witness corroboration: `Yes`, `No`. | Corroboration scarcity in fraudulent claims. |
| `AgentType` | `String` | No | Agency channel: `External`, `Internal`. | Broker/intermediary moral hazard evaluation. |
| `NumberOfSuppliments`| `String` | No | Supplemental repair requests (`none`, `1 to 2`, `more than 5`).| "Creep" repair estimates from colluding body shops. |
| `AddressChange_Claim`| `String` | No | Policyholder address changes prior to claim. | Identity theft or phantom address red flag. |
| `NumberOfCars` | `String` | No | Vehicles insured under policy (`1 vehicle`, `2 vehicles`, etc.).| Household exposure. |
| `Year` | `Int64` | No | Calendar accident year (`1994`, `1995`, `1996`). | Longitudinal macro trend analysis. |
| `BasePolicy` | `String` | No | Underlying line: `All Perils`, `Collision`, `Liability`. | Policy coverage level. |

---

## 5. Gold Feature Store: Model-Ready Fraud Features (`gold_claims_features`)
- **Delta Table**: `data/model_ready/delta/gold_claims_features`
- **Purpose**: Engineered risk features, interaction ratios, and baseline heuristic scoring for the LAYA Decision Engine.

| Feature Name | Type | Description | Fraud Significance & Mathematical Definition |
|---|---|---|---|
| `filing_delay_days` | `Int32` | Latency in days between incident and claim filing. | `claim_filed_date - incident_date`. Same-day or delayed filings are notable red flags. |
| `incident_month` | `Int8` | Month index (1 to 12) of incident occurrence. | Seasonality and holiday loss spike tracking. |
| `incident_weekday` | `Int8` | Day of week (1=Mon to 7=Sun). | Weekend staged collision clustering. |
| `is_same_day_filing`| `Int32` | Flag: 1 if filed within 0 days of incident. | Immediate opportunistic reporting indicator. |
| `is_delayed_filing` | `Int32` | Flag: 1 if filing latency exceeds 30 days. | Delayed or retrospective fraudulent claim creation. |
| `is_weekend_incident` | `Int32` | Flag: 1 if incident occurred on Saturday or Sunday. | Non-business hour claim frequency. |
| `claim_to_deductible_ratio` | `Float64` | Ratio of claim payout to policyholder deductible. | `claim_amount / max(deductible, 1.0)`. High ratio indicates extreme carrier loss vs policyholder skin-in-the-game. |
| `log_claim_amount` | `Float64` | Natural logarithm of claim amount. | `ln(claim_amount + 1)`. Normalizes right-skewed payout distribution for ML convergence. |
| `is_new_policyholder` | `Int32` | Flag: 1 if tenure < 1.0 year. | **Major Red Flag**: 51% of fraudulent claims in benchmark belong to brand new policyholders (< 1 yr). |
| `claim_velocity_per_year` | `Float64` | Frequency of prior claims relative to tenure. | `previous_claims_count / (tenure_years + 0.1)`. Habitual serial claimant indicator. |
| `is_repeat_claimant` | `Int32` | Flag: 1 if historical claims count >= 2. | Serial claimant flag. |
| `new_policy_high_claim_interaction` | `Int32` | Interaction: New policyholder AND claim > $15,000. | **Critical Risk Signal**: Multiplies baseline fraud risk by > 5x. |
| `claim_type_fraud_rate` | `Float64` | Historical target mean by insurance line. | Out-of-fold target encoding for claim type baseline risk. |
| `state_fraud_rate` | `Float64` | Historical target mean by geographic state. | Regional organized fraud ring density index. |
| `laya_heuristic_risk_score` | `Float64` | Prior composite risk index in $[0.0, 1.0]$. | Linear weighted prior: `0.35 * new_policy_high_claim + 0.25 * is_new_policyholder + 0.20 * is_repeat_claimant + 0.10 * is_same_day_filing + 0.10 * high_deductible_ratio`. |
| `feature_pipeline_version` | `String` | Semantic feature version tag (`v1.0.0`). | Lineage tracking for reproducible ML training. |
| `feature_tier` | `String` | Architectural data tier (`GOLD_MODEL_READY`). | Lakehouse layer certification. |

---

## 6. Silver & Quarantine Governance Metadata Fields

| Field Name | Type | Layer | Description |
|---|---|---|---|
| `cleaned_timestamp` | `String (ISO 8601)` | Silver (`cleaned`) | UTC timestamp of standardization and validation execution. |
| `cleaned_version` | `String` | Silver (`cleaned`) | Semantic pipeline version contract tag (`v1.0.0`). |
| `validation_status` | `String` | Silver (`cleaned`) | Integrity status tag (`VALIDATED`). |
| `quarantine_reason` | `String` | Quarantine (`quarantine`) | Diagnostic failure code (e.g. `FILED_BEFORE_INCIDENT; NON_POSITIVE_AMOUNT`). |
| `quarantined_at` | `String (ISO 8601)` | Quarantine (`quarantine`) | UTC timestamp when record was diverted into DLQ. |
