from typing import Tuple, List
from src.vision.schemas import DamageSeverityTier, VisualVerdict
from src.utils.logger import get_logger

logger = get_logger("CostMatcher")

class CostMatcher:
    """
    Compares the user's demanded compensation against fair market visual repair cost brackets.
    Enforces immediate rejection for massive compensation demands.
    """

    MASSIVE_INFLATION_RATIO = 3.0    # Demanding > 3x the visual upper bound
    MINOR_DAMAGE_CAP = 120000.0       # Absolute cap for minor cosmetic scratch/dent (₹1,20,000)

    @classmethod
    def evaluate_cost_match(
        cls,
        claimed_amount: float,
        tier: DamageSeverityTier,
        cost_min: float,
        cost_max: float
    ) -> Tuple[bool, float, List[str], str]:
        """
        Evaluates whether claimed compensation is a match or an immediate rejection.

        Returns:
            Tuple of (is_massive_inflation: bool, inflation_ratio: float, flags: List[str], rationale: str)
        """
        flags: List[str] = []
        inflation_ratio = round(claimed_amount / max(cost_max, 1.0), 2)

        # 1. Check for massive multiple (> 3.0x upper estimate)
        if inflation_ratio >= cls.MASSIVE_INFLATION_RATIO:
            flags.append(f"MASSIVE_INFLATION_MULTIPLE: Claimed amount is {inflation_ratio:.1f}x higher than maximum visual repair cost (₹{cost_max:,.2f}).")

        # 2. Check for outsized payout on minor cosmetic damage
        if tier == DamageSeverityTier.MINOR_COSMETIC and claimed_amount > cls.MINOR_DAMAGE_CAP:
            flags.append(f"OUTSIZED_COSMETIC_DEMAND: User demanded ₹{claimed_amount:,.2f} for surface cosmetic damage valued at ₹{cost_min:,.2f} - ₹{cost_max:,.2f}.")

        is_massive = len(flags) > 0

        if is_massive:
            rationale = (
                f"Gross compensation discrepancy detected. Requested ₹{claimed_amount:,.2f} against "
                f"visual damage ceiling of ₹{cost_max:,.2f} (Inflation Ratio: {inflation_ratio:.1f}x)."
            )
            logger.warning(f"Immediate rejection triggered for excessive claim amount: {rationale}")
        else:
            rationale = (
                f"Claimed amount of ₹{claimed_amount:,.2f} is within acceptable variance of visual repair bracket "
                f"(₹{cost_min:,.2f} - ₹{cost_max:,.2f}, ratio: {inflation_ratio:.2f}x)."
            )

        return is_massive, inflation_ratio, flags, rationale
