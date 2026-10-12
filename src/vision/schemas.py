from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class DamageSeverityTier(str, Enum):
    MINOR_COSMETIC = "MINOR_COSMETIC"         # Scratches, small dents, cracked lights ($300 - $1,500)
    MODERATE_LOCALIZED = "MODERATE_LOCALIZED" # Bumper crush, fender dent, windshield ($1,500 - $5,000)
    SEVERE_STRUCTURAL = "SEVERE_STRUCTURAL"   # Frame damage, collapsed quarter panel, roof ($5,000 - $20,000)
    TOTAL_DESTRUCTION = "TOTAL_DESTRUCTION"   # Burned, crushed chassis, flood total loss ($20,000 - $60,000+)
    UNCERTAIN = "UNCERTAIN"                   # Blurry, ambiguous, low quality

class VisualVerdict(str, Enum):
    FAST_TRACK_APPROVED = "FAST_TRACK_APPROVED"
    STANDARD_PROCESSING = "STANDARD_PROCESSING"
    REJECTED_MASSIVE_INFLATION = "REJECTED_MASSIVE_INFLATION"
    REJECTED_FABRICATED_DAMAGE = "REJECTED_FABRICATED_DAMAGE"
    REJECTED_SYNTHETIC_AI_IMAGE = "REJECTED_SYNTHETIC_AI_IMAGE"
    BLOCKED_PERSISTENT_DEMAND = "BLOCKED_PERSISTENT_DEMAND"
    MANUAL_ADJUSTER_REVIEW = "MANUAL_ADJUSTER_REVIEW"

class VisualClaimRequest(BaseModel):
    claim_id: Optional[str] = Field(default="CLM-VIS-TMP")
    image_path: Optional[str] = Field(default=None, description="Local path to damage photo")
    image_base64: Optional[str] = Field(default=None, description="Base64 encoded image string")
    claimed_amount: float = Field(..., gt=0, description="Amount of compensation demanded by policyholder")
    reported_cause: Optional[str] = Field(default="collision", description="Reported cause of loss (e.g. storm, collision, hail, water)")
    claim_type: Optional[str] = Field(default="auto", description="Insurance line: auto, property, home")
    description: Optional[str] = Field(default=None, description="Customer loss narrative")

class VisualAssessmentResponse(BaseModel):
    claim_id: str
    verdict: VisualVerdict
    immediate_rejection: bool
    claimant_message: str
    visual_damage_tier: DamageSeverityTier
    estimated_cost_min: float
    estimated_cost_max: float
    claimed_amount: float
    cost_inflation_ratio: float
    is_treatable: bool
    evident_flags: List[str] = Field(default_factory=list)
    fabrication_detected: bool = False
    is_synthetic_ai: bool = False
    synthetic_confidence: float = 0.0
    attempt_number: int = 1
    forensic_explanation: str
    timestamp: str
