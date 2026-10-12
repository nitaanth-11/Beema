from typing import Dict, Any, Optional
from datetime import datetime, date
import math
import polars as pl
from src.config import DELTA_TABLE_MODEL_READY
from src.decision.schemas import ClaimInputSchema
from src.utils.logger import get_logger

logger = get_logger("DecisionFeatureEngineering")

class DecisionFeatureTransformer:
    """
    Transforms Lakehouse Gold table records or API Claim inputs into
    structured feature vectors and textual state representations for LAYA.
    """

    @classmethod
    def transform_input(cls, claim: ClaimInputSchema) -> Dict[str, Any]:
        """
        Extracts numeric ratios and formats the claim narrative context.
        """
        # 1. Temporal calculation
        inc_date = cls._parse_date(claim.incident_date)
        file_date = cls._parse_date(claim.claim_filed_date)
        delay_days = (file_date - inc_date).days if (inc_date and file_date) else 0

        # 2. Exposure ratios
        ded_safe = max(claim.deductible, 1.0)
        claim_to_ded = round(claim.claim_amount / ded_safe, 2)
        log_amount = round(math.log1p(max(claim.claim_amount, 0.0)), 4)

        # 3. Tenure & velocity
        is_new_policyholder = 1 if claim.policyholder_tenure_years < 1.0 else 0
        claim_velocity = round(claim.previous_claims_count / (claim.policyholder_tenure_years + 0.1), 2)
        new_policy_high_claim = 1 if (is_new_policyholder == 1 and claim.claim_amount > 15000.0) else 0

        # 4. Synthesize comprehensive context state for LAYA
        doc_count = claim.supporting_documents_count or 0
        police_status = "Available" if claim.police_report_available else "Not Available"
        estimate_str = f"${claim.repair_estimate_amount:,.2f}" if claim.repair_estimate_amount else "None"
        narrative_str = claim.claim_description or "No description provided."
        police_narrative = claim.police_report_summary or "No police narrative."

        state_text = (
            f"INSURANCE CLAIM DOSSIER:\n"
            f"- Claim ID: {claim.claim_id} | Policy ID: {claim.policy_id}\n"
            f"- Line of Insurance: {claim.claim_type.upper()} | Jurisdiction/State: {claim.state}\n"
            f"- Financial Exposure: Claimed Amount = ${claim.claim_amount:,.2f} | Deductible = ${claim.deductible:,.2f} "
            f"(Loss Multiplier: {claim_to_ded}x)\n"
            f"- Policyholder Profile: Tenure = {claim.policyholder_tenure_years:.1f} years | Historical Claims = {claim.previous_claims_count} "
            f"({'NEW POLICYHOLDER RISK' if is_new_policyholder else 'Established Customer'})\n"
            f"- Filing Timeline: Incident Date = {claim.incident_date} | Claim Filed Date = {claim.claim_filed_date} "
            f"(Reporting Latency: {delay_days} days)\n"
            f"- Documented Evidence: Official Police Report = {police_status} | Repair Estimate = {estimate_str} | "
            f"Attached Files = {doc_count} documents\n"
            f"- Claimant Incident Description: \"{narrative_str}\"\n"
            f"- Official Investigation Notes: \"{police_narrative}\""
        )

        features = {
            "claim_id": claim.claim_id,
            "claim_amount": claim.claim_amount,
            "deductible": claim.deductible,
            "claim_to_deductible_ratio": claim_to_ded,
            "log_claim_amount": log_amount,
            "policyholder_tenure_years": claim.policyholder_tenure_years,
            "is_new_policyholder": is_new_policyholder,
            "previous_claims_count": claim.previous_claims_count,
            "claim_velocity": claim_velocity,
            "new_policy_high_claim": new_policy_high_claim,
            "filing_delay_days": delay_days,
            "has_police_report": 1 if claim.police_report_available else 0,
            "supporting_docs_count": doc_count,
            "state_text": state_text
        }
        return features

    @classmethod
    def load_from_lakehouse(cls, claim_id: str) -> Optional[ClaimInputSchema]:
        """
        Fetches an existing claim record from the Gold Feature Store or Silver Cleaned table.
        """
        table_path = str(DELTA_TABLE_MODEL_READY).replace("\\", "/")
        try:
            df = pl.read_delta(table_path)
            matching = df.filter(pl.col("claim_id") == claim_id.strip())
            if len(matching) == 0:
                logger.warning(f"Claim ID '{claim_id}' not found in Gold Feature Store.")
                return None
            
            row = matching.to_dicts()[0]
            claim = ClaimInputSchema(
                claim_id=str(row.get("claim_id")),
                policy_id=str(row.get("policy_id", "POL-UNKNOWN")),
                claim_type=str(row.get("claim_type", "auto")),
                state=str(row.get("state", "CA")),
                policyholder_tenure_years=float(row.get("policyholder_tenure_years", 1.0)),
                previous_claims_count=int(row.get("previous_claims_count", 0)),
                incident_date=str(row.get("incident_date", "2024-01-01")),
                claim_filed_date=str(row.get("claim_filed_date", "2024-01-02")),
                claim_amount=float(row.get("claim_amount", 5000.0)),
                deductible=float(row.get("deductible", 500.0)),
                claim_status=str(row.get("claim_status", "pending")),
                claim_description=f"Standard claim filed for {row.get('claim_type')} loss.",
                police_report_available=True if float(row.get("claim_amount", 0)) < 15000.0 else False,
                repair_estimate_amount=float(row.get("claim_amount", 5000.0)) * 0.95,
                supporting_documents_count=2
            )
            return claim
        except Exception as e:
            logger.error(f"Error querying Lakehouse for claim {claim_id}: {e}")
            return None

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
