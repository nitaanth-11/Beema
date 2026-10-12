from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ClaimType(str, Enum):
    AUTO = "auto"
    HOME = "home"
    RENTERS = "renters"
    PROPERTY = "property"
    BUSINESS = "business"

class TriageDecision(str, Enum):
    FAST_TRACK = "fast_track"
    STANDARD_ADJUDICATION = "standard_adjudication"
    COMPLEX_OR_SIU = "complex_or_siu"

class EvidenceSufficiency(str, Enum):
    SUFFICIENT = "sufficient"
    INCOMPLETE = "incomplete"
    CONTRADICTORY = "contradictory"

class InvestigationPriority(str, Enum):
    ROUTINE = "routine"
    ELEVATED = "elevated"
    URGENT_HIGH_RISK = "urgent_high_risk"

class FinalActionRecommendation(str, Enum):
    FAST_TRACK_PAYOUT = "FAST_TRACK_PAYOUT"
    STANDARD_ADJUDICATION = "STANDARD_ADJUDICATION"
    REQUEST_ADDITIONAL_EVIDENCE = "REQUEST_ADDITIONAL_EVIDENCE"
    SIU_FRAUD_INVESTIGATION = "SIU_FRAUD_INVESTIGATION"

class RuleViolation(BaseModel):
    rule_id: str
    rule_name: str
    severity: str = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL
    description: str

class DiscrepancyFinding(BaseModel):
    check_name: str
    discrepancy_type: str  # DATE_CONFLICT, AMOUNT_MISMATCH, COVERAGE_CONFLICT, CORROBORATION_GAP
    details: str
    severity: str = "MEDIUM"

class LayaModelOutput(BaseModel):
    triage_choice: str
    triage_confidence: float
    evidence_choice: str
    evidence_confidence: float
    investigation_priority: str
    investigation_confidence: float
    raw_answers: Dict[str, Any] = Field(default_factory=dict)
    is_mock: bool = False
    model_identifier: str = "convaiinnovations/laya"

class ClaimInputSchema(BaseModel):
    claim_id: Optional[str] = "CLM-TEST-0001"
    policy_id: Optional[str] = "POL-TEST-0001"
    claim_type: str = "auto"
    state: str = "CA"
    policyholder_tenure_years: float = 2.0
    previous_claims_count: int = 0
    incident_date: str = "2024-05-10"
    claim_filed_date: str = "2024-05-12"
    claim_amount: float = 4500.0
    deductible: float = 500.0
    claim_status: Optional[str] = "pending"
    
    # Evidence & narrative context
    claim_description: Optional[str] = (
        "Driver was rear-ended at a low speed intersection. Bumper damage and taillight cracked."
    )
    police_report_available: Optional[bool] = True
    police_report_summary: Optional[str] = (
        "Officer responded to two-vehicle collision. Rear vehicle cited for failure to yield. No injuries."
    )
    repair_estimate_amount: Optional[float] = 4200.0
    witness_present: Optional[bool] = False
    supporting_documents_count: Optional[int] = 3

class LakehouseClaimRequest(BaseModel):
    claim_id: str

class DecisionResponse(BaseModel):
    claim_id: str
    final_recommendation: FinalActionRecommendation
    triage_tier: TriageDecision
    investigation_priority: InvestigationPriority
    evidence_sufficiency: EvidenceSufficiency
    composite_risk_score: float = Field(..., ge=0.0, le=1.0)
    decision_summary: str
    rules_triggered: List[RuleViolation] = Field(default_factory=list)
    evidence_discrepancies: List[DiscrepancyFinding] = Field(default_factory=list)
    laya_model_output: LayaModelOutput
    features_analyzed: Dict[str, Any] = Field(default_factory=dict)
    evaluation_timestamp: str
    engine_version: str = "v1.0.0"

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_id: str
    checkpoint_subfolder: Optional[str]
    device: str
    using_fallback_mock: bool
    lakehouse_connected: bool
    timestamp: str
