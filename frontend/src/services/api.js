// API Connector for Beema FastAPI Decision Engine & Visual Agent
const getFormattedApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:8000";
  if (!envUrl) return "http://localhost:8000";
  const trimmed = envUrl.trim().replace(/\/+$/, "");
  // Prepend protocol if host was injected without scheme (e.g., Vercel environment variables)
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

const API_BASE_URL = getFormattedApiBaseUrl();

export const BeemaAPI = {
  /**
   * Health check reporting model loaded state and lakehouse connection
   */
  async getHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn("Backend unavailable, using local mock status:", err.message);
      return {
        status: "healthy (offline demo)",
        model_loaded: true,
        using_fallback_mock: true,
        lakehouse_connected: false,
        error: err.message
      };
    }
  },

  /**
   * Evaluate a structured claim payload against Rules + Discrepancies + LAYA
   */
  async predictClaim(claimData) {
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claimData)
      });
      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Evaluation failed (${response.status}): ${errorDetail}`);
      }
      return await response.json();
    } catch (err) {
      console.error("API predictClaim error:", err);
      throw err;
    }
  },

  /**
   * Evaluate a claim record directly from Databricks Delta Lakehouse Gold Feature Store
   */
  async predictFromLakehouse(claimId) {
    try {
      const response = await fetch(`${API_BASE_URL}/predict/lakehouse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_id: claimId })
      });
      if (!response.ok) {
        throw new Error(`Lakehouse claim ${claimId} not found or failed (${response.status})`);
      }
      return await response.json();
    } catch (err) {
      console.error("API predictFromLakehouse error:", err);
      throw err;
    }
  },

  /**
   * Run Visual Insurance Agent (Damage scoring, cost matching, storm vs sledgehammer check)
   */
  async evaluateVisualClaim(visualPayload) {
    try {
      const response = await fetch(`${API_BASE_URL}/predict/visual-claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visualPayload)
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Visual assessment failed (${response.status}): ${errText}`);
      }
      return await response.json();
    } catch (err) {
      console.error("API evaluateVisualClaim error:", err);
      throw err;
    }
  },

  /**
   * Direct Deep Learning Damage & Cost Estimator using PyTorch ResNet-18
   */
  async estimateDeepDamage(analysisPayload) {
    try {
      const response = await fetch(`${API_BASE_URL}/predict/deep-damage-estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysisPayload)
      });
      if (!response.ok) {
        throw new Error(`Deep analysis failed: HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn("Deep damage estimation API error, using dynamic fallback:", err);
      throw err;
    }
  },

  /**
   * Document Verification & Letterhead Authenticity Agent
   * Validates institutional letterheads (Police for motor, Doctor/Hospital for medical, etc.)
   */
  async verifyDocument(documentPayload) {
    try {
      const response = await fetch(`${API_BASE_URL}/predict/verify-document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(documentPayload)
      });
      if (!response.ok) {
        throw new Error(`Document verification failed: HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn("Document verification API error, using fallback audit:", err);
      throw err;
    }
  }
};
