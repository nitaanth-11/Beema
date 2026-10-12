import pytest
from src.decision.schemas import ClaimInputSchema
from src.decision.rules_engine import InsuranceRulesEngine

def test_normal_claim_triggers_no_rules():
    claim = ClaimInputSchema(
        claim_id="CLM-NORM-01",
        claim_type="auto",
        state="CA",
        policyholder_tenure_years=5.0,
        previous_claims_count=0,
        incident_date="2024-05-01",
        claim_filed_date="2024-05-03",
        claim_amount=3500.0,
        deductible=500.0,
        police_report_available=True
    )
    violations, penalty = InsuranceRulesEngine.evaluate_rules(claim)
    assert len(violations) == 0
    assert penalty == 0.0

def test_new_policyholder_high_claim_rule():
    claim = ClaimInputSchema(
        claim_id="CLM-SUSP-01",
        claim_type="auto",
        policyholder_tenure_years=0.1,  # < 1 year
        claim_amount=45000.0,           # > $10k
        deductible=500.0,
        incident_date="2024-05-01",
        claim_filed_date="2024-05-02"
    )
    violations, penalty = InsuranceRulesEngine.evaluate_rules(claim)
    rule_ids = [v.rule_id for v in violations]
    assert "INS_RULE_002_NEW_POLICY_HIGH_EXPOSURE" in rule_ids
    assert penalty > 0.30

def test_below_deductible_rule():
    claim = ClaimInputSchema(
        claim_id="CLM-DED-01",
        claim_amount=400.0,
        deductible=1000.0,  # claim < deductible
        policyholder_tenure_years=3.0
    )
    violations, penalty = InsuranceRulesEngine.evaluate_rules(claim)
    rule_ids = [v.rule_id for v in violations]
    assert "INS_RULE_001_BELOW_DEDUCTIBLE" in rule_ids

def test_extreme_filing_delay_rule():
    claim = ClaimInputSchema(
        claim_id="CLM-DELAY-01",
        incident_date="2024-01-01",
        claim_filed_date="2024-03-15",  # 74 days delay
        claim_amount=5000.0,
        deductible=500.0,
        policyholder_tenure_years=4.0
    )
    violations, penalty = InsuranceRulesEngine.evaluate_rules(claim)
    rule_ids = [v.rule_id for v in violations]
    assert "INS_RULE_005_EXTREME_FILING_DELAY" in rule_ids

def test_serial_claimant_frequency_rule():
    claim = ClaimInputSchema(
        claim_id="CLM-FREQ-01",
        previous_claims_count=4,  # >= 3
        policyholder_tenure_years=2.0
    )
    violations, penalty = InsuranceRulesEngine.evaluate_rules(claim)
    rule_ids = [v.rule_id for v in violations]
    assert "INS_RULE_004_SERIAL_CLAIMANT" in rule_ids
