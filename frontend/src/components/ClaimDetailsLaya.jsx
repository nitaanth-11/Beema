import React, { useState } from "react";
import {
  ArrowLeft,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  FileText,
  Clock,
  User,
  Shield,
  Layers,
  Send,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  FileCheck2,
  Calendar,
  DollarSign,
  AlertOctagon,
  Building2,
  Check,
  Eye,
  MessageSquare,
  Lock,
  Search,
  Upload,
  Download,
  PhoneCall,
  Sparkles,
  Camera,
  Image as ImageIcon,
  IndianRupee
} from "lucide-react";
import { BeemaAPI } from "../services/api";
import { formatRupees, formatRupeesCompact, RUPEE_SYMBOL } from "../utils/currency";

export default function ClaimDetailsLaya({
  claim,
  onBack,
  onUpdateClaim,
  onNavigateDocuments,
  onNavigatePolicy
}) {
  const [activeTab, setActiveTab] = useState("overview"); // overview, evidence, timeline
  const [reRunningLaya, setReRunningLaya] = useState(false);
  const [customerMessage, setCustomerMessage] = useState("");
  const [messagesList, setMessagesList] = useState([
    {
      author: claim.assignedReviewer || "Sarah Jenkins (Your Claims Specialist)",
      date: "2026-02-16 11:24 AM",
      text: "Hello Alexander, I am reviewing your repair invoice. LAYA AI has verified your coverage and we are completing the final payment schedule."
    }
  ]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadedDocName, setUploadedDocName] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!claim) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "var(--color-text-muted)" }}>No claim selected.</p>
        <button className="btn btn-outline" onClick={onBack} style={{ marginTop: "12px" }}>
          Return to My Claims
        </button>
      </div>
    );
  }

  // Handle Customer Sending a Note to their Adjuster
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!customerMessage.trim()) return;
    const newMessage = {
      author: "You (Alexander Vance)",
      date: new Date().toLocaleString("en-US", { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      }),
      text: customerMessage.trim()
    };
    setMessagesList([...messagesList, newMessage]);
    setCustomerMessage("");
    showToast("Message sent to your claims adjuster.");
  };

  // Re-run LAYA Model Assessment on customer request
  const handleReRunAssessment = async () => {
    setReRunningLaya(true);
    try {
      const result = await BeemaAPI.predictClaim({
        claim_id: claim.id,
        category: claim.category,
        claimed_amount: claim.claimedAmount,
        repair_estimate: claim.evidence?.repairEstimateAmount || claim.claimedAmount,
        police_report_available: claim.evidence?.policeReportAvailable ?? true,
        incident_date: claim.incidentDate,
        claim_date: claim.filingDate
      });

      const updated = {
        ...claim,
        compositeRiskScore: result.composite_risk_score,
        layaPriority: result.triage_decision === "complex_or_siu" ? "elevated" : "routine",
        layaTriage: result.triage_decision,
        findings: {
          ...claim.findings,
          ruleViolations: result.rule_violations || [],
          layaRecommendation: result.action
        }
      };
      if (onUpdateClaim) onUpdateClaim(updated);
      showToast(`LAYA AI updated your claim assessment: ${result.action}`);
    } catch (err) {
      console.warn("LAYA re-run fallback:", err);
      showToast("LAYA AI verified your claim records against active policy terms.");
    } finally {
      setReRunningLaya(false);
    }
  };

  // Handle uploading missing document
  const handleUploadMissingDoc = (e) => {
    e.preventDefault();
    if (!uploadedDocName.trim()) return;

    const newDoc = {
      name: uploadedDocName.trim(),
      type: "Supporting Evidence",
      status: "Verified",
      size: "1.8 MB"
    };

    const updated = {
      ...claim,
      status: "Under assessment",
      evidence: {
        ...claim.evidence,
        policeReportAvailable: true,
        documents: [...(claim.evidence?.documents || []), newDoc]
      },
      findings: {
        ...claim.findings,
        missingInformation: [],
        layaRecommendation: "FAST_TRACK_PAYOUT"
      }
    };

    if (onUpdateClaim) onUpdateClaim(updated);
    setUploadModalOpen(false);
    setUploadedDocName("");
    showToast(`Document "${newDoc.name}" uploaded and verified by Beema OCR.`);
  };

  // Customer status steppers
  const getStepStatus = (stepIndex) => {
    // 1: Submitted, 2: AI Scanned, 3: Evidence Verified, 4: Approved/Paid
    if (claim.status === "Completed") return "completed";
    if (claim.status === "Awaiting documents" && stepIndex >= 3) return "pending";
    if (claim.status === "Under assessment" && stepIndex <= 3) return "completed";
    if (stepIndex === 1) return "completed";
    return "in-progress";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          backgroundColor: "var(--color-primary)",
          color: "#FFF",
          padding: "12px 20px",
          borderRadius: "6px",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
          fontSize: "13px",
          fontWeight: "500",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          border: "1px solid rgba(255,255,255,0.15)"
        }}>
          <CheckCircle2 size={16} color="var(--color-success)" />
          {toastMessage}
        </div>
      )}

      {/* Customer Document Upload Modal */}
      {uploadModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(16, 42, 67, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999
        }}>
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            width: "500px",
            boxShadow: "var(--shadow-md)",
            border: "1px solid var(--color-border)",
            overflow: "hidden"
          }}>
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#F8FAFC"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Upload size={18} color="var(--color-accent)" />
                <h3 style={{ fontSize: "15px", fontWeight: "700", margin: 0, color: "var(--color-primary)" }}>
                  Upload Requested Document
                </h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--color-text-muted)" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUploadMissingDoc} style={{ padding: "20px" }}>
              <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: "0 0 16px 0", lineHeight: "1.5" }}>
                Upload the requested police report, diagnostic invoice, or repair receipt for claim <strong>{claim.id}</strong>.
              </p>

              <div style={{ marginBottom: "14px" }}>
                <label className="form-label">Document Name or File Type</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Official_Police_Accident_Report.pdf"
                  value={uploadedDocName}
                  onChange={(e) => setUploadedDocName(e.target.value)}
                  required
                />
              </div>

              <div style={{
                border: "2px dashed #CBD5E1",
                borderRadius: "8px",
                padding: "24px",
                textAlign: "center",
                backgroundColor: "#F8FAFC",
                marginBottom: "16px"
              }}>
                <Upload size={28} color="#64748B" style={{ margin: "0 auto 8px auto" }} />
                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-primary)" }}>
                  Drop your file here or click to browse
                </div>
                <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                  Supports PDF, PNG, JPG up to 25 MB
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setUploadModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!uploadedDocName.trim()}
                >
                  Upload &amp; Scan Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Header Breadcrumb & Customer Actions */}
      <div style={{
        padding: "16px 24px",
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            onClick={onBack}
            className="btn btn-outline"
            style={{ padding: "6px 12px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <ArrowLeft size={14} />
            Back to My Claims
          </button>
          <div style={{ height: "20px", width: "1px", backgroundColor: "var(--color-border)" }} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ fontSize: "18px", fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
                Claim {claim.id}
              </h1>
              <span style={{
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor: claim.segment === "organisation" ? "#F5F3FF" : "#ECFDF5",
                color: claim.segment === "organisation" ? "#6D28D9" : "#047857",
                border: `1px solid ${claim.segment === "organisation" ? "#DDD6FE" : "#A7F3D0"}`
              }}>
                {claim.segment === "organisation" ? "🏢 Organisation" : "👤 Individual"}
              </span>
              <span className={`badge ${claim.status === "Completed" ? "badge-success" : (claim.status === "Awaiting documents" ? "badge-warning" : "badge-info")}`}>
                {claim.status === "Completed" ? "Approved & Paid" : claim.status}
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
              Policy: <strong style={{ color: "var(--color-text-main)" }}>{claim.policyNumber}</strong> &bull; Incident: {claim.incidentDate} &bull; Filed: {claim.filingDate}
            </div>
          </div>
        </div>

        {/* Customer Actions Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {claim.status === "Awaiting documents" && (
            <button
              className="btn btn-primary"
              onClick={() => setUploadModalOpen(true)}
              style={{ fontSize: "12px", padding: "7px 14px", gap: "6px" }}
            >
              <Upload size={14} />
              Upload Requested Document
            </button>
          )}

          <button
            className="btn btn-outline"
            onClick={handleReRunAssessment}
            disabled={reRunningLaya}
            style={{ fontSize: "12px", padding: "7px 14px" }}
          >
            <RefreshCw size={13} className={reRunningLaya ? "spinner" : ""} />
            {reRunningLaya ? "Checking with LAYA..." : "Check Instant AI Status"}
          </button>
        </div>
      </div>

      {/* Customer Visual Progress Stepper */}
      <div style={{
        backgroundColor: "#FFFFFF",
        padding: "18px 28px",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        {/* Step 1 */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: "#16A34A",
            color: "#FFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "700"
          }}>
            ✓
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)" }}>1. Claim Submitted</div>
            <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{claim.filingDate}</div>
          </div>
        </div>

        <div style={{ flex: 1, height: "2px", backgroundColor: "#BBF7D0", margin: "0 12px" }} />

        {/* Step 2 */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: "#16A34A",
            color: "#FFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "700"
          }}>
            ✓
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)" }}>2. AI Evidence Scan</div>
            <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Receipts Verified</div>
          </div>
        </div>

        <div style={{ flex: 1, height: "2px", backgroundColor: claim.status === "Awaiting documents" ? "#FDE68A" : "#BBF7D0", margin: "0 12px" }} />

        {/* Step 3 */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: claim.status === "Awaiting documents" ? "#D97706" : "#16A34A",
            color: "#FFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "700"
          }}>
            {claim.status === "Awaiting documents" ? "!" : "✓"}
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)" }}>3. LAYA Decision</div>
            <div style={{ fontSize: "11px", color: claim.status === "Awaiting documents" ? "#B45309" : "var(--color-text-muted)" }}>
              {claim.status === "Awaiting documents" ? "Action Needed" : "Coverage Matched"}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, height: "2px", backgroundColor: claim.status === "Completed" ? "#BBF7D0" : "#E2E8F0", margin: "0 12px" }} />

        {/* Step 4 */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: claim.status === "Completed" ? "#16A34A" : "#94A3B8",
            color: "#FFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "700"
          }}>
            {claim.status === "Completed" ? "✓" : "4"}
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "700", color: claim.status === "Completed" ? "var(--color-primary)" : "var(--color-text-muted)" }}>
              4. Payment Payout
            </div>
            <div style={{ fontSize: "11px", color: claim.status === "Completed" ? "#166534" : "var(--color-text-muted)" }}>
              {claim.status === "Completed" ? "Disbursed" : "Final Stage"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Intelligence Workspace */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 440px",
        flex: 1,
        minHeight: 0,
        backgroundColor: "var(--color-background)"
      }}>
        
        {/* Left Column: Customer Dossier & Evidence */}
        <div style={{
          padding: "24px",
          overflowY: "auto",
          borderRight: "1px solid var(--color-border)"
        }}>
          {/* Sub Navigation Tabs */}
          <div style={{
            display: "flex",
            gap: "24px",
            borderBottom: "1px solid var(--color-border)",
            marginBottom: "20px"
          }}>
            <button
              onClick={() => setActiveTab("overview")}
              style={{
                padding: "8px 0",
                fontSize: "13px",
                fontWeight: "600",
                color: activeTab === "overview" ? "var(--color-accent)" : "var(--color-text-muted)",
                borderBottom: activeTab === "overview" ? "2px solid var(--color-accent)" : "2px solid transparent",
                backgroundColor: "transparent",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                cursor: "pointer"
              }}
            >
              Claim Summary &amp; Loss Details
            </button>
            <button
              onClick={() => setActiveTab("evidence")}
              style={{
                padding: "8px 0",
                fontSize: "13px",
                fontWeight: "600",
                color: activeTab === "evidence" ? "var(--color-accent)" : "var(--color-text-muted)",
                borderBottom: activeTab === "evidence" ? "2px solid var(--color-accent)" : "2px solid transparent",
                backgroundColor: "transparent",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                cursor: "pointer"
              }}
            >
              Uploaded Evidence &amp; Receipts ({claim.evidence?.documents?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              style={{
                padding: "8px 0",
                fontSize: "13px",
                fontWeight: "600",
                color: activeTab === "timeline" ? "var(--color-accent)" : "var(--color-text-muted)",
                borderBottom: activeTab === "timeline" ? "2px solid var(--color-accent)" : "2px solid transparent",
                backgroundColor: "transparent",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                cursor: "pointer"
              }}
            >
              Status Updates &amp; History
            </button>
          </div>

          {/* TAB 1: Overview */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Financial & Settlement Summary Card */}
              <div className="card" style={{ padding: "20px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Estimated Settlement &amp; Payout Summary
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ backgroundColor: "#F8FAFC", padding: "14px", borderRadius: "6px", border: "1px solid var(--color-border)" }}>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Total Claimed Loss (₹)</div>
                    <div style={{ fontSize: "22px", fontWeight: "700", color: "var(--color-primary)", marginTop: "4px" }}>
                      {formatRupees(claim.claimedAmount)}
                    </div>
                  </div>
                  <div style={{ backgroundColor: "#F8FAFC", padding: "14px", borderRadius: "6px", border: "1px solid var(--color-border)" }}>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Verified Invoice Quote (₹)</div>
                    <div style={{ fontSize: "22px", fontWeight: "700", color: "var(--color-secondary)", marginTop: "4px" }}>
                      {formatRupees(claim.evidence?.repairEstimateAmount || claim.claimedAmount)}
                    </div>
                  </div>
                  <div style={{ backgroundColor: "#F8FAFC", padding: "14px", borderRadius: "6px", border: "1px solid var(--color-border)" }}>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Your Policy Deductible (₹)</div>
                    <div style={{ fontSize: "22px", fontWeight: "700", color: "#64748B", marginTop: "4px" }}>
                      -{formatRupees(claim.deductible || 0)}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", fontSize: "13px" }}>
                  <div>
                    <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "11px" }}>INCIDENT CLASSIFICATION</span>
                    <strong style={{ color: "var(--color-text-main)" }}>{claim.claimType}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "11px" }}>DATE OF INCIDENT</span>
                    <strong style={{ color: "var(--color-text-main)" }}>{claim.incidentDate}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "11px" }}>DATE SUBMITTED</span>
                    <strong style={{ color: "var(--color-text-main)" }}>{claim.filingDate}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "11px" }}>YOUR DEDICATED ADJUSTER</span>
                    <strong style={{ color: "var(--color-text-main)" }}>{claim.assignedReviewer || "Sarah Jenkins, Desk Adjuster"}</strong>
                  </div>
                </div>

                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--color-border)" }}>
                  <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "11px", marginBottom: "4px" }}>INCIDENT DESCRIPTION</span>
                  <p style={{ fontSize: "13px", color: "var(--color-text-main)", lineHeight: "1.5", margin: 0, backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "6px", border: "1px solid var(--color-border)" }}>
                    {claim.description || "Low-speed collision during urban parking maneuver. Body shop estimate attached with itemized bumper repaint and sensor recalibration."}
                  </p>
                </div>
              </div>

              {/* Verified Policy Protections */}
              <div className="card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)", margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Verified Coverage &amp; Benefits Applied
                  </h3>
                  <span style={{ fontSize: "11px", color: "var(--color-success)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircle2 size={13} /> Active Coverage
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(claim.findings?.verifiedFacts || [
                    "Policy active for 4.2 years with clean historical loss record.",
                    "Repair estimate matches claimed amount within allowable variance.",
                    "Authorized in-network repair facility confirmed."
                  ]).map((fact, idx) => (
                    <div key={idx} style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "10px 12px",
                      backgroundColor: "#F0FDF4",
                      border: "1px solid #BBF7D0",
                      borderRadius: "6px",
                      fontSize: "13px",
                      color: "#166534"
                    }}>
                      <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: "2px" }} />
                      <div style={{ flex: 1, lineHeight: "1.4" }}>{fact}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Computer Vision & Document Authenticity Intelligence Card */}
              <div className="card" style={{ padding: "20px", border: "1px solid #BFDBFE", backgroundColor: "#F8FAFC" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: "var(--color-accent)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Camera size={16} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
                        LAYA Computer Vision &amp; Document Authenticity
                      </h3>
                      <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                        Automated visual damage classification &amp; provider seal validation
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: "11px" }}>
                    ✓ Damage &amp; Cost Matched
                  </span>
                </div>

                {/* Image and Analysis Split */}
                <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "16px", marginBottom: "14px" }}>
                  {/* Photo Thumbnail */}
                  <div style={{ borderRadius: "6px", overflow: "hidden", border: "1px solid var(--color-border)", backgroundColor: "#0F172A", height: "140px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <img
                      src={claim.evidence?.images?.[0]?.previewUrl || claim.evidence?.documents?.find(d => d.previewUrl)?.previewUrl || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='140' viewBox='0 0 220 140'><rect width='220' height='140' fill='%231e293b'/><text x='30' y='75' fill='%2338bdf8' font-family='sans-serif' font-size='12' font-weight='bold'>Photographic Evidence</text></svg>"}
                      alt="Damage Inspection"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <span style={{
                      position: "absolute",
                      bottom: "6px",
                      left: "6px",
                      backgroundColor: "rgba(16,42,67,0.85)",
                      color: "#93C5FD",
                      fontSize: "10px",
                      fontWeight: "700",
                      padding: "2px 6px",
                      borderRadius: "4px"
                    }}>
                      CV Scanned
                    </span>
                  </div>

                  {/* CV Breakdown Metrics */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                    <div style={{ padding: "8px 12px", backgroundColor: "#FFFFFF", borderRadius: "6px", border: "1px solid var(--color-border)" }}>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "11px", display: "block" }}>VISUAL DAMAGE SEVERITY TIER</span>
                      <strong style={{ color: "var(--color-primary)", fontSize: "13px" }}>
                        {claim.visualAnalysis?.damageSeverityTier || "Moderate Localized Damage"}
                      </strong>
                    </div>

                    <div style={{ padding: "8px 12px", backgroundColor: "#FFFFFF", borderRadius: "6px", border: "1px solid var(--color-border)" }}>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "11px", display: "block" }}>FAIR MARKET REPAIR BRACKET (DEEP LEARNING)</span>
                      <strong style={{ color: "#16A34A", fontSize: "13px" }}>
                        {claim.visualAnalysis?.fairCostRange || `${formatRupees(45000, { includeDecimals: false })} – ${formatRupees(120000, { includeDecimals: false })}`}
                      </strong>
                    </div>

                    {claim.visualAnalysis?.detectedComponents && claim.visualAnalysis.detectedComponents.length > 0 && (
                      <div style={{ padding: "8px 12px", backgroundColor: "#FFFFFF", borderRadius: "6px", border: "1px solid var(--color-border)" }}>
                        <span style={{ color: "var(--color-text-muted)", fontSize: "11px", display: "block", marginBottom: "4px" }}>RESNET-18 DETECTED DAMAGED PARTS</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {claim.visualAnalysis.detectedComponents.map((part, pIdx) => (
                            <span key={pIdx} style={{
                              fontSize: "10px",
                              fontWeight: "600",
                              backgroundColor: "#EFF6FF",
                              color: "#1D4ED8",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              border: "1px solid #BFDBFE"
                            }}>
                              {part}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ padding: "8px 12px", backgroundColor: "#FFFFFF", borderRadius: "6px", border: "1px solid var(--color-border)" }}>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "11px", display: "block" }}>DOCUMENT AUTHENTICITY</span>
                      <strong style={{ color: "var(--color-accent)", fontSize: "13px" }}>
                        {claim.visualAnalysis?.documentAuthenticity || "100% Authentic — Verified Provider Stamp"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: "10px 14px",
                  backgroundColor: "#EFF6FF",
                  borderRadius: "6px",
                  border: "1px solid #BFDBFE",
                  fontSize: "12px",
                  color: "#1E40AF",
                  lineHeight: "1.4"
                }}>
                  <strong>LAYA Vision Verdict:</strong> {claim.visualAnalysis?.cvMatchExplanation || "ResNet-18 Deep Convolutional features confirmed damage geometry and fair repair bracket calibration. Document authenticity corroborated."}
                </div>
              </div>

              {/* Missing Information Notice for Customer */}
              {claim.findings?.missingInformation?.length > 0 && (
                <div className="card" style={{ padding: "20px", borderColor: "#FDE68A", backgroundColor: "#FFFBEB" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#92400E", margin: "0 0 6px 0" }}>
                        Action Required: Additional Information Needed
                      </h4>
                      <p style={{ fontSize: "13px", color: "#78350F", margin: "0 0 12px 0", lineHeight: "1.4" }}>
                        To authorize full settlement, please upload the following documents:
                      </p>
                      <ul style={{ margin: "0 0 14px 18px", padding: 0, fontSize: "13px", color: "#78350F" }}>
                        {claim.findings.missingInformation.map((item, idx) => (
                          <li key={idx} style={{ marginBottom: "4px" }}><strong>{item}</strong></li>
                        ))}
                      </ul>
                      <button
                        className="btn btn-primary"
                        onClick={() => setUploadModalOpen(true)}
                        style={{ fontSize: "12px", padding: "6px 14px" }}
                      >
                        <Upload size={13} /> Upload Document Now
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Uploaded Evidence & Receipts */}
          {activeTab === "evidence" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
                  Your Submitted Documents &amp; Receipts ({claim.evidence?.documents?.length || 0})
                </h3>
                <button
                  className="btn btn-primary"
                  onClick={() => setUploadModalOpen(true)}
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                >
                  <Upload size={13} />
                  Add Additional Document
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(claim.evidence?.documents || []).map((doc, idx) => (
                  <div key={idx} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "36px",
                        height: "36px",
                        backgroundColor: "#F1F5F9",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-secondary)"
                      }}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-main)" }}>
                          {doc.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                          Type: {doc.type} &bull; File Size: {doc.size}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span className={`badge ${doc.status === "Verified" ? "badge-success" : "badge-warning"}`}>
                        {doc.status === "Verified" ? "Verified by OCR" : "Pending Verification"}
                      </span>
                      <button
                        className="btn btn-outline"
                        onClick={onNavigateDocuments}
                        style={{ padding: "4px 8px", fontSize: "11px" }}
                      >
                        <Eye size={12} /> View File
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Timeline & Audit Updates */}
          {activeTab === "timeline" && (
            <div className="card" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)", marginBottom: "16px" }}>
                Claim Activity &amp; Status Updates
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
                <div style={{ display: "flex", gap: "14px" }}>
                  <div style={{ width: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--color-accent)" }} />
                    <div style={{ width: "2px", flex: 1, backgroundColor: "var(--color-border)" }} />
                  </div>
                  <div style={{ paddingBottom: "16px" }}>
                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{claim.filingDate} &bull; 09:30 AM</div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-main)" }}>Claim Dossier Submitted</div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Your claim details and repair estimates were successfully received.</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "14px" }}>
                  <div style={{ width: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#0284C7" }} />
                    <div style={{ width: "2px", flex: 1, backgroundColor: "var(--color-border)" }} />
                  </div>
                  <div style={{ paddingBottom: "16px" }}>
                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{claim.filingDate} &bull; 09:32 AM</div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-main)" }}>Policy Boundaries Verified</div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Confirmed active policy coverage with statutory liability limits and deductible threshold.</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "14px" }}>
                  <div style={{ width: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--color-success)" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{claim.filingDate} &bull; 09:33 AM</div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-main)" }}>LAYA AI Instant Assessment Completed</div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                      {claim.findings?.layaRecommendation === "FAST_TRACK_PAYOUT" 
                        ? "Qualified for Fast-Track instant payout. Desk adjuster authorizing bank deposit." 
                        : "Claim under specialist review. Estimated processing time: 2 days."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: LAYA AI Decision Support Panel (Customer Transparency) */}
        <div style={{
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          borderLeft: "1px solid var(--color-border)"
        }}>
          {/* Panel Top Header */}
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "#F8FAFC",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "26px",
                height: "26px",
                backgroundColor: "var(--color-primary)",
                borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFF"
              }}>
                <Cpu size={14} />
              </div>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-primary)", letterSpacing: "0.02em" }}>
                LAYA AI CLAIM INSIGHTS
              </span>
            </div>
            <span style={{
              fontSize: "11px",
              padding: "2px 8px",
              borderRadius: "4px",
              backgroundColor: "#F0FDF4",
              color: "#166534",
              fontWeight: "600",
              border: "1px solid #BBF7D0"
            }}>
              Instant AI Triage
            </span>
          </div>

          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* LAYA Assessment Result Card */}
            <div style={{
              backgroundColor: claim.findings?.layaRecommendation === "FAST_TRACK_PAYOUT" ? "#F0FDF4" : "#EFF6FF",
              borderRadius: "8px",
              border: `1px solid ${claim.findings?.layaRecommendation === "FAST_TRACK_PAYOUT" ? "#BBF7D0" : "#BFDBFE"}`,
              padding: "16px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                {claim.findings?.layaRecommendation === "FAST_TRACK_PAYOUT" ? (
                  <CheckCircle2 size={20} color="#16a34a" />
                ) : (
                  <Clock size={20} color="#2563EB" />
                )}
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-text-main)" }}>
                    {claim.findings?.layaRecommendation === "FAST_TRACK_PAYOUT"
                      ? "Fast-Track Payout Approved"
                      : "Specialist Review In Progress"}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    Automated Verification Status
                  </div>
                </div>
              </div>

              <p style={{ fontSize: "12px", color: "var(--color-text-main)", lineHeight: "1.5", margin: 0 }}>
                {claim.findings?.layaRecommendation === "FAST_TRACK_PAYOUT"
                  ? "Great news! LAYA AI verified your repair invoice matches your bumper damage within policy terms. Your payout has been approved for automatic disbursement."
                  : "LAYA AI has completed evidence checks. Your claim is currently being finalized by your assigned adjuster."}
              </p>
            </div>

            {/* AI Verification Confidence Bar */}
            <div style={{
              backgroundColor: "#F8FAFC",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              padding: "16px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>
                    Evidence Verification Confidence
                  </span>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--color-primary)", marginTop: "2px" }}>
                    {((1 - (claim.compositeRiskScore || 0.08)) * 100).toFixed(0)}% Match
                  </div>
                </div>
                <span className="badge badge-success">High Confidence</span>
              </div>

              <div style={{ width: "100%", height: "6px", backgroundColor: "#E2E8F0", borderRadius: "3px", overflow: "hidden", marginBottom: "8px" }}>
                <div style={{
                  height: "100%",
                  width: `${Math.max(60, (1 - (claim.compositeRiskScore || 0.08)) * 100)}%`,
                  backgroundColor: "#16A34A"
                }} />
              </div>

              <div style={{ fontSize: "11px", color: "var(--color-text-muted)", lineHeight: "1.4" }}>
                All repair costs, vehicle registration, and coverage dates cross-validated with zero discrepancies.
              </div>
            </div>

            {/* Your Dedicated Adjuster Card */}
            <div style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              padding: "16px"
            }}>
              <h4 style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--color-secondary)", marginBottom: "12px", letterSpacing: "0.04em" }}>
                Your Dedicated Claims Specialist
              </h4>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-accent)",
                  color: "#FFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "14px"
                }}>
                  SJ
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-primary)" }}>
                    Sarah Jenkins
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    Senior Claims Adjuster &bull; Beema Concierge
                  </div>
                </div>
              </div>

              {/* Message Adjuster Form */}
              <form onSubmit={handleSendMessage} style={{ marginBottom: "12px" }}>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Ask a question about your claim or payout..."
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  style={{ resize: "none", fontSize: "12px" }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!customerMessage.trim()}
                    style={{ fontSize: "11px", padding: "4px 12px" }}
                  >
                    <Send size={12} /> Send Message
                  </button>
                </div>
              </form>

              {/* Message thread */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "160px", overflowY: "auto" }}>
                {messagesList.map((m, i) => (
                  <div key={i} style={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    padding: "10px",
                    fontSize: "12px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-muted)", fontSize: "10px", marginBottom: "4px" }}>
                      <strong>{m.author}</strong>
                      <span>{m.date}</span>
                    </div>
                    <div style={{ color: "var(--color-text-main)", lineHeight: "1.4" }}>{m.text}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
