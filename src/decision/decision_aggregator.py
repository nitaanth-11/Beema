from typing import List, Dict, Any, Tuple
from src.decision.schemas import (
    RuleViolation,
    DiscrepancyFinding,
    LayaModelOutput,
    TriageDecision,
    EvidenceSufficiency,
    InvestigationPriority,
    FinalActionRecommendation,
    DecisionResponse
)
from src.config import get_utc_timestamp
from src.utils.logger import get_logger

logger = get_logger("DecisionAggregator")

class DecisionAggregator:
    """
    Synthesizes deterministic rule checks, evidence consistency audits,
    and LAYA model outputs into a calibrated, explainable insurance decision.
    """

    @classmethod
    def aggregate_decision(
        cls,
        claim_id: str,
        rules_violations: List[RuleViolation],
        rules_penalty: float,
        discrepancies: List[DiscrepancyFinding],
        discrepancy_penalty: float,
        model_output: LayaModelOutput,
        features: Dict[str, Any]
    ) -> DecisionResponse:
        """
        Combines all decision signals into a final structured adjudication verdict.
        """
        # 1. Map model strings to Enum values safely
        triage_tier = cls._map_triage_enum(model_output.triage_choice)
        evidence_sufficiency = cls._map_evidence_enum(model_output.evidence_choice)
        investigation_priority = cls._map_priority_enum(model_output.investigation_priority)

        # 2. Check for Critical Rule Triggers
        has_critical_rule = any(r.severity == "CRITICAL" for r in rules_violations)
        has_critical_discrepancy = any(d.severity == "CRITICAL" for d in discrepancies)
        has_missing_evidence_only = (
            len(rules_violations) == 0 and
            len(discrepancies) > 0 and
            all(d.discrepancy_type == "CORROBORATION_GAP" for d in discrepancies)
        )

        # 3. Model score contribution
        if triage_tier == TriageDecision.COMPLEX_OR_SIU:
            model_risk_score = max(model_output.triage_confidence, 0.75)
        elif triage_tier == TriageDecision.STANDARD_ADJUDICATION:
            model_risk_score = 0.30
        else:
            model_risk_score = 0.05

        # 4. Composite Risk Score Synthesis
        # Weighting: 40% Rules + 35% Discrepancies + 25% Model
        raw_composite = (0.40 * rules_penalty) + (0.35 * discrepancy_penalty) + (0.25 * model_risk_score)
        composite_score = round(min(max(raw_composite, 0.0), 1.0), 4)

        # 5. Adjudication Action Decision Matrix
        # Principle: Never label fraud solely because of missing documentation
        if has_critical_rule or has_critical_discrepancy or (composite_score >= 0.55):
            recommendation = FinalActionRecommendation.SIU_FRAUD_INVESTIGATION
            investigation_priority = InvestigationPriority.URGENT_HIGH_RISK
            summary = (
                f"Escalated to SIU Investigation (Risk Score: {composite_score:.2f}). "
                f"Severe flags detected: {len(rules_violations)} policy rule violations and "
                f"{len(discrepancies)} evidential discrepancies."
            )
        elif has_missing_evidence_only or evidence_sufficiency == EvidenceSufficiency.INCOMPLETE:
            recommendation = FinalActionRecommendation.REQUEST_ADDITIONAL_EVIDENCE
            if investigation_priority == InvestigationPriority.URGENT_HIGH_RISK:
                investigation_priority = InvestigationPriority.ELEVATED
            summary = (
                f"Suspended pending documentation (Risk Score: {composite_score:.2f}). "
                f"Claim cannot be finalized due to missing corroborating records or estimates. "
                f"No confirmed fraud signal present."
            )
        elif (
            triage_tier == TriageDecision.FAST_TRACK and 
            len(rules_violations) == 0 and 
            len(discrepancies) == 0 and 
            composite_score < 0.20
        ):
            recommendation = FinalActionRecommendation.FAST_TRACK_PAYOUT
            investigation_priority = InvestigationPriority.ROUTINE
            summary = (
                f"Approved for Automated Fast-Track Settlement (Risk Score: {composite_score:.2f}). "
                f"Zero policy violations, clear corroboration, and established customer tenure."
            )
        else:
            recommendation = FinalActionRecommendation.STANDARD_ADJUDICATION
            summary = (
                f"Assigned for Standard Claims Adjuster Adjudication (Risk Score: {composite_score:.2f}). "
                f"Routine complexity with normal claims review cycle."
            )

        logger.info(
            f"Final decision for claim {claim_id}: {recommendation.value} "
            f"(Score: {composite_score:.4f}, Triage: {triage_tier.value})"
        )

        return DecisionResponse(
            claim_id=claim_id,
            final_recommendation=recommendation,
            triage_tier=triage_tier,
            investigation_priority=investigation_priority,
            evidence_sufficiency=evidence_sufficiency,
            composite_risk_score=composite_score,
            decision_summary=summary,
            rules_triggered=rules_violations,
            evidence_discrepancies=discrepancies,
            laya_model_output=model_output,
            features_analyzed={
                k: v for k, v in features.items() if k != "state_text"
            },
            evaluation_timestamp=get_utc_timestamp(),
            engine_version="v1.0.0"
        )

    @staticmethod
    def _map_triage_enum(val: str) -> TriageDecision:
        v = val.lower().strip()
        if "fast" in v:
            return TriageDecision.FAST_TRACK
        if "siu" in v or "complex" in v:
            return TriageDecision.COMPLEX_OR_SIU
        return TriageDecision.STANDARD_ADJUDICATION

    @staticmethod
    def _map_evidence_enum(val: str) -> EvidenceSufficiency:
        v = val.lower().strip()
        if "contradict" in v:
            return EvidenceSufficiency.CONTRADICTORY
        if "incomplet" in v:
            return EvidenceSufficiency.INCOMPLETE
        return EvidenceSufficiency.SUFFICIENT

    @staticmethod
    def _map_priority_enum(val: str) -> InvestigationPriority:
        v = val.lower().strip()
        if "urgent" in v or "high" in v:
            return InvestigationPriority.URGENT_HIGH_RISK
        if "elevat" in v:
            return InvestigationPriority.ELEVATED
        return InvestigationPriority.ROUTINE
