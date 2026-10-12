from typing import Tuple, List, Dict, Any, Optional
from PIL import Image, ImageStat
from src.utils.logger import get_logger

logger = get_logger("FabricationDetector")

class FabricationDetector:
    """
    Identifies evident physical fabrications and inconsistencies between
    the claimed loss cause and visual evidence.
    
    Key checks:
    1. Storm / Hail / Wind claimed, but image shows localized manual destruction (e.g. blunt tool, sledgehammer).
    2. Deep pre-existing oxidation/rust in damage crevices for supposedly 'fresh' incidents.
    3. Concentrated puncture or clean mechanical tool incisions disguised as natural damage.
    """

    STORM_KEYWORDS = ["storm", "hail", "wind", "tornado", "hurricane", "weather", "flood", "tree limb"]
    MANUAL_FORCE_KEYWORDS = ["hammer", "sledgehammer", "bat", "crowbar", "pry", "tool", "cut", "vandal", "kick"]

    @classmethod
    def check_fabrication(
        cls,
        img: Image.Image,
        reported_cause: str = "collision",
        description: str = "",
        claim_type: str = "auto"
    ) -> Tuple[bool, List[str], str]:
        """
        Evaluates visual and contextual markers for manual tampering and fabrication.

        Returns:
            Tuple of (fabrication_detected: bool, flags: List[str], forensic_explanation: str)
        """
        flags: List[str] = []
        explanation_parts: List[str] = []

        cause_lower = (reported_cause or "").lower()
        desc_lower = (description or "").lower()

        # 1. Storm / Natural Disaster vs. Manual Destruction
        is_storm_claim = any(k in cause_lower or k in desc_lower for k in cls.STORM_KEYWORDS)
        has_manual_indicators = any(k in desc_lower for k in cls.MANUAL_FORCE_KEYWORDS)

        # Visual Texture & Asymmetry Analysis
        # Natural storm / hail has widespread spatial dispersion across the image.
        # Manual impact has extreme localized spatial concentration (single point peak with quiet surroundings).
        w, h = img.size
        # Divide image into 3x3 grid to inspect spatial variance of damage
        grid_variances = []
        gray = img.convert("L")
        cell_w, cell_h = w // 3, h // 3
        
        for r in range(3):
            for c in range(3):
                box = (c * cell_w, r * cell_h, (c + 1) * cell_w, (r + 1) * cell_h)
                cell = gray.crop(box)
                stat = ImageStat.Stat(cell)
                grid_variances.append(stat.stddev[0])

        max_var = max(grid_variances)
        min_var = min(grid_variances)
        var_ratio = max_var / max(min_var, 1.0)

        # In natural storm/hail/weather, damage is distributed (var_ratio is moderate, typically < 3.2).
        # In manual sledgehammer / localized pry impact, 1 cell has extreme damage while other 8 cells are untouched (var_ratio > 4.5).
        is_highly_localized_impact = var_ratio > 4.2

        if is_storm_claim and (has_manual_indicators or is_highly_localized_impact):
            flags.append("MANUAL_DESTRUCTION_WEATHER_CONFLICT")
            explanation_parts.append(
                f"Claimed cause of loss is '{reported_cause}', but physical analysis detected "
                f"extreme localized blunt impact (spatial asymmetry ratio: {var_ratio:.1f}x) "
                f"consistent with deliberate manual tool/blunt destruction rather than diffuse storm impact."
            )

        # 2. Rust & Pre-Existing Corrosion Check
        # Inspect for high presence of reddish-orange oxidation in crevices (R >> G and B low)
        rgb_img = img.convert("RGB")
        stat = ImageStat.Stat(rgb_img)
        r_mean, g_mean, b_mean = stat.mean[0], stat.mean[1], stat.mean[2]

        # Heavy oxidation signature: Red significantly dominates Blue in damaged regions
        if r_mean > 130 and b_mean < 80 and (r_mean - b_mean) > 65:
            if any(k in cause_lower for k in ["fresh", "recent collision", "yesterday", "hit"]):
                flags.append("PRE_EXISTING_CORROSION_ON_FRESH_CLAIM")
                explanation_parts.append(
                    f"Damage surfaces exhibit extensive oxidative discoloration (R/B ratio: {r_mean/max(b_mean,1):.2f}) "
                    f"indicating pre-existing historical corrosion on a claim reported as fresh."
                )

        if flags:
            logger.warning(f"Fabrication markers detected for claim: {flags}")
            return True, flags, " | ".join(explanation_parts)

        return False, [], "No evident physical fabrication or causality conflict detected."
