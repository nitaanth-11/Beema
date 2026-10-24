from datetime import datetime, date
from typing import List, Tuple, Dict, Any
from src.decision.schemas import ClaimInputSchema, RuleViolation
from src.utils.logger import get_logger

logger = get_logger("RulesEngine")

class InsuranceRulesEngine:
    """
    Deterministic insurance validation and policy verification rules.
    Evaluates policy constraints, timing bounds, and objective red flags.
    """

    @classmethod
    def evaluate_rules(cls, claim: ClaimInputSchema) -> Tuple[List[RuleViolation], float]:
        """
        Evaluates a claim against deterministic insurance rules.
        
        Returns:
            Tuple of (triggered_violations_list, cumulative_penalty_score)
        """
        violations: List[RuleViolation] = []
        cumulative_penalty = 0.0

        # Parse dates
        inc_date = cls._parse_date(claim.incident_date)
        file_date = cls._parse_date(claim.claim_filed_date)

        # Rule 1: Below Deductible Claim
        if claim.claim_amount <= claim.deductible:
            violations.append(RuleViolation(
                rule_id="INS_RULE_001_BELOW_DEDUCTIBLE",
                rule_name="Claim Payout Below Deductible",
                severity="HIGH",
                description=(
                    f"Claimed amount (₹{claim.claim_amount:,.2f}) is less than or equal to "
                    f"policy deductible (₹{claim.deductible:,.2f}). Loss is completely self-insured."
                )
            ))
            cumulative_penalty += 0.25

        # Rule 2: Inception Latency / New Policy Outsized Claim
        # Core insurance red flag: newly opened policy (< 1 yr) immediately filing > ₹5,00,000
        if claim.policyholder_tenure_years < 1.0 and claim.claim_amount > 500000.0:
            severity = "CRITICAL" if claim.policyholder_tenure_years < 0.25 else "HIGH"
            violations.append(RuleViolation(
                rule_id="INS_RULE_002_NEW_POLICY_HIGH_EXPOSURE",
                rule_name="New Policyholder Outsized Loss",
                severity=severity,
                description=(
                    f"Policyholder tenure is only {claim.policyholder_tenure_years:.2f} years, "
                    f"but filing an outsized claim of ₹{claim.claim_amount:,.2f}."
                )
            ))
            cumulative_penalty += 0.35 if severity == "CRITICAL" else 0.25

        # Rule 3: Extreme Claim-to-Deductible Ratio
        ded_denom = max(claim.deductible, 1.0)
        ratio = claim.claim_amount / ded_denom
        if ratio > 35.0:
            violations.append(RuleViolation(
                rule_id="INS_RULE_003_EXTREME_DEDUCTIBLE_RATIO",
                rule_name="Excessive Loss to Deductible Ratio",
                severity="MEDIUM",
                description=(
                    f"Claim payout represents a {ratio:.1f}x multiple of the policy deductible. "
                    f"High exposure asymmetry relative to policyholder retention."
                )
            ))
            cumulative_penalty += 0.15

        # Rule 4: Serial / Habitual Claimant Frequency
        if claim.previous_claims_count >= 3:
            violations.append(RuleViolation(
                rule_id="INS_RULE_004_SERIAL_CLAIMANT",
                rule_name="Habitual Claims Frequency",
                severity="HIGH",
                description=(
                    f"Policyholder has {claim.previous_claims_count} prior claims on record. "
                    f"Loss frequency exceeds underwriting baseline thresholds."
                )
            ))
            cumulative_penalty += 0.20

        # Rule 5: Filing Delay Without Immediate Reporting
        if inc_date and file_date:
            delay_days = (file_date - inc_date).days
            if delay_days > 45:
                violations.append(RuleViolation(
                    rule_id="INS_RULE_005_EXTREME_FILING_DELAY",
                    rule_name="Delayed Loss Notification",
                    severity="MEDIUM",
                    description=(
                        f"Claim was submitted {delay_days} days after the alleged incident date. "
                        f"Exceeds standard 30-day reporting window."
                    )
                ))
                cumulative_penalty += 0.15

        # Rule 6: High Value Claim Missing Corroborating Police/Official Report
        if claim.claim_type == "auto" and claim.claim_amount > 200000.0:
            if claim.police_report_available is False:
                violations.append(RuleViolation(
                    rule_id="INS_RULE_006_HIGH_VALUE_NO_POLICE_REPORT",
                    rule_name="Major Auto Loss Without Police Report",
                    severity="HIGH",
                    description=(
                        f"Major automobile casualty loss (₹{claim.claim_amount:,.2f}) reported "
                        f"with no official police accident report on file."
                    )
                ))
                cumulative_penalty += 0.20

        # Cap cumulative penalty at 1.0
        final_penalty = round(min(cumulative_penalty, 1.0), 4)
        logger.info(
            f"Rules evaluation completed for claim {claim.claim_id}: "
            f"{len(violations)} rule violations triggered (penalty score: {final_penalty})."
        )
        return violations, final_penalty

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
