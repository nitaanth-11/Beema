import pytest
import io
import base64
from PIL import Image, ImageDraw, ImageFilter
from fastapi.testclient import TestClient
from src.api.main import app
from src.vision.schemas import (
    VisualClaimRequest,
    VisualVerdict,
    DamageSeverityTier
)
from src.vision.visual_agent import VisualInsuranceAgent

client = TestClient(app)
agent = VisualInsuranceAgent()

def generate_minor_scratch_b64() -> str:
    """Generates a clean car body with a small localized scratch."""
    img = Image.new("RGB", (300, 300), color=(180, 180, 185))
    draw = ImageDraw.Draw(img)
    # Car body contour lines
    draw.line([(0, 100), (300, 100)], fill=(140, 140, 145), width=2)
    draw.line([(0, 220), (300, 220)], fill=(150, 150, 155), width=2)
    # Light hairline scratch
    draw.line([(120, 140), (180, 155)], fill=(50, 50, 55), width=2)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")

def generate_manual_destruction_b64() -> str:
    """Generates an image with extreme localized blunt tool / hammer trauma."""
    img = Image.new("RGB", (300, 300), color=(200, 200, 200))
    draw = ImageDraw.Draw(img)
    # Heavy trauma in bottom right quadrant only (extreme spatial asymmetry)
    for i in range(210, 280, 3):
        draw.line([(i, 210), (i + 15, 290)], fill=(20, 20, 20), width=4)
        draw.ellipse([i-5, 240, i+15, 275], fill=(40, 10, 10))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")

def generate_blurry_untreatable_b64() -> str:
    """Generates an unresolvable blurry / flat image."""
    img = Image.new("RGB", (300, 300), color=(128, 128, 128))
    # Apply heavy blur so edge contrast falls below threshold
    img = img.filter(ImageFilter.GaussianBlur(radius=15))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")

def test_minor_damage_fair_compensation_approved():
    """
    Validates that a legitimate claim with matching compensation is approved.
    """
    b64 = generate_minor_scratch_b64()
    req = VisualClaimRequest(
        claim_id="CLM-VIS-001",
        image_base64=b64,
        claimed_amount=850.0,
        reported_cause="parking scratch",
        claim_type="auto"
    )
    res = agent.assess_claim(req)
    assert res.is_treatable is True
    assert res.immediate_rejection is False
    assert res.verdict == VisualVerdict.FAST_TRACK_APPROVED
    assert res.visual_damage_tier == DamageSeverityTier.MINOR_COSMETIC
    assert res.cost_inflation_ratio <= 1.15

def test_massive_compensation_inflation_rejected_immediately():
    """
    Validates that demanding massive compensation ($40,000 for a minor scratch)
    is rejected immediately without adjuster delay.
    """
    b64 = generate_minor_scratch_b64()
    req = VisualClaimRequest(
        claim_id="CLM-VIS-002",
        image_base64=b64,
        claimed_amount=40000.0,  # Massive demand!
        reported_cause="parking scratch",
        claim_type="auto"
    )
    res = agent.assess_claim(req)
    assert res.is_treatable is True
    assert res.immediate_rejection is True
    assert res.verdict == VisualVerdict.REJECTED_MASSIVE_INFLATION
    assert res.cost_inflation_ratio > 3.0
    assert any("MASSIVE_INFLATION" in f for f in res.evident_flags)

def test_storm_claim_with_manual_destruction_rejected():
    """
    Validates user requirement:
    'For example if the user sends the image of storm but it looks destroyed manually, flag it off and reject claim.'
    """
    b64 = generate_manual_destruction_b64()
    req = VisualClaimRequest(
        claim_id="CLM-VIS-003",
        image_base64=b64,
        claimed_amount=6000.0,
        reported_cause="storm hail wind",  # Claims natural weather
        claim_type="auto",
        description="Damage caused by violent sudden storm and hail impact."
    )
    res = agent.assess_claim(req)
    assert res.is_treatable is True
    assert res.immediate_rejection is True
    assert res.fabrication_detected is True
    assert res.verdict == VisualVerdict.REJECTED_FABRICATED_DAMAGE
    assert any("MANUAL_DESTRUCTION_WEATHER_CONFLICT" in f for f in res.evident_flags)

def test_confused_blurry_image_routes_to_human_agent():
    """
    Validates user requirement:
    'If any image looks not treatable or confused then send a message an agent will look forward to your matter.'
    """
    b64 = generate_blurry_untreatable_b64()
    req = VisualClaimRequest(
        claim_id="CLM-VIS-004",
        image_base64=b64,
        claimed_amount=2500.0,
        reported_cause="collision"
    )
    res = agent.assess_claim(req)
    assert res.is_treatable is False
    assert res.immediate_rejection is False
    assert res.verdict == VisualVerdict.MANUAL_ADJUSTER_REVIEW
    assert res.claimant_message == "An agent will look forward to your matter."

def test_api_predict_visual_claim_endpoint():
    """
    Tests FastAPI POST /predict/visual-claim integration.
    """
    b64 = generate_minor_scratch_b64()
    payload = {
        "claim_id": "CLM-API-VIS-01",
        "image_base64": b64,
        "claimed_amount": 750.0,
        "reported_cause": "parking collision",
        "claim_type": "auto"
    }
    response = client.post("/predict/visual-claim", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["claim_id"] == "CLM-API-VIS-01"
    assert "verdict" in data
    assert data["is_treatable"] is True
    assert "estimated_cost_min" in data
    assert "estimated_cost_max" in data

def test_user_blocked_after_five_uploads_with_unchanged_demand():
    """
    Validates user requirement:
    'if the user keeps on uploading more thna five times after the user has uploaded
    and oesnt chnage demand, blovk it and say an employee will contact you'
    """
    claim_id = "CLM-REPEAT-TEST-007"
    b64 = generate_minor_scratch_b64()

    # Uploads 1 through 5 with the same demanded compensation ($3,200.00)
    for i in range(1, 6):
        req = VisualClaimRequest(
            claim_id=claim_id,
            image_base64=b64,
            claimed_amount=3200.0,
            reported_cause="parking scratch",
            claim_type="auto"
        )
        res = agent.assess_claim(req)
        assert res.attempt_number == i
        assert res.verdict != VisualVerdict.BLOCKED_PERSISTENT_DEMAND

    # 6th upload attempt without changing demanded compensation
    req_6 = VisualClaimRequest(
        claim_id=claim_id,
        image_base64=b64,
        claimed_amount=3200.0,  # Still identical demand!
        reported_cause="parking scratch",
        claim_type="auto"
    )
    res_6 = agent.assess_claim(req_6)
    assert res_6.attempt_number == 6
    assert res_6.immediate_rejection is True
    assert res_6.verdict == VisualVerdict.BLOCKED_PERSISTENT_DEMAND
    assert res_6.claimant_message == "An employee will contact you."

def test_ai_generated_synthetic_image_detected():
    """
    Validates detection of AI-generated / synthetic images.
    """
    from PIL.PngImagePlugin import PngInfo
    # Create an image embedded with Midjourney / Stable Diffusion metadata
    img = Image.new("RGB", (300, 300), color=(180, 180, 185))
    draw = ImageDraw.Draw(img)
    draw.line([(0, 100), (300, 100)], fill=(140, 140, 145), width=2)
    draw.line([(0, 220), (300, 220)], fill=(150, 150, 155), width=2)
    draw.line([(120, 140), (180, 155)], fill=(50, 50, 55), width=2)
    target_info = PngInfo()
    target_info.add_text("parameters", "photorealistic car dent from storm, 8k, Midjourney v6 prompt")
    buf = io.BytesIO()
    img.save(buf, format="PNG", pnginfo=target_info)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    req = VisualClaimRequest(
        claim_id="CLM-SYNTH-AI-001",
        image_base64=b64,
        claimed_amount=1200.0,
        reported_cause="collision"
    )
    res = agent.assess_claim(req)
    assert res.is_synthetic_ai is True
    assert res.synthetic_confidence > 0.80
    assert res.immediate_rejection is True
    assert res.verdict == VisualVerdict.REJECTED_SYNTHETIC_AI_IMAGE
    assert any("AI_METADATA_SIGNATURE" in f for f in res.evident_flags)

