import os
from pathlib import Path
from typing import Dict, Any, Optional
from src.config import (
    LAYA_MODEL_DIR,
    LAYA_MODEL_ID,
    LAYA_DEFAULT_SUBFOLDER,
    LAYA_DEVICE,
    LAYA_FALLBACK_MOCK
)
from src.decision.schemas import LayaModelOutput, TriageDecision, EvidenceSufficiency, InvestigationPriority
from src.utils.logger import get_logger

logger = get_logger("LayaModel")

class LayaInsuranceModel:
    """
    Manages loading and local inference of the convaiinnovations/laya model.
    Includes typed insurance decision questions and an insurance-calibrated
    fallback baseline when weights are not present locally.
    """

    # Official Typed Decision Questions for Insurance Triage
    INSURANCE_QUESTIONS = {
        "claim_triage": {
            "type": "choice",
            "instructions": "How should this insurance claim be routed for adjudication and fraud risk triage?",
            "criteria": {
                "fast_track": "Low complexity, routine loss, established customer tenure, clear evidence, eligible for immediate settlement",
                "standard_adjudication": "Standard claim requiring normal claims adjuster evaluation and routine documentation review",
                "complex_or_siu": "Suspicious circumstances, severe financial asymmetry, brand new policy with outsized loss, or potential fraud requiring SIU investigation"
            }
        },
        "evidence_sufficiency": {
            "type": "choice",
            "instructions": "Is the supplied documentation, repair estimates, and accident narrative sufficient to settle?",
            "criteria": {
                "sufficient": "All required estimates, dates, and loss receipts are present and corroborating",
                "incomplete": "Missing crucial repair estimates, official reports, proof of loss, or unsupported amounts",
                "contradictory": "Supplied documentation or narrative directly conflicts with physical facts, timeline, or claimed amount"
            }
        },
        "investigation_priority": {
            "type": "score",
            "instructions": "Rate the investigative scrutiny priority of this insurance claim",
            "criteria": ["routine", "elevated", "urgent_high_risk"]
        }
    }

    def __init__(
        self,
        model_dir: Optional[Path] = None,
        device: str = LAYA_DEVICE,
        use_fallback_mock: bool = LAYA_FALLBACK_MOCK
    ):
        self.model_dir = model_dir or LAYA_MODEL_DIR
        self.device = device
        self.force_mock = use_fallback_mock
        self._router = None
        self._is_loaded = False
        self._load_status_message = "Uninitialized"

        # Attempt local loading if mock is not forced
        if not self.force_mock:
            self._initialize_router()

    def _initialize_router(self):
        """
        Attempts to load the local LAYA Router if local weights exist.
        Otherwise defers to calibrated insurance baseline fallback to prevent
        network blocking on startup or inference.
        """
        try:
            # Check if weights exist locally in model_dir
            local_weights_exist = False
            if self.model_dir.exists():
                safetensors = list(self.model_dir.glob("**/*.safetensors"))
                if safetensors:
                    local_weights_exist = True
                    logger.info(f"Detected {len(safetensors)} local safetensors in {self.model_dir}")

            if not local_weights_exist:
                self._is_loaded = False
                self._load_status_message = (
                    f"Local weights not found in {self.model_dir}. "
                    "Run 'python scripts/download_laya.py' to download. "
                    "Operating in calibrated insurance fallback mode."
                )
                logger.info(self._load_status_message)
                return

            from laya import Router
            os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "0"
            logger.info(f"Initializing Laya Router from local directory {self.model_dir} (device={self.device})...")

            models_config = {
                "typed-decisions": (str(self.model_dir), "typed-decisions"),
                "english": (str(self.model_dir), None)
            }
            self._router = Router(
                models=models_config,
                device=self.device,
                default="typed-decisions" if LAYA_DEFAULT_SUBFOLDER == "typed-decisions" else "english"
            )
            self._is_loaded = True
            self._load_status_message = f"Loaded {LAYA_MODEL_ID} from local path {self.model_dir} on {self.device}"
            logger.info("LAYA Router successfully initialized.")
        except Exception as e:
            self._is_loaded = False
            self._load_status_message = f"Local model load deferred / unavailable: {e}"
            logger.warning(f"{self._load_status_message}. Activating calibrated insurance baseline fallback.")

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded and (self._router is not None)

    @property
    def status_message(self) -> str:
        return self._load_status_message

    def predict_decisions(self, state_text: str, features: Dict[str, Any]) -> LayaModelOutput:
        """
        Evaluates the claim state against typed insurance decision questions.
        If real weights are unavailable, provides calibrated baseline outputs.
        """
        if self.is_loaded and not self.force_mock:
            try:
                # Call official LAYA Router interface
                res = self._router.predict(
                    state=state_text,
                    questions=self.INSURANCE_QUESTIONS,
                    model="typed-decisions"
                )
                answers = res.get("answers", {})
                
                triage_ans = answers.get("claim_triage", {})
                evid_ans = answers.get("evidence_sufficiency", {})
                inv_ans = answers.get("investigation_priority", {})

                return LayaModelOutput(
                    triage_choice=triage_ans.get("choice", "standard_adjudication"),
                    triage_confidence=float(triage_ans.get("confidence", 0.75)),
                    evidence_choice=evid_ans.get("choice", "sufficient"),
                    evidence_confidence=float(evid_ans.get("confidence", 0.80)),
                    investigation_priority=inv_ans.get("choice", "routine"),
                    investigation_confidence=float(inv_ans.get("confidence", 0.70)),
                    raw_answers=answers,
                    is_mock=False,
                    model_identifier=LAYA_MODEL_ID
                )
            except Exception as e:
                logger.error(f"Inference error with local LAYA model: {e}. Falling back to baseline.")

        # Fallback: Insurance-Calibrated Baseline (clearly tagged is_mock=True)
        return self._evaluate_insurance_baseline(features)

    def _evaluate_insurance_baseline(self, features: Dict[str, Any]) -> LayaModelOutput:
        """
        Domain-calibrated insurance decision fallback when heavy neural weights
        are not loaded or running in resource-constrained test mode.
        """
        claim_amt = features.get("claim_amount", 5000.0)
        tenure = features.get("policyholder_tenure_years", 2.0)
        ded = max(features.get("deductible", 500.0), 1.0)
        ratio = claim_amt / ded
        delay = features.get("filing_delay_days", 2)
        has_police = features.get("has_police_report", 1)
        docs_count = features.get("supporting_docs_count", 2)

        # 1. Triage decision
        if (tenure < 1.0 and claim_amt > 15000.0) or ratio > 30.0:
            triage = "complex_or_siu"
            triage_conf = 0.84
            priority = "urgent_high_risk"
            priority_conf = 0.86
        elif claim_amt < 3000.0 and tenure >= 1.0 and has_police and ratio < 10.0:
            triage = "fast_track"
            triage_conf = 0.88
            priority = "routine"
            priority_conf = 0.90
        else:
            triage = "standard_adjudication"
            triage_conf = 0.78
            priority = "elevated" if (claim_amt > 10000.0 or delay > 30) else "routine"
            priority_conf = 0.75

        # 2. Evidence sufficiency
        if delay < 0 or (claim_amt > 25000.0 and has_police == 0):
            evid = "contradictory"
            evid_conf = 0.85
        elif docs_count == 0 or (claim_amt > 10000.0 and has_police == 0):
            evid = "incomplete"
            evid_conf = 0.82
        else:
            evid = "sufficient"
            evid_conf = 0.89

        return LayaModelOutput(
            triage_choice=triage,
            triage_confidence=triage_conf,
            evidence_choice=evid,
            evidence_confidence=evid_conf,
            investigation_priority=priority,
            investigation_confidence=priority_conf,
            raw_answers={
                "claim_triage": {"choice": triage, "confidence": triage_conf},
                "evidence_sufficiency": {"choice": evid, "confidence": evid_conf},
                "investigation_priority": {"choice": priority, "confidence": priority_conf}
            },
            is_mock=True,
            model_identifier=f"{LAYA_MODEL_ID} (calibrated_baseline_fallback)"
        )
