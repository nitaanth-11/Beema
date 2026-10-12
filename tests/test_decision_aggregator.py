import pytest
from src.decision.schemas import (
    RuleViolation,
    DiscrepancyFinding,
    LayaModelOutput,
    TriageDecision,
    EvidenceSufficiency,
    InvestigationPriority,
    FinalActionRecommendation
)
from src.decision.decision_aggregator import DecisionAggregator

def test_fast_track_adjudication():
    model_output = LayaModelOutput(
        triage_choice="fast_track",
        triage_confidence=0.92,
        evidence_choice="sufficient",
        evidence_confidence=0.95,
        investigation_priority="routine",
        investigation_confidence=0.90,
        is_mock=True
    )
    decision = DecisionAggregator.aggregate_decision(
        claim_id="CLM-FAST-01",
        rules_violations=[],
        rules_penalty=0.0,
        discrepancies=[],
        discrepancy_penalty=0.0,
        model_output=model_output,
        features={"claim_amount": 1500.0}
    )
    assert decision.final_recommendation == FinalActionRecommendation.FAST_TRACK_PAYOUT
    assert decision.triage_tier == TriageDecision.FAST_TRACK
    assert decision.composite_risk_score < 0.15

def test_missing_evidence_does_not_label_fraud():
    """
    Critical specification requirement:
    Do not label a claim fraudulent or recommend denial solely because of an anomaly or missing document.
    """
    model_output = LayaModelOutput(
        triage_choice="standard_adjudication",
        triage_confidence=0.80,
        evidence_choice="incomplete",
        evidence_confidence=0.85,
        investigation_priority="elevated",
        investigation_confidence=0.75,
        is_mock=True
    )
    discrepancy = DiscrepancyFinding(
        check_name="SUBSTANTIAL_LOSS_ZERO_DOCUMENTATION",
        discrepancy_type="CORROBORATION_GAP",
        severity="MEDIUM",
        details="Attached documentation is missing."
    )
    decision = DecisionAggregator.aggregate_decision(
        claim_id="CLM-INCOMP-01",
        rules_violations=[],
        rules_penalty=0.0,
        discrepancies=[discrepancy],
        discrepancy_penalty=0.20,
        model_output=model_output,
        features={"claim_amount": 18000.0}
    )
    # Must recommend requesting additional evidence, NOT fraud!
    assert decision.final_recommendation == FinalActionRecommendation.REQUEST_ADDITIONAL_EVIDENCE
    assert decision.evidence_sufficiency == EvidenceSufficiency.INCOMPLETE
    assert "fraud" not in decision.final_recommendation.value.lower()

def test_critical_violations_route_to_siu():
    model_output = LayaModelOutput(
        triage_choice="complex_or_siu",
        triage_confidence=0.88,
        evidence_choice="contradictory",
        evidence_confidence=0.90,
        investigation_priority="urgent_high_risk",
        investigation_confidence=0.85,
        is_mock=True
    )
    rule = RuleViolation(
        rule_id="INS_RULE_002_NEW_POLICY_HIGH_EXPOSURE",
        rule_name="New Policyholder Outsized Loss",
        severity="CRITICAL",
        description="Tenure < 0.25 years with $120,000 claim."
    )
    discrepancy = DiscrepancyFinding(
        check_name="TEMPORAL_CAUSALITY_VIOLATION",
        discrepancy_type="DATE_CONFLICT",
        severity="CRITICAL",
        details="Filed before incident date."
    )
    decision = DecisionAggregator.aggregate_decision(
        claim_id="CLM-FRAUD-01",
        rules_violations=[rule],
        rules_penalty=0.45,
        discrepancies=[discrepancy],
        discrepancy_penalty=0.50,
        model_output=model_output,
        features={"claim_amount": 120000.0}
    )
    assert decision.final_recommendation == FinalActionRecommendation.SIU_FRAUD_INVESTIGATION
    assert decision.investigation_priority == InvestigationPriority.URGENT_HIGH_RISK
    assert decision.composite_risk_score > 0.50
