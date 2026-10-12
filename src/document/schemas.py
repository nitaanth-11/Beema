"""
Document Verification & Letterhead Authenticity Agent Schemas.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class DocumentVerificationRequest(BaseModel):
    document_base64: Optional[str] = Field(None, description="Base64 encoded PDF or document image bytes")
    document_text: Optional[str] = Field(None, description="Direct raw text representation of document")
    file_name: str = Field("document.pdf", description="Original file name")
    policy_category: str = Field("motor", description="Insurance line: motor, health, property, life, travel, commercial")
    claimed_amount: float = Field(0.0, description="Claimed amount to cross-reference")
    claim_id: Optional[str] = Field(None, description="Claim identifier")
    incident_date: Optional[str] = Field(None, description="Reported date of incident")

class DocumentVerificationResponse(BaseModel):
    status: str = Field("success", description="Verification status")
    is_genuine: bool = Field(..., description="Whether the document is authentic with valid letterhead")
    authenticity_score: float = Field(..., description="Authenticity confidence score (0.0 to 1.0)")
    letterhead_detected: bool = Field(..., description="Whether an institutional letterhead was identified")
    letterhead_organization: str = Field(..., description="Identified organization or department name")
    authority_type: str = Field(..., description="Authority classification (e.g. Police, Hospital, Repair Facility)")
    category_alignment: str = Field(..., description="Alignment with policy line: PERFECT_MATCH, MISMATCH, MISSING")
    report_or_invoice_id: Optional[str] = Field(None, description="Extracted official report, case, or invoice number")
    extracted_amount: Optional[float] = Field(None, description="Extracted dollar amount from invoice or bill")
    officer_or_physician_id: Optional[str] = Field(None, description="Officer badge # or Physician license/NPI #")
    incident_date_found: Optional[str] = Field(None, description="Incident date identified in the document")
    verdict: str = Field(..., description="Final verdict classification")
    verdict_badge: str = Field(..., description="Display badge string")
    explanation: str = Field(..., description="Clear explanation of the agent's findings")
    key_evidence_markers: List[str] = Field(default_factory=list, description="Verified factual markers found")
    page_count: int = Field(1, description="Number of pages in the document")
    file_name: str = Field(..., description="Processed file name")
