from typing import List, Tuple, Any
from datetime import datetime, date
from src.decision.schemas import ClaimInputSchema, DiscrepancyFinding
from src.utils.logger import get_logger

logger = get_logger("ConsistencyChecker")

class ClaimConsistencyChecker:
    """
    Identifies logical contradictions, financial discrepancies, and evidentiary
    gaps between claimed facts and supplied documentation.
    """

    @classmethod
    def check_consistency(cls, claim: ClaimInputSchema) -> Tuple[List[DiscrepancyFinding], float]:
        """
        Runs comprehensive consistency audits.
        
        Returns:
            Tuple of (discrepancies_found, discrepancy_penalty_score)
        """
        findings: List[DiscrepancyFinding] = []
        score = 0.0

        # 1. Financial Estimate vs Claimed Amount Discrepancy
        if claim.repair_estimate_amount is not None and claim.repair_estimate_amount > 0:
            diff_pct = (claim.claim_amount - claim.repair_estimate_amount) / claim.repair_estimate_amount
            if diff_pct > 0.25:
                findings.append(DiscrepancyFinding(
                    check_name="ESTIMATE_CLAIM_INFLATION",
                    discrepancy_type="AMOUNT_MISMATCH",
                    severity="HIGH" if diff_pct > 0.50 else "MEDIUM",
                    details=(
                        f"Claimed payout (${claim.claim_amount:,.2f}) exceeds independent "
                        f"repair estimate (${claim.repair_estimate_amount:,.2f}) by {diff_pct*100:.1f}%."
                    )
                ))
                score += 0.30 if diff_pct > 0.50 else 0.15

        # 2. Date Sequence & Temporal Causality
        inc_date = cls._parse_date(claim.incident_date)
        file_date = cls._parse_date(claim.claim_filed_date)
        if inc_date and file_date:
            if file_date < inc_date:
                findings.append(DiscrepancyFinding(
                    check_name="TEMPORAL_CAUSALITY_VIOLATION",
                    discrepancy_type="DATE_CONFLICT",
                    severity="CRITICAL",
                    details=(
                        f"Claim filed date ({claim.claim_filed_date}) precedes the alleged "
                        f"incident occurrence date ({claim.incident_date}). Physically impossible sequence."
                    )
                ))
                score += 0.50

        # 3. Narrative vs Claim Line Cross-Check
        if claim.claim_description:
            desc_lower = claim.claim_description.lower()
            
            # Auto collision keywords in property claim
            auto_keywords = ["vehicle", "car", "driver", "bumper", "rear-ended", "traffic", "collision", "airbag", "fender"]
            property_keywords = ["roof", "leak", "pipe", "basement", "burglary", "tenant", "water damage", "appliance"]

            if claim.claim_type in ["home", "renters", "property"]:
                if any(k in desc_lower for k in ["rear-ended", "traffic accident", "fender bender", "drove into"]):
                    findings.append(DiscrepancyFinding(
                        check_name="LINE_OF_BUSINESS_NARRATIVE_MISMATCH",
                        discrepancy_type="COVERAGE_CONFLICT",
                        severity="HIGH",
                        details=(
                            f"Claim type is registered as '{claim.claim_type}', but claimant incident "
                            f"narrative describes a motor vehicle collision."
                        )
                    ))
                    score += 0.35

            if claim.claim_type == "auto":
                if any(k in desc_lower for k in ["basement flooded", "burst water pipe", "roof leak in living room"]):
                    findings.append(DiscrepancyFinding(
                        check_name="LINE_OF_BUSINESS_NARRATIVE_MISMATCH",
                        discrepancy_type="COVERAGE_CONFLICT",
                        severity="HIGH",
                        details=(
                            f"Claim type is registered as 'auto', but incident narrative "
                            f"describes residential structural/water damage."
                        )
                    ))
                    score += 0.35

        # 4. Evidence Sufficiency Gap for Sizable Loss
        if claim.claim_amount > 15000.0:
            doc_count = claim.supporting_documents_count or 0
            if doc_count == 0:
                findings.append(DiscrepancyFinding(
                    check_name="SUBSTANTIAL_LOSS_ZERO_DOCUMENTATION",
                    discrepancy_type="CORROBORATION_GAP",
                    severity="MEDIUM",
                    details=(
                        f"Claim amount of ${claim.claim_amount:,.2f} submitted with zero "
                        f"attached invoices, photos, or corroborating documentation."
                    )
                ))
                score += 0.20

        final_score = round(min(score, 1.0), 4)
        logger.info(
            f"Consistency audit completed for claim {claim.claim_id}: "
            f"{len(findings)} discrepancies detected (penalty score: {final_score})."
        )
        return findings, final_score

    @staticmethod
    def _parse_date(date_val: Any) -> Any:
        if isinstance(date_val, date):
            return date_val
        if isinstance(date_val, str) and date_val.strip():
            try:
                return datetime.strptime(date_val[:10], "%Y-%m-%d").date()
            except Exception:
                return None
        return None
