import pytest
from src.decision.schemas import ClaimInputSchema
from src.decision.consistency_checker import ClaimConsistencyChecker

def test_consistent_claim_has_zero_discrepancies():
    claim = ClaimInputSchema(
        claim_id="CLM-CONS-01",
        claim_type="auto",
        incident_date="2024-05-10",
        claim_filed_date="2024-05-12",
        claim_amount=4000.0,
        repair_estimate_amount=3900.0,
        claim_description="Front bumper damage from minor collision with guardrail.",
        supporting_documents_count=2
    )
    findings, score = ClaimConsistencyChecker.check_consistency(claim)
    assert len(findings) == 0
    assert score == 0.0

def test_estimate_claim_inflation_discrepancy():
    claim = ClaimInputSchema(
        claim_id="CLM-INFL-01",
        claim_amount=12000.0,
        repair_estimate_amount=6000.0,  # 100% inflation over estimate
        incident_date="2024-05-10",
        claim_filed_date="2024-05-12"
    )
    findings, score = ClaimConsistencyChecker.check_consistency(claim)
    check_names = [f.check_name for f in findings]
    assert "ESTIMATE_CLAIM_INFLATION" in check_names
    assert score > 0.20

def test_temporal_causality_violation():
    claim = ClaimInputSchema(
        claim_id="CLM-TIME-01",
        incident_date="2024-06-15",
        claim_filed_date="2024-06-10"  # filed BEFORE incident!
    )
    findings, score = ClaimConsistencyChecker.check_consistency(claim)
    check_names = [f.check_name for f in findings]
    assert "TEMPORAL_CAUSALITY_VIOLATION" in check_names
    assert any(f.severity == "CRITICAL" for f in findings)
    assert score >= 0.50

def test_line_of_business_narrative_conflict():
    claim = ClaimInputSchema(
        claim_id="CLM-NARR-01",
        claim_type="home",
        claim_description="My car was rear-ended in a high-speed traffic accident on Interstate 95."
    )
    findings, score = ClaimConsistencyChecker.check_consistency(claim)
    check_names = [f.check_name for f in findings]
    assert "LINE_OF_BUSINESS_NARRATIVE_MISMATCH" in check_names
