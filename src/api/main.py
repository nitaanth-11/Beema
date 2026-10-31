from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Optional
from pydantic import BaseModel
from src.decision.schemas import (
    ClaimInputSchema,
    LakehouseClaimRequest,
    DecisionResponse,
    HealthResponse
)
from src.decision.service import LayaInsuranceDecisionService
from src.decision.laya_model import LayaInsuranceModel
from src.config import (
    LAYA_MODEL_ID,
    LAYA_DEFAULT_SUBFOLDER,
    LAYA_DEVICE,
    LAYA_FALLBACK_MOCK,
    DELTA_TABLE_MODEL_READY,
    get_utc_timestamp
)
from src.utils.logger import get_logger

from contextlib import asynccontextmanager
import base64

from src.vision.schemas import (
    VisualClaimRequest,
    VisualAssessmentResponse
)
from src.vision.visual_agent import VisualInsuranceAgent
from src.vision.damage_scorer import DamageScorer
from src.vision.quality_checker import ImageQualityChecker
from src.document import (
    DocumentVerificationRequest,
    DocumentVerificationResponse,
    DocumentVerificationAgent
)

logger = get_logger("FastAPIService")

# Global service instances
decision_service: LayaInsuranceDecisionService = None
visual_agent: VisualInsuranceAgent = None
document_agent: DocumentVerificationAgent = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global decision_service, visual_agent, document_agent
    logger.info("Initializing LAYA Insurance Decision Service, Visual Agent & Document Agent...")
    model = LayaInsuranceModel()
    decision_service = LayaInsuranceDecisionService(laya_model=model)
    visual_agent = VisualInsuranceAgent()
    document_agent = DocumentVerificationAgent()
    logger.info("Beema Decision Engine, Visual Agent & Document Agent ready to receive requests.")
    yield

app = FastAPI(
    title="Beema - LAYA Insurance Decision Engine",
    description=(
        "AI-Powered Insurance Claims Investigation System. "
        "Integrates Hugging Face LAYA with deterministic insurance validation rules, "
        "visual damage/fraud scoring, and Delta Lakehouse feature store connectivity."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend Vite application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_visual_agent() -> VisualInsuranceAgent:
    global visual_agent
    if visual_agent is None:
        visual_agent = VisualInsuranceAgent()
    return visual_agent

def get_document_agent() -> DocumentVerificationAgent:
    global document_agent
    if document_agent is None:
        document_agent = DocumentVerificationAgent()
    return document_agent

def get_service() -> LayaInsuranceDecisionService:
    global decision_service
    if decision_service is None:
        model = LayaInsuranceModel()
        decision_service = LayaInsuranceDecisionService(laya_model=model)
    return decision_service

@app.api_route("/", methods=["GET", "HEAD"], tags=["System Health"])
def root_status() -> Dict[str, Any]:
    """
    Root status probe confirming the Beema FastAPI Decision Gateway is online.
    """
    return {
        "name": "Beema - AI-Powered Insurance Claims Investigation System",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_url": "/health",
        "endpoints": {
            "adjudicate": "/predict",
            "lakehouse_adjudicate": "/predict/lakehouse",
            "visual_assessment": "/predict/visual-claim",
            "visual_upload": "/predict/visual-upload",
            "deep_damage_estimate": "/predict/deep-damage-estimate",
            "document_verification": "/predict/verify-document",
            "document_upload": "/predict/verify-document-upload"
        }
    }

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=204)

@app.get("/health", response_model=HealthResponse, tags=["System Health"])
def health_check(service: LayaInsuranceDecisionService = Depends(get_service)) -> HealthResponse:
    """
    Returns deployment status, loaded model checkpoints, and Delta Lake feature readiness.
    """
    status = service.get_health_status()
    return HealthResponse(
        status="healthy",
        model_loaded=status["model_loaded"],
        model_id=LAYA_MODEL_ID,
        checkpoint_subfolder=LAYA_DEFAULT_SUBFOLDER,
        using_fallback_mock=status["using_fallback_mock"],
        lakehouse_connected=status["lakehouse_connected"],
        device=status["device"],
        timestamp=get_utc_timestamp()
    )

@app.post("/predict", response_model=DecisionResponse, tags=["Claims Adjudication"])
def predict_claim(
    claim: ClaimInputSchema,
    service: LayaInsuranceDecisionService = Depends(get_service)
) -> DecisionResponse:
    """
    Evaluates an insurance claim payload against:
    1. Deterministic insurance policy checks (Inception latency, deductible rules)
    2. Evidence consistency verification (Repair estimate vs claim, date causality)
    3. Hugging Face LAYA non-autoregressive decision model
    4. Composite adjudication verdict and investigation prioritization
    """
    try:
        decision = service.evaluate_claim(claim)
        return decision
    except Exception as e:
        logger.error(f"Error evaluating claim {claim.claim_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/lakehouse", response_model=DecisionResponse, tags=["Claims Adjudication"])
def predict_from_lakehouse(
    req: LakehouseClaimRequest,
    service: LayaInsuranceDecisionService = Depends(get_service)
) -> DecisionResponse:
    """
    Retrieves an engineered claim record directly from the Delta Lake Feature Store (Gold Layer)
    and executes the complete decision pipeline.
    """
    try:
        decision = service.evaluate_from_lakehouse(req.claim_id)
        return decision
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.error(f"Error querying lakehouse for claim {req.claim_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class DeepDamageAnalysisRequest(BaseModel):
    image_base64: str
    claim_type: str = "auto"
    description: str = ""
    claimed_amount: float = 0.0

@app.post("/predict/deep-damage-estimate", tags=["Visual Damage Agent"])
def predict_deep_damage_estimate(req: DeepDamageAnalysisRequest):
    """
    Direct Deep Learning Damage & Repair Cost Estimator using PyTorch ResNet-18.
    Analyzes uploaded image pixels to extract convolutional spatial entropy, deformation maps,
    and calculates accurate fair-market repair cost brackets.
    """
    try:
        img, err = ImageQualityChecker.load_image(image_base64=req.image_base64)
        if img is None:
            raise HTTPException(status_code=400, detail=f"Failed to decode image: {err}")
        
        tier, cost_min, cost_max, benchmark, diag = DamageScorer.score_damage(
            img=img,
            claim_type=req.claim_type,
            description=req.description
        )
        
        return {
            "status": "success",
            "visual_damage_tier": tier.value,
            "estimated_cost_min": cost_min,
            "estimated_cost_max": cost_max,
            "benchmark_cost": benchmark,
            "deep_learning_confidence": diag.get("neural_confidence", 0.94),
            "detected_components": diag.get("detected_components", ["Exterior Body Panels"]),
            "deep_damage_index": diag.get("deep_damage_index", 0.52),
            "backbone": diag.get("backbone", "PyTorch ResNet-18 Deep Feature Extractor"),
            "tier_label": diag.get("tier_label", "")
        }
    except Exception as e:
        logger.error(f"Error in deep damage estimation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/visual-claim", response_model=VisualAssessmentResponse, tags=["Visual Damage Agent"])
def predict_visual_claim(
    req: VisualClaimRequest,
    agent: VisualInsuranceAgent = Depends(get_visual_agent)
) -> VisualAssessmentResponse:
    """
    Evaluates visual damage evidence from an image path or base64 payload:
    1. Tests image clarity & treatability ('An agent will look forward to your matter' if confused/blurry)
    2. Quantifies visual damage tier & fair repair cost range via ResNet-18 deep vision
    3. Rejects immediately if demanded compensation is massively inflated
    4. Detects evident physical fabrication (e.g. storm claim with manual sledgehammer damage)
    """
    try:
        assessment = agent.assess_claim(req)
        return assessment
    except Exception as e:
        logger.error(f"Error during visual claim assessment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/visual-upload", response_model=VisualAssessmentResponse, tags=["Visual Damage Agent"])
async def predict_visual_upload(
    claimed_amount: float = Form(..., description="Compensation demanded by claimant"),
    claim_id: str = Form("CLM-UPLOAD-001"),
    reported_cause: str = Form("collision", description="Reported cause: storm, collision, hail, water, etc."),
    claim_type: str = Form("auto", description="Insurance line: auto, property, home"),
    description: str = Form("", description="Claim narrative"),
    file: UploadFile = File(..., description="Uploaded damage photo"),
    agent: VisualInsuranceAgent = Depends(get_visual_agent)
) -> VisualAssessmentResponse:
    """
    Accepts multipart/form-data image upload and runs the visual damage & fraud agent.
    """
    try:
        content = await file.read()
        b64_str = base64.b64encode(content).decode("utf-8")
        req = VisualClaimRequest(
            claim_id=claim_id,
            image_base64=b64_str,
            claimed_amount=claimed_amount,
            reported_cause=reported_cause,
            claim_type=claim_type,
            description=description
        )
        return agent.assess_claim(req)
    except Exception as e:
        logger.error(f"Error processing visual upload: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/verify-document", response_model=DocumentVerificationResponse, tags=["Document Verification Agent"])
def verify_document(
    req: DocumentVerificationRequest,
    agent: DocumentVerificationAgent = Depends(get_document_agent)
) -> DocumentVerificationResponse:
    """
    Evaluates supporting insurance document (PDF, DOCX, TXT, or Image):
    1. Extracts layout & text blocks via PyMuPDF (fitz)
    2. Audits header block for institutional letterhead & official seals
    3. Verifies authority type matches the policy line (e.g. Police for Motor, Hospital/Doctor for Health)
    4. Validates case/report ID, credentials, itemized amounts, and dates
    """
    try:
        return agent.verify_document(req)
    except Exception as e:
        logger.error(f"Error in document verification: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/verify-document-upload", response_model=DocumentVerificationResponse, tags=["Document Verification Agent"])
async def verify_document_upload(
    file: UploadFile = File(..., description="Uploaded document (PDF, TXT, PNG, JPG)"),
    policy_category: str = Form("motor", description="Insurance line: motor, health, property, life, travel, commercial"),
    claimed_amount: float = Form(0.0, description="Claimed amount to cross-verify"),
    claim_id: Optional[str] = Form(None),
    incident_date: Optional[str] = Form(None),
    agent: DocumentVerificationAgent = Depends(get_document_agent)
) -> DocumentVerificationResponse:
    """
    Accepts multipart upload of supporting document and runs DocumentVerificationAgent.
    """
    try:
        content = await file.read()
        b64_str = base64.b64encode(content).decode("utf-8")
        req = DocumentVerificationRequest(
            document_base64=b64_str,
            file_name=file.filename or "document.pdf",
            policy_category=policy_category,
            claimed_amount=claimed_amount,
            claim_id=claim_id,
            incident_date=incident_date
        )
        return agent.verify_document(req)
    except Exception as e:
        logger.error(f"Error in document upload verification: {e}")
        raise HTTPException(status_code=500, detail=str(e))

