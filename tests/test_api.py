import pytest
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_id" in data
    assert "lakehouse_connected" in data
    assert data["lakehouse_connected"] is True

def test_predict_normal_claim():
    payload = {
        "claim_id": "CLM-NORM-100",
        "policy_id": "POL-NORM-100",
        "claim_type": "auto",
        "state": "CA",
        "policyholder_tenure_years": 4.5,
        "previous_claims_count": 0,
        "incident_date": "2024-05-10",
        "claim_filed_date": "2024-05-12",
        "claim_amount": 2500.0,
        "deductible": 500.0,
        "claim_description": "Minor parking lot bumper scrape. Repaired at authorized body shop.",
        "police_report_available": True,
        "repair_estimate_amount": 2400.0,
        "supporting_documents_count": 2
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["claim_id"] == "CLM-NORM-100"
    assert data["final_recommendation"] in ["FAST_TRACK_PAYOUT", "STANDARD_ADJUDICATION"]
    assert data["composite_risk_score"] < 0.30
    assert len(data["rules_triggered"]) == 0

def test_predict_incomplete_claim_requests_evidence_not_fraud():
    """
    Validates that a claim with missing documentation is routed to
    REQUEST_ADDITIONAL_EVIDENCE and NOT marked fraudulent.
    """
    payload = {
        "claim_id": "CLM-INCOMP-200",
        "policy_id": "POL-INCOMP-200",
        "claim_type": "property",
        "state": "FL",
        "policyholder_tenure_years": 3.0,
        "previous_claims_count": 0,
        "incident_date": "2024-04-01",
        "claim_filed_date": "2024-04-05",
        "claim_amount": 18000.0,
        "deductible": 1000.0,
        "claim_description": "Water leak damaged wood floor.",
        "repair_estimate_amount": None,
        "supporting_documents_count": 0  # Missing evidence
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["claim_id"] == "CLM-INCOMP-200"
    assert data["final_recommendation"] == "REQUEST_ADDITIONAL_EVIDENCE"
    assert data["evidence_sufficiency"] == "incomplete"
    assert "fraud" not in data["final_recommendation"].lower()

def test_predict_contradictory_claim_routes_to_siu():
    """
    Validates that temporal causality violations and extreme estimate inflation
    route to SIU_FRAUD_INVESTIGATION.
    """
    payload = {
        "claim_id": "CLM-CONTR-300",
        "policy_id": "POL-CONTR-300",
        "claim_type": "auto",
        "state": "NY",
        "policyholder_tenure_years": 0.2,  # Brand new policy
        "previous_claims_count": 2,
        "incident_date": "2024-06-20",
        "claim_filed_date": "2024-06-15",  # Filed BEFORE incident!
        "claim_amount": 75000.0,           # Huge claim
        "deductible": 500.0,
        "repair_estimate_amount": 25000.0, # Claim is 3x estimate
        "claim_description": "Complete total loss collision.",
        "police_report_available": False,
        "supporting_documents_count": 0
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["claim_id"] == "CLM-CONTR-300"
    assert data["final_recommendation"] == "SIU_FRAUD_INVESTIGATION"
    assert data["investigation_priority"] == "urgent_high_risk"
    assert len(data["rules_triggered"]) > 0
    assert len(data["evidence_discrepancies"]) > 0
    assert data["composite_risk_score"] > 0.50

def test_predict_lakehouse_claim():
    """
    Tests scoring an existing claim retrieved from the Lakehouse Gold Feature Store.
    """
    response = client.post("/predict/lakehouse", json={"claim_id": "CLM-0000018756"})
    assert response.status_code == 200
    data = response.json()
    assert data["claim_id"] == "CLM-0000018756"
    assert "final_recommendation" in data
    assert "composite_risk_score" in data
    assert "laya_model_output" in data

def test_predict_lakehouse_nonexistent_claim():
    response = client.post("/predict/lakehouse", json={"claim_id": "NON_EXISTENT_CLAIM_ID_9999"})
    assert response.status_code == 404
