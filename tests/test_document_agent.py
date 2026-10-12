"""
Unit tests for DocumentVerificationAgent and LetterheadVerifier.
Validates PyMuPDF extraction, authority matching, and letterhead fraud detection.
"""
import pytest
from src.document.document_agent import DocumentVerificationAgent
from src.document.letterhead_verifier import LetterheadVerifier
from src.document.schemas import DocumentVerificationRequest

agent = DocumentVerificationAgent()

def test_authentic_police_letterhead_for_motor_claim():
    sample_text = """
    STATE OF CALIFORNIA - CALIFORNIA HIGHWAY PATROL
    TRAFFIC COLLISION REPORT - OFFICIAL POLICE INVESTIGATION
    Case No: CHP-2026-88192
    Date of Collision: 2026-10-12
    Investigating Officer: Officer J. Martinez, Badge #4491
    Total Estimated Damage: $2,450.00
    Collision narrative: Unit 1 rear-ended Unit 2 at controlled intersection.
    """
    
    req = DocumentVerificationRequest(
        document_text=sample_text,
        file_name="Police_Collision_Report.txt",
        policy_category="motor",
        claimed_amount=2450.0
    )
    res = agent.verify_document(req)
    assert res.is_genuine is True
    assert res.verdict == "AUTHENTIC_VERIFIED"
    assert res.authority_type == "Law Enforcement / Police Department"
    assert res.authenticity_score >= 0.85
    assert res.report_or_invoice_id is not None
    assert "Badge #4491" in res.officer_or_physician_id

def test_mismatched_medical_authority_for_motor_claim():
    sample_text = """
    SAINT JUDE REGIONAL MEDICAL CENTER
    DEPARTMENT OF EMERGENCY MEDICINE
    1000 Hospital Drive, Pavilion B
    Patient: Alexander Vance
    Attending Physician: Dr. Robert Sterling, M.D.
    Medical License: MED-99210
    Total Itemized Charges: $3,450.00
    """
    req = DocumentVerificationRequest(
        document_text=sample_text,
        file_name="Saint_Jude_Medical_Invoice.txt",
        policy_category="motor",  # Motor accident claim
        claimed_amount=3450.0
    )
    res = agent.verify_document(req)
    # Must flag authority mismatch
    assert res.verdict == "MISMATCHED_POLICY_AUTHORITY"
    assert res.category_alignment == "MISMATCHED_AUTHORITY"
    assert "Attending Physician" in res.authority_type or "Hospital" in res.authority_type

def test_authentic_hospital_bill_for_health_claim():
    sample_text = """
    SAINT JUDE REGIONAL MEDICAL CENTER
    DEPARTMENT OF EMERGENCY MEDICINE
    Patient: Alexander Vance
    Attending Physician: Dr. Robert Sterling, M.D.
    MRN Record: HOSP-2026-99214
    Total Hospital Charges: $3,450.00
    """
    req = DocumentVerificationRequest(
        document_text=sample_text,
        file_name="Hospital_Bill.txt",
        policy_category="health",  # Health claim
        claimed_amount=3450.0
    )
    res = agent.verify_document(req)
    assert res.is_genuine is True
    assert res.verdict == "AUTHENTIC_VERIFIED"
    assert res.category_alignment == "PERFECT_MATCH"
