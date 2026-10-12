import React, { useState } from "react";
import {
  FileCheck2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Search,
  ExternalLink,
  Download,
  Filter,
  Check,
  RefreshCw,
  MessageSquare,
  FileQuestion,
  ShieldCheck,
  Building,
  Calendar,
  DollarSign,
  Upload,
  Plus
} from "lucide-react";
import { INSURANCE_CATEGORIES } from "../data/mockClaims";

export default function DocumentVerification({ currentCategory, claims = [] }) {
  const categoryInfo = INSURANCE_CATEGORIES.find((c) => c.id === currentCategory) || INSURANCE_CATEGORIES[0];

  // Compile all documents belonging to the policyholder's claims in this category
  const categoryClaims = claims.filter((c) => c.category === currentCategory);

  const initialDocs = categoryClaims.flatMap((c) => {
    return (c.evidence?.documents || []).map((doc, idx) => ({
      ...doc,
      id: `${c.id}-DOC-${idx + 1}`,
      claimId: c.id,
      claimantName: c.claimantName,
      claimedAmount: c.claimedAmount,
      incidentDate: c.incidentDate,
      extractedFields: [
        {
          label: "Billed / Invoiced Amount",
          docValue: `$${(c.evidence?.repairEstimateAmount || c.claimedAmount).toFixed(2)}`,
          claimValue: `$${c.claimedAmount.toFixed(2)}`,
          status: Math.abs((c.evidence?.repairEstimateAmount || c.claimedAmount) - c.claimedAmount) < 50 ? "Verified Match" : "Discrepancy"
        },
        {
          label: "Incident / Service Date",
          docValue: c.incidentDate,
          claimValue: c.incidentDate,
          status: "Verified Match"
        },
        {
          label: "Named Insured / Payee",
          docValue: c.claimantName.split(" (")[0],
          claimValue: c.claimantName.split(" (")[0],
          status: "Verified Match"
        },
        {
          label: "Authorized Provider Network",
          docValue: doc.status === "Verified" ? "Certified Auto Network" : "Pending Check",
          claimValue: "Approved Provider",
          status: doc.status === "Verified" ? "Verified Match" : "Under Review"
        }
      ]
    }));
  });

  const [documentsList, setDocumentsList] = useState(initialDocs);
  const [selectedDocId, setSelectedDocId] = useState(initialDocs[0]?.id || null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocCategory, setNewDocCategory] = useState("Receipt");
  const [notification, setNotification] = useState(null);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const selectedDoc = documentsList.find((d) => d.id === selectedDocId) || documentsList[0];

  const handleUploadNewDoc = (e) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    const newDoc = {
      id: `CLM-${categoryInfo.id.toUpperCase()}-DOC-${Date.now()}`,
      name: newDocTitle.trim(),
      type: newDocCategory,
      status: "Verified",
      size: "2.1 MB",
      claimId: categoryClaims[0]?.id || "CLM-MTR-2026-081",
      claimantName: "Alexander Vance",
      claimedAmount: 2450.00,
      incidentDate: "2026-02-15",
      extractedFields: [
        {
          label: "Billed / Invoiced Amount",
          docValue: "$2,450.00",
          claimValue: "$2,450.00",
          status: "Verified Match"
        },
        {
          label: "Service Date",
          docValue: "2026-02-15",
          claimValue: "2026-02-15",
          status: "Verified Match"
        }
      ]
    };

    setDocumentsList([newDoc, ...documentsList]);
    setSelectedDocId(newDoc.id);
    setUploadModalOpen(false);
    setNewDocTitle("");
    notify(`Document "${newDoc.name}" uploaded and verified by Beema AI OCR.`);
  };

  const filteredDocs = documentsList.filter((doc) => {
    if (filterStatus === "all") return true;
    return doc.status.toLowerCase().includes(filterStatus.toLowerCase());
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      {/* Toast Alert */}
      {notification && (
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
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <CheckCircle2 size={16} color="var(--color-success)" />
          {notification}
        </div>
      )}

      {/* Upload Document Modal */}
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
                  Upload New Receipt or Document
                </h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUploadNewDoc} style={{ padding: "20px" }}>
              <div style={{ marginBottom: "14px" }}>
                <label className="form-label">Document Title or File Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Body_Shop_Itemized_Invoice.pdf"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Document Classification</label>
                <select
                  className="form-input"
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value)}
                >
                  <option value="Repair Invoice">Repair Invoice / Estimate</option>
                  <option value="Police Report">Police Accident Report</option>
                  <option value="Photo Evidence">Photographic Damage Evidence</option>
                  <option value="Medical Bill">Hospital / Medical Bill</option>
                  <option value="Towing Receipt">Towing / Transport Receipt</option>
                </select>
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
                  Drop files here or click to choose from your device
                </div>
                <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                  PDF, JPG, PNG up to 25 MB. Beema AI scans &amp; verifies instantly.
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
                  disabled={!newDocTitle.trim()}
                >
                  Upload &amp; Scan Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div style={{
        padding: "20px 24px",
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
              My Uploaded Documents &amp; Evidence Vault
            </h1>
            <span style={{ fontSize: "11px", backgroundColor: "#EFF6FF", color: "var(--color-accent)", fontWeight: "600", padding: "2px 8px", borderRadius: "4px" }}>
              {categoryInfo.name} Vault
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: "4px 0 0 0" }}>
            View your uploaded repair quotes, police reports, and receipts with real-time Beema AI OCR verification.
          </p>
        </div>

        {/* Upload Action */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: "12px", gap: "6px" }}
          >
            <Upload size={14} />
            <span>Upload New Document</span>
          </button>
        </div>
      </div>

      {/* Workspace Grid Layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "360px 1fr",
        flex: 1,
        minHeight: 0,
        backgroundColor: "var(--color-background)"
      }}>
        {/* Left Column: My Document List */}
        <div style={{
          borderRight: "1px solid var(--color-border)",
          backgroundColor: "#FFFFFF",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--color-border)", backgroundColor: "#F8FAFC", fontSize: "12px", fontWeight: "600", color: "var(--color-secondary)" }}>
            MY UPLOADED FILES ({filteredDocs.length})
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  style={{
                    padding: "14px 18px",
                    borderBottom: "1px solid var(--color-border)",
                    backgroundColor: isSelected ? "#F1F5F9" : "transparent",
                    borderLeft: isSelected ? "3px solid var(--color-accent)" : "3px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-main)" }}>
                      {doc.name}
                    </div>
                    <span className={`badge ${doc.status === "Verified" ? "badge-success" : "badge-warning"}`} style={{ fontSize: "10px" }}>
                      {doc.status}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    For Claim: <strong style={{ color: "var(--color-primary)" }}>{doc.claimId}</strong> &bull; {doc.type}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                    File Size: {doc.size}
                  </div>
                </div>
              );
            })}

            {filteredDocs.length === 0 && (
              <div style={{ padding: "32px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "13px" }}>
                No documents found in this view.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Document Details & AI Verification Details */}
        {selectedDoc ? (
          <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Header Card */}
            <div style={{
              backgroundColor: "#FFFFFF",
              padding: "18px 22px",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
                    {selectedDoc.name}
                  </h2>
                  <span className={`badge ${selectedDoc.status === "Verified" ? "badge-success" : "badge-warning"}`}>
                    {selectedDoc.status === "Verified" ? "Verified & Matched" : "Review in Progress"}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                  Attached to Claim: <strong>{selectedDoc.claimId}</strong> &bull; Document Type: <strong>{selectedDoc.type}</strong>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn btn-outline"
                  onClick={() => notify(`Downloaded copy of ${selectedDoc.name}`)}
                  style={{ fontSize: "12px" }}
                >
                  <Download size={13} />
                  Download
                </button>
              </div>
            </div>

            {/* Document Verification Matrix */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {/* Left Panel: Document Paper Preview */}
              <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-secondary)", margin: 0, textTransform: "uppercase" }}>
                    Uploaded Document Preview
                  </h3>
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Verified Copy</span>
                </div>

                <div style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px dashed var(--color-border)",
                  borderRadius: "6px",
                  padding: "24px",
                  flex: 1,
                  minHeight: "260px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  color: "#334155",
                  lineHeight: "1.6"
                }}>
                  <div style={{ borderBottom: "1px solid #CBD5E1", paddingBottom: "10px", marginBottom: "12px", fontWeight: "bold" }}>
                    --- OFFICIAL DOCUMENT RECORD: {selectedDoc.name} ---
                  </div>
                  <div>CLAIM_REF: {selectedDoc.claimId}</div>
                  <div>ISSUER: Certified Auto Repair Network</div>
                  <div>DATE_OF_ISSUE: {selectedDoc.incidentDate}</div>
                  <div>ITEMIZED_TOTAL: {selectedDoc.extractedFields[0]?.docValue}</div>
                  <div style={{ marginTop: "14px", color: "#166534", fontSize: "11px" }}>
                    ✓ LAYA AI OCR Result: 100% legibility. Itemized parts & labor corroborated with policy terms.
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "11px", color: "var(--color-text-muted)" }}>
                  <span>Security: Encrypted Document Vault</span>
                  <span style={{ color: "var(--color-success)", fontWeight: "600" }}>✓ Integrity Verified</span>
                </div>
              </div>

              {/* Right Panel: What AI Extracted vs Claim */}
              <div className="card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-secondary)", margin: 0, textTransform: "uppercase" }}>
                    How Beema Read Your Document
                  </h3>
                  <span style={{ fontSize: "11px", color: "var(--color-success)", fontWeight: "600" }}>
                    ✓ Verified
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedDoc.extractedFields.map((field, idx) => (
                    <div key={idx} style={{
                      backgroundColor: "#F8FAFC",
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      padding: "10px 12px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                          {field.label}
                        </span>
                        <span className="badge badge-success" style={{ fontSize: "10px" }}>
                          {field.status}
                        </span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
                        <div>
                          <span style={{ color: "var(--color-text-muted)", fontSize: "10px", display: "block" }}>VALUE ON YOUR RECEIPT</span>
                          <strong style={{ color: "var(--color-text-main)" }}>{field.docValue}</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--color-text-muted)", fontSize: "10px", display: "block" }}>VALUE ON YOUR CLAIM</span>
                          <strong style={{ color: "var(--color-text-main)" }}>{field.claimValue}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
            Select a document from your list to view verification details.
          </div>
        )}
      </div>
    </div>
  );
}
