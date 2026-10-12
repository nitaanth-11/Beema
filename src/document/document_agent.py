"""
Document Authenticity & Letterhead Verification Agent.
Orchestrates deep structural extraction, institutional letterhead auditing,
official credential cross-referencing, and policy alignment verification.
"""
from typing import Dict, Any, Optional, Tuple
from src.document.schemas import DocumentVerificationRequest, DocumentVerificationResponse
from src.document.pdf_extractor import DocumentExtractor
from src.document.letterhead_verifier import LetterheadVerifier
from src.utils.logger import get_logger

logger = get_logger("DocumentVerificationAgent")

class DocumentVerificationAgent:
    """
    Autonomous Insurance Document Verification Agent.
    Validates institutional letterhead authenticity, official credentials,
    and cross-verifies alignment with policy categories (e.g., Police for Motor, Doctor for Health).
    """

    def __init__(self):
        logger.info("DocumentVerificationAgent initialized and active.")

    def verify_document(self, request: DocumentVerificationRequest) -> DocumentVerificationResponse:
        """
        Executes complete verification pipeline from base64 payload or raw bytes.
        """
        file_name = request.file_name or "document.pdf"
        policy_category = (request.policy_category or "motor").lower()

        if not request.document_base64:
            return DocumentVerificationResponse(
                status="error",
                is_genuine=False,
                authenticity_score=0.0,
                letterhead_detected=False,
                letterhead_organization="None Provided",
                authority_type="Missing Document",
                category_alignment="MISSING_INSTITUTIONAL_LETTERHEAD",
                verdict="REJECTED_NO_CONTENT",
                verdict_badge="❌ No Document Data Provided",
                explanation="No document bytes or base64 payload received for verification.",
                key_evidence_markers=["Document payload was empty"],
                page_count=0,
                file_name=file_name
            )

        try:
            doc_bytes = DocumentExtractor.decode_base64_payload(request.document_base64)
            extraction_res = DocumentExtractor.extract_document(doc_bytes=doc_bytes, file_name=file_name)

            full_text = extraction_res.get("full_text", "")
            header_text = extraction_res.get("header_text", "")
            page_count = extraction_res.get("page_count", 1)

            # Analyze Letterhead & Official Authority
            analysis = LetterheadVerifier.analyze_document(
                full_text=full_text,
                header_text=header_text,
                policy_category=policy_category,
                claimed_amount=request.claimed_amount,
                incident_date=request.incident_date
            )

            return DocumentVerificationResponse(
                status="success",
                is_genuine=analysis["is_genuine"],
                authenticity_score=analysis["authenticity_score"],
                letterhead_detected=analysis["letterhead_detected"],
                letterhead_organization=analysis["letterhead_organization"],
                authority_type=analysis["authority_type"],
                category_alignment=analysis["category_alignment"],
                report_or_invoice_id=analysis["report_or_invoice_id"],
                extracted_amount=analysis["extracted_amount"],
                officer_or_physician_id=analysis["officer_or_physician_id"],
                incident_date_found=analysis["incident_date_found"],
                verdict=analysis["verdict"],
                verdict_badge=analysis["verdict_badge"],
                explanation=analysis["explanation"],
                key_evidence_markers=analysis["key_evidence_markers"],
                page_count=page_count,
                file_name=file_name
            )

        except Exception as e:
            logger.error(f"Error verifying document {file_name}: {e}")
            return DocumentVerificationResponse(
                status="error",
                is_genuine=False,
                authenticity_score=0.15,
                letterhead_detected=False,
                letterhead_organization="Parsing Error",
                authority_type="Corrupted / Unreadable Document",
                category_alignment="ERROR",
                verdict="REQUIRES_MANUAL_REVIEW",
                verdict_badge="⚠️ Document Inspection Exception",
                explanation=f"Agent encountered error during layout decomposition: {str(e)}",
                key_evidence_markers=["Document structure could not be parsed automatically"],
                page_count=0,
                file_name=file_name
            )
