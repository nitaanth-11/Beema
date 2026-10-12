from typing import Optional
from src.decision.schemas import ClaimInputSchema, DecisionResponse
from src.decision.rules_engine import InsuranceRulesEngine
from src.decision.consistency_checker import ClaimConsistencyChecker
from src.decision.feature_engineering import DecisionFeatureTransformer
from src.decision.laya_model import LayaInsuranceModel
from src.decision.decision_aggregator import DecisionAggregator
from src.utils.logger import get_logger

logger = get_logger("DecisionService")

class LayaInsuranceDecisionService:
    """
    Unified entry point for the Beema Insurance Decision Engine.
    Orchestrates feature preparation, deterministic checks, LAYA model inference,
    and decision synthesis.
    """

    def __init__(self, laya_model: Optional[LayaInsuranceModel] = None):
        self.laya_model = laya_model or LayaInsuranceModel()

    def evaluate_claim(self, claim: ClaimInputSchema) -> DecisionResponse:
        """
        Evaluates a raw or structured claim payload through all decision layers.
        """
        logger.info(f"Initiating decision evaluation for claim {claim.claim_id}...")

        # 1. Feature Engineering & State Synthesis
        features = DecisionFeatureTransformer.transform_input(claim)
        state_text = features["state_text"]

        # 2. Deterministic Insurance Policy Rules
        rules_violations, rules_penalty = InsuranceRulesEngine.evaluate_rules(claim)

        # 3. Evidence Consistency Audit
        discrepancies, discrepancy_penalty = ClaimConsistencyChecker.check_consistency(claim)

        # 4. LAYA Model Inference (Local Model with Fallback)
        model_output = self.laya_model.predict_decisions(state_text, features)

        # 5. Synthesize Unified Decision
        decision = DecisionAggregator.aggregate_decision(
            claim_id=claim.claim_id or "UNKNOWN_CLAIM",
            rules_violations=rules_violations,
            rules_penalty=rules_penalty,
            discrepancies=discrepancies,
            discrepancy_penalty=discrepancy_penalty,
            model_output=model_output,
            features=features
        )

        return decision

    def evaluate_from_lakehouse(self, claim_id: str) -> DecisionResponse:
        """
        Retrieves a claim from the Medallion Feature Store / Delta Table and evaluates it.
        """
        logger.info(f"Evaluating claim from Lakehouse: {claim_id}...")
        claim = DecisionFeatureTransformer.load_from_lakehouse(claim_id)
        if not claim:
            raise ValueError(f"Claim ID '{claim_id}' not found in the Lakehouse Gold feature store.")
        return self.evaluate_claim(claim)

    def get_health_status(self) -> dict:
        return {
            "model_loaded": self.laya_model._is_loaded,
            "active_checkpoint": str(getattr(self.laya_model, "model_dir", "laya-insurance")),
            "using_fallback_mock": getattr(self.laya_model, "force_mock", False) or not self.laya_model._is_loaded,
            "lakehouse_connected": True,
            "device": getattr(self.laya_model, "device", "cpu")
        }
