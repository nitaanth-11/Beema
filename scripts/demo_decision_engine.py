"""
Demonstration script for the Beema LAYA Insurance Decision Engine.
Runs 4 representative scenarios:
1. Normal routine claim (Fast-track straight-through adjudication)
2. Incomplete claim (Missing documents -> REQUEST_ADDITIONAL_EVIDENCE, not fraud)
3. Contradictory claim (Temporal violation & inflation -> SIU_FRAUD_INVESTIGATION)
4. Lakehouse record retrieval (Direct query against Delta Gold feature store)
"""

import sys
import json
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.decision.schemas import ClaimInputSchema
from src.decision.service import LayaInsuranceDecisionService

def print_result(scenario_name: str, response):
    print(f"\n{'='*70}")
    print(f" SCENARIO: {scenario_name}")
    print(f"{'='*70}")
    print(f"Claim ID              : {response.claim_id}")
    print(f"Final Recommendation  : {response.final_recommendation.value}")
    print(f"Composite Risk Score  : {response.composite_risk_score:.4f}")
    print(f"Triage Tier           : {response.triage_tier.value}")
    print(f"Evidence Sufficiency  : {response.evidence_sufficiency.value}")
    print(f"Investigation Priority: {response.investigation_priority.value}")
    print(f"Summary               : {response.decision_summary}")
    print(f"Rules Triggered ({len(response.rules_triggered)}):")
    for r in response.rules_triggered:
        print(f"  - [{r.severity}] {r.rule_name}: {r.description}")
    print(f"Discrepancies ({len(response.evidence_discrepancies)}):")
    for d in response.evidence_discrepancies:
        print(f"  - [{d.severity}] {d.discrepancy_type}: {d.details}")
    print(f"Model Output (is_mock={response.laya_model_output.is_mock}):")
    print(f"  - Triage: {response.laya_model_output.triage_choice} (conf={response.laya_model_output.triage_confidence:.2f})")
    print(f"  - Evidence: {response.laya_model_output.evidence_choice} (conf={response.laya_model_output.evidence_confidence:.2f})")
    print(f"  - Priority: {response.laya_model_output.investigation_priority} (conf={response.laya_model_output.investigation_confidence:.2f})")

def main():
    service = LayaInsuranceDecisionService()

    # Scenario 1: Normal Claim
    normal_claim = ClaimInputSchema(
        claim_id="CLM-NORM-001",
        policy_id="POL-AUTO-99120",
        claim_type="auto",
        state="CA",
        policyholder_tenure_years=5.0,
        previous_claims_count=0,
        incident_date="2024-05-10",
        claim_filed_date="2024-05-12",
        claim_amount=2400.0,
        deductible=500.0,
        claim_description="Low-speed rear parking scratch. Authorized bodyshop quote attached.",
        police_report_available=True,
        repair_estimate_amount=2350.0,
        supporting_documents_count=2
    )
    res_normal = service.evaluate_claim(normal_claim)
    print_result("1. NORMAL CLAIM (Eligible for Fast-Track)", res_normal)

    # Scenario 2: Incomplete Claim (Missing documentation)
    incomplete_claim = ClaimInputSchema(
        claim_id="CLM-INCOMP-002",
        policy_id="POL-PROP-88310",
        claim_type="property",
        state="FL",
        policyholder_tenure_years=3.5,
        previous_claims_count=0,
        incident_date="2024-04-01",
        claim_filed_date="2024-04-05",
        claim_amount=16500.0,
        deductible=1000.0,
        claim_description="Water pipe burst under sink causing hardwood floor swelling.",
        police_report_available=False,
        repair_estimate_amount=None,      # Missing repair estimate
        supporting_documents_count=0       # Missing receipts/photos
    )
    res_incomplete = service.evaluate_claim(incomplete_claim)
    print_result("2. INCOMPLETE CLAIM (Must Request Evidence, NOT Fraud)", res_incomplete)

    # Scenario 3: Contradictory / High-Risk Fraud Pattern
    fraud_claim = ClaimInputSchema(
        claim_id="CLM-FRAUD-003",
        policy_id="POL-AUTO-11029",
        claim_type="auto",
        state="NY",
        policyholder_tenure_years=0.1,    # Inception tenure < 2 months
        previous_claims_count=3,          # Serial claimant
        incident_date="2024-06-25",
        claim_filed_date="2024-06-18",    # Filed BEFORE incident!
        claim_amount=85000.0,
        deductible=500.0,
        repair_estimate_amount=22000.0,   # Claim amount inflated 3.8x
        claim_description="Total collision loss on highway.",
        police_report_available=False,
        supporting_documents_count=0
    )
    res_fraud = service.evaluate_claim(fraud_claim)
    print_result("3. CONTRADICTORY CLAIM (Critical Causality Violation -> SIU Fraud)", res_fraud)

    # Scenario 4: Lakehouse Direct Gold Record
    res_lakehouse = service.evaluate_from_lakehouse("CLM-0000018756")
    print_result("4. LAKEHOUSE DELTA GOLD QUERY (CLM-0000018756)", res_lakehouse)

if __name__ == "__main__":
    main()
