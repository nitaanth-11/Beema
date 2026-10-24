from typing import Optional, List, Dict, Any
from src.vision.schemas import (
    VisualClaimRequest,
    VisualAssessmentResponse,
    VisualVerdict,
    DamageSeverityTier
)
from src.vision.quality_checker import ImageQualityChecker
from src.vision.damage_scorer import DamageScorer
from src.vision.fabrication_detector import FabricationDetector
from src.vision.cost_matcher import CostMatcher
from src.vision.session_tracker import session_tracker
from src.vision.synthetic_detector import SyntheticImageDetector
from src.config import get_utc_timestamp
from src.utils.logger import get_logger

logger = get_logger("VisualInsuranceAgent")

class VisualInsuranceAgent:
    """
    Dynamic Visual Agent for Real-Time Insurance Claim Damage Assessment.
    
    Capabilities:
    1. Evaluates image clarity & treatability ('An agent will look forward to your matter' if confused/blurry).
    2. Quantifies visual damage severity and calculates fair market repair cost brackets.
    3. Rejects claims immediately if the demanded compensation is massively inflated.
    4. Detects evident physical fabrication (e.g. storm claim showing manual sledgehammer/blunt tool destruction).
    5. Flags and rejects AI-generated / synthetic / diffusion images.
    6. Blocks claims after > 5 upload attempts without demand adjustment ('An employee will contact you.').
    7. Approves clean, corroborating claims for automated settlement.
    """

    CONFUSED_IMAGE_MESSAGE = "An agent will look forward to your matter."

    def __init__(self):
        logger.info("VisualInsuranceAgent initialized and active.")

    def assess_claim(self, request: VisualClaimRequest) -> VisualAssessmentResponse:
        """
        Orchestrates end-to-end visual assessment on an insurance claim.
        """
        claim_id = request.claim_id or "CLM-VIS-TMP"
        logger.info(f"Starting visual assessment for claim {claim_id} (Claimed: ${request.claimed_amount:,.2f}, Cause: {request.reported_cause})...")

        # Step 0: Anti-Tampering Check (Track upload attempts per claim)
        attempt_num, is_blocked, block_msg = session_tracker.record_attempt(
            claim_id=claim_id,
            claimed_amount=request.claimed_amount
        )
        if is_blocked:
            logger.warning(f"Claim {claim_id} blocked: {attempt_num} uploads without demand adjustment.")
            return VisualAssessmentResponse(
                claim_id=claim_id,
                verdict=VisualVerdict.BLOCKED_PERSISTENT_DEMAND,
                immediate_rejection=True,
                claimant_message=block_msg or "An employee will contact you.",
                visual_damage_tier=DamageSeverityTier.UNCERTAIN,
                estimated_cost_min=0.0,
                estimated_cost_max=0.0,
                claimed_amount=request.claimed_amount,
                cost_inflation_ratio=0.0,
                is_treatable=False,
                evident_flags=["EXCEEDED_UPLOAD_LIMIT_PERSISTENT_DEMAND"],
                fabrication_detected=True,
                is_synthetic_ai=False,
                synthetic_confidence=0.0,
                attempt_number=attempt_num,
                forensic_explanation="Claimant submitted more than 5 times without adjusting demanded compensation. Pipeline blocked; routed to Senior Adjuster.",
                timestamp=get_utc_timestamp()
            )

        # Step 1: Ingest Image
        img, load_err = ImageQualityChecker.load_image(
            image_path=request.image_path,
            image_base64=request.image_base64
        )
        if img is None:
            logger.warning(f"Image load failure for claim {claim_id}: {load_err}")
            return VisualAssessmentResponse(
                claim_id=claim_id,
                verdict=VisualVerdict.MANUAL_ADJUSTER_REVIEW,
                immediate_rejection=False,
                claimant_message=self.CONFUSED_IMAGE_MESSAGE,
                visual_damage_tier=DamageSeverityTier.UNCERTAIN,
                estimated_cost_min=0.0,
                estimated_cost_max=0.0,
                claimed_amount=request.claimed_amount,
                cost_inflation_ratio=0.0,
                is_treatable=False,
                evident_flags=[f"IMAGE_LOAD_ERROR: {load_err}"],
                fabrication_detected=False,
                is_synthetic_ai=False,
                synthetic_confidence=0.0,
                attempt_number=attempt_num,
                forensic_explanation="Image could not be decoded or file is missing. Routing to manual desk adjuster.",
                timestamp=get_utc_timestamp()
            )

        # Step 2: Quality & Treatability Assessment
        is_treatable, quality_flags, quality_msg = ImageQualityChecker.evaluate_quality(img)
        if not is_treatable:
            logger.info(f"Image for claim {claim_id} is confused or unresolvable: {quality_flags}")
            return VisualAssessmentResponse(
                claim_id=claim_id,
                verdict=VisualVerdict.MANUAL_ADJUSTER_REVIEW,
                immediate_rejection=False,
                claimant_message=self.CONFUSED_IMAGE_MESSAGE,
                visual_damage_tier=DamageSeverityTier.UNCERTAIN,
                estimated_cost_min=0.0,
                estimated_cost_max=0.0,
                claimed_amount=request.claimed_amount,
                cost_inflation_ratio=0.0,
                is_treatable=False,
                evident_flags=quality_flags,
                fabrication_detected=False,
                is_synthetic_ai=False,
                synthetic_confidence=0.0,
                attempt_number=attempt_num,
                forensic_explanation="Image quality is insufficient (blurry, dark, or underexposed) for automated scoring. Dispatched to human adjuster.",
                timestamp=get_utc_timestamp()
            )

        # Step 3: Synthetic / AI-Generated Image Forensic Audit
        is_synthetic, synth_conf, synth_flags, synth_exp = SyntheticImageDetector.detect_synthetic(img)
        if is_synthetic:
            rejection_msg = (
                "Your claim has been flagged and rejected: Forensic image analysis detected synthetic or "
                "AI-generated image artifacts. Digital evidence is not authentic."
            )
            logger.warning(f"Immediate rejection for claim {claim_id} due to synthetic AI image: {synth_flags}")
            return VisualAssessmentResponse(
                claim_id=claim_id,
                verdict=VisualVerdict.REJECTED_SYNTHETIC_AI_IMAGE,
                immediate_rejection=True,
                claimant_message=rejection_msg,
                visual_damage_tier=DamageSeverityTier.UNCERTAIN,
                estimated_cost_min=0.0,
                estimated_cost_max=0.0,
                claimed_amount=request.claimed_amount,
                cost_inflation_ratio=0.0,
                is_treatable=True,
                evident_flags=synth_flags,
                fabrication_detected=True,
                is_synthetic_ai=True,
                synthetic_confidence=synth_conf,
                attempt_number=attempt_num,
                forensic_explanation=synth_exp,
                timestamp=get_utc_timestamp()
            )

        # Step 3: Visual Damage Scoring & Repair Cost Estimation
        tier, cost_min, cost_max, benchmark, diagnostic = DamageScorer.score_damage(
            img=img,
            claim_type=request.claim_type or "auto",
            description=request.description or ""
        )

        # Step 4: Evident Fabrication & Causality Conflict Detection
        # (e.g. Storm claimed, but image shows manual blunt destruction / hammer strike)
        fabrication_detected, fab_flags, fab_explanation = FabricationDetector.check_fabrication(
            img=img,
            reported_cause=request.reported_cause or "collision",
            description=request.description or "",
            claim_type=request.claim_type or "auto"
        )

        all_flags: List[str] = list(fab_flags)

        if fabrication_detected:
            rejection_msg = (
                f"Your claim has been flagged and rejected: Forensic image analysis detected physical evidence "
                f"inconsistent with the reported cause ('{request.reported_cause}'). {fab_explanation}"
            )
            logger.warning(f"Immediate rejection for claim {claim_id} due to detected fabrication: {fab_flags}")
            return VisualAssessmentResponse(
                claim_id=claim_id,
                verdict=VisualVerdict.REJECTED_FABRICATED_DAMAGE,
                immediate_rejection=True,
                claimant_message=rejection_msg,
                visual_damage_tier=tier,
                estimated_cost_min=cost_min,
                estimated_cost_max=cost_max,
                claimed_amount=request.claimed_amount,
                cost_inflation_ratio=round(request.claimed_amount / max(cost_max, 1.0), 2),
                is_treatable=True,
                evident_flags=all_flags,
                fabrication_detected=True,
                is_synthetic_ai=False,
                synthetic_confidence=0.0,
                attempt_number=attempt_num,
                forensic_explanation=fab_explanation,
                timestamp=get_utc_timestamp()
            )

        # Step 5: Compensation Demand vs. Visual Repair Cost Matching
        is_massive, ratio, cost_flags, cost_rationale = CostMatcher.evaluate_cost_match(
            claimed_amount=request.claimed_amount,
            tier=tier,
            cost_min=cost_min,
            cost_max=cost_max
        )
        all_flags.extend(cost_flags)

        if is_massive:
            rejection_msg = (
                f"Your claim has been immediately rejected due to gross compensation inflation: "
                f"You demanded ₹{request.claimed_amount:,.2f}, but fair visual repair cost is estimated at "
                f"₹{cost_min:,.2f} - ₹{cost_max:,.2f} (Inflation Ratio: {ratio:.1f}x)."
            )
            logger.warning(f"Immediate rejection for claim {claim_id} due to massive cost inflation: {cost_flags}")
            return VisualAssessmentResponse(
                claim_id=claim_id,
                verdict=VisualVerdict.REJECTED_MASSIVE_INFLATION,
                immediate_rejection=True,
                claimant_message=rejection_msg,
                visual_damage_tier=tier,
                estimated_cost_min=cost_min,
                estimated_cost_max=cost_max,
                claimed_amount=request.claimed_amount,
                cost_inflation_ratio=ratio,
                is_treatable=True,
                evident_flags=all_flags,
                fabrication_detected=False,
                is_synthetic_ai=False,
                synthetic_confidence=0.0,
                attempt_number=attempt_num,
                forensic_explanation=cost_rationale,
                timestamp=get_utc_timestamp()
            )

        # Step 6: Legitimate Claim Resolution (Fast-Track vs Standard Review)
        if ratio <= 1.15 and len(all_flags) == 0:
            verdict = VisualVerdict.FAST_TRACK_APPROVED
            msg = (
                f"Visual damage verified as {tier.value}. Claimed compensation of ₹{request.claimed_amount:,.2f} "
                f"matches independent repair estimate (₹{cost_min:,.2f} - ₹{cost_max:,.2f}). Approved for instant payout."
            )
        else:
            verdict = VisualVerdict.STANDARD_PROCESSING
            msg = (
                f"Visual damage verified as {tier.value}. Claimed compensation of ₹{request.claimed_amount:,.2f} "
                f"routed for standard desk adjudication."
            )

        logger.info(f"Visual claim {claim_id} resolved with verdict: {verdict.value} (Ratio: {ratio:.2f}x)")

        return VisualAssessmentResponse(
            claim_id=claim_id,
            verdict=verdict,
            immediate_rejection=False,
            claimant_message=msg,
            visual_damage_tier=tier,
            estimated_cost_min=cost_min,
            estimated_cost_max=cost_max,
            claimed_amount=request.claimed_amount,
            cost_inflation_ratio=ratio,
            is_treatable=True,
            evident_flags=all_flags,
            fabrication_detected=False,
            is_synthetic_ai=False,
            synthetic_confidence=0.0,
            attempt_number=attempt_num,
            forensic_explanation=f"Damage scored within {tier.value} parameters. {cost_rationale}",
            timestamp=get_utc_timestamp()
        )
