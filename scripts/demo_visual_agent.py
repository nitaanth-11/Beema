"""
Demonstration script for Beema Visual Insurance Agent.
Runs 4 representative visual claim scenarios:
1. Legitimate Claim: Minor scratch with fair compensation ($850) -> Approved Fast-Track.
2. Massive Compensation Demand: Minor scratch with $40,000 demanded -> Immediately Rejected!
3. Evident Fabrication: Storm claim where image shows manual sledgehammer destruction -> Flagged & Rejected!
4. Confused / Untreatable Image: Blurry / low quality photo -> 'An agent will look forward to your matter.'
"""

import sys
import io
import base64
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.vision.schemas import VisualClaimRequest
from src.vision.visual_agent import VisualInsuranceAgent

def make_scratch_image() -> str:
    img = Image.new("RGB", (320, 320), color=(180, 180, 185))
    draw = ImageDraw.Draw(img)
    draw.line([(0, 110), (320, 110)], fill=(140, 140, 145), width=2)
    draw.line([(0, 230), (320, 230)], fill=(150, 150, 155), width=2)
    draw.line([(120, 140), (190, 158)], fill=(45, 45, 50), width=2)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")

def make_manual_sledgehammer_image() -> str:
    img = Image.new("RGB", (320, 320), color=(200, 200, 200))
    draw = ImageDraw.Draw(img)
    # Heavy trauma in single localized quadrant
    for i in range(210, 290, 3):
        draw.line([(i, 210), (i + 15, 295)], fill=(15, 15, 15), width=4)
        draw.ellipse([i-5, 240, i+15, 280], fill=(50, 10, 10))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")

def make_blurry_image() -> str:
    img = Image.new("RGB", (320, 320), color=(128, 128, 128))
    img = img.filter(ImageFilter.GaussianBlur(radius=18))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")

def print_result(title: str, res):
    print(f"\n{'='*75}")
    print(f" SCENARIO: {title}")
    print(f"{'='*75}")
    print(f"Claim ID            : {res.claim_id}")
    print(f"Verdict             : {res.verdict.value}")
    print(f"Immediate Rejection : {res.immediate_rejection}")
    print(f"Treatable Image     : {res.is_treatable}")
    print(f"Damage Tier         : {res.visual_damage_tier.value}")
    print(f"Estimated Repair    : ${res.estimated_cost_min:,.2f} - ${res.estimated_cost_max:,.2f}")
    print(f"Claimed Demand      : ${res.claimed_amount:,.2f}")
    print(f"Cost Inflation Ratio: {res.cost_inflation_ratio:.2f}x")
    print(f"Fabrication Detected: {res.fabrication_detected}")
    print(f"Evident Flags ({len(res.evident_flags)}):")
    for f in res.evident_flags:
        print(f"  - {f}")
    print(f"Claimant Message    : \"{res.claimant_message}\"")

def main():
    agent = VisualInsuranceAgent()

    # Scenario 1: Normal Minor Claim with Fair Cost
    res1 = agent.assess_claim(VisualClaimRequest(
        claim_id="CLM-VIS-001",
        image_base64=make_scratch_image(),
        claimed_amount=850.0,
        reported_cause="parking scratch",
        claim_type="auto"
    ))
    print_result("1. LEGITIMATE CLAIM (Matched Repair Cost)", res1)

    # Scenario 2: Massive Compensation Demand
    res2 = agent.assess_claim(VisualClaimRequest(
        claim_id="CLM-VIS-002",
        image_base64=make_scratch_image(),
        claimed_amount=40000.0,  # User demands $40,000 for a minor scratch!
        reported_cause="parking scratch",
        claim_type="auto"
    ))
    print_result("2. MASSIVE COMPENSATION DEMAND (Immediate Rejection)", res2)

    # Scenario 3: Storm Claim with Manual Destruction
    res3 = agent.assess_claim(VisualClaimRequest(
        claim_id="CLM-VIS-003",
        image_base64=make_manual_sledgehammer_image(),
        claimed_amount=7500.0,
        reported_cause="severe storm and hail",
        claim_type="auto",
        description="Roof and hood crushed by sudden violent storm weather."
    ))
    print_result("3. STORM CLAIM WITH MANUAL DESTRUCTION (Flagged & Rejected)", res3)

    # Scenario 4: Confused / Blurry Image
    res4 = agent.assess_claim(VisualClaimRequest(
        claim_id="CLM-VIS-004",
        image_base64=make_blurry_image(),
        claimed_amount=2500.0,
        reported_cause="collision"
    ))
    print_result("4. CONFUSED / UNTREATABLE IMAGE (Routed to Human Agent)", res4)

    # Scenario 5: User Uploads > 5 Times Without Changing Demand
    print(f"\n{'='*75}")
    print(" SCENARIO: 5. REPEATED UPLOADS (>5 ATTEMPTS) WITH PERSISTENT UNCHANGED DEMAND")
    print(f"{'='*75}")
    repeat_claim_id = "CLM-REPEAT-DEMO-99"
    for attempt in range(1, 6):
        res_tmp = agent.assess_claim(VisualClaimRequest(
            claim_id=repeat_claim_id,
            image_base64=make_scratch_image(),
            claimed_amount=3500.0,
            reported_cause="scratch"
        ))
        print(f"  -> Upload Attempt #{res_tmp.attempt_number}: Processed ({res_tmp.verdict.value})")

    # 6th attempt with unchanged demand
    res5 = agent.assess_claim(VisualClaimRequest(
        claim_id=repeat_claim_id,
        image_base64=make_scratch_image(),
        claimed_amount=3500.0,
        reported_cause="scratch"
    ))
    print_result("5. FINAL VERDICT ON 6TH UNCHANGED ATTEMPT (Permanently Blocked)", res5)

    # Scenario 6: AI-Generated / Synthetic Image Detected
    from PIL.PngImagePlugin import PngInfo
    synth_img = Image.new("RGB", (320, 320), color=(180, 180, 185))
    draw_s = ImageDraw.Draw(synth_img)
    draw_s.line([(0, 100), (320, 100)], fill=(140, 140, 145), width=2)
    draw_s.line([(120, 140), (180, 155)], fill=(50, 50, 55), width=2)
    target_info = PngInfo()
    target_info.add_text("parameters", "photorealistic car crushed, prompt: hail storm damage, Midjourney v6")
    buf_s = io.BytesIO()
    synth_img.save(buf_s, format="PNG", pnginfo=target_info)
    b64_synth = base64.b64encode(buf_s.getvalue()).decode("utf-8")

    res6 = agent.assess_claim(VisualClaimRequest(
        claim_id="CLM-AI-SYNTH-888",
        image_base64=b64_synth,
        claimed_amount=1500.0,
        reported_cause="hail"
    ))
    print_result("6. AI-GENERATED / SYNTHETIC IMAGE DETECTED (Flagged & Rejected)", res6)

if __name__ == "__main__":
    main()
