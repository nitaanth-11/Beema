import React, { useState, useMemo } from "react";
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  FileQuestion, 
  ShieldAlert, 
  ArrowUpDown, 
  Filter, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  TrendingDown,
  PlusCircle,
  CheckCircle2,
  Upload,
  ArrowRight,
  DollarSign,
  ShieldCheck,
  HelpCircle
} from "lucide-react";
import { INSURANCE_CATEGORIES } from "../data/mockClaims";

export default function WorkspaceDashboard({
  currentCategory,
  claims = [],
  onSelectClaim,
  onNavigateNewClaim,
  searchQuery = ""
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortField, setSortField] = useState("filingDate");
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const categoryInfo = INSURANCE_CATEGORIES.find((c) => c.id === currentCategory) || INSURANCE_CATEGORIES[0];

  // Claims belonging to current category
  const categoryClaims = useMemo(() => {
    return claims.filter((c) => c.category === currentCategory);
  }, [claims, currentCategory]);

  // Customer Operational Metrics
  const metrics = useMemo(() => {
    const total = categoryClaims.length;
    const inProgress = categoryClaims.filter((c) => c.status === "Under assessment" || c.status === "Requires human review").length;
    const needsCustomerAction = categoryClaims.filter((c) => c.status === "Awaiting documents").length;
    const completed = categoryClaims.filter((c) => c.status === "Completed").length;

    // Total settled payout amount
    const totalSettledPayout = categoryClaims
      .filter((c) => c.status === "Completed")
      .reduce((acc, curr) => acc + (curr.claimedAmount || 0), 0);

    return { total, inProgress, needsCustomerAction, completed, totalSettledPayout, avgProcessingDays: "2.1" };
  }, [categoryClaims]);

  // Filtered and Sorted Table Rows
  const filteredClaims = useMemo(() => {
    return categoryClaims.filter((claim) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesId = claim.id.toLowerCase().includes(q);
        const matchesName = (claim.claimantName || "").toLowerCase().includes(q);
        const matchesPolicy = (claim.policyNumber || "").toLowerCase().includes(q);
        const matchesDesc = (claim.description || "").toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesPolicy && !matchesDesc) return false;
      }

      if (statusFilter !== "all" && claim.status !== statusFilter) return false;
      if (priorityFilter !== "all" && claim.layaPriority !== priorityFilter) return false;

      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [categoryClaims, searchQuery, statusFilter, priorityFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredClaims.length / pageSize) || 1;
  const paginatedClaims = filteredClaims.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return <span className="badge badge-success">Approved &amp; Paid</span>;
      case "Under assessment":
        return <span className="badge badge-info">Under Assessment</span>;
      case "Requires human review":
        return <span className="badge badge-warning">Adjuster Review</span>;
      case "Awaiting documents":
        return <span className="badge badge-purple">Action Needed: Upload Docs</span>;
      case "Escalated":
        return <span className="badge badge-error">Specialist Inquiry</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const getLayaBadge = (claim) => {
    if (claim.status === "Completed" || claim.findings?.layaRecommendation === "FAST_TRACK_PAYOUT") {
      return (
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "11px",
          color: "#166534",
          backgroundColor: "#F0FDF4",
          padding: "2px 8px",
          borderRadius: "4px",
          fontWeight: "600",
          border: "1px solid #BBF7D0"
        }}>
          <CheckCircle2 size={12} color="#16a34a" /> Fast-Track Approved
        </span>
      );
    }
    if (claim.status === "Awaiting documents") {
      return (
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "11px",
          color: "#92400E",
          backgroundColor: "#FEF3C7",
          padding: "2px 8px",
          borderRadius: "4px",
          fontWeight: "600",
          border: "1px solid #FDE68A"
        }}>
          <Upload size={12} color="#D97706" /> Evidence Needed
        </span>
      );
    }
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "11px",
        color: "#1E40AF",
        backgroundColor: "#EFF6FF",
        padding: "2px 8px",
        borderRadius: "4px",
        fontWeight: "600",
        border: "1px solid #BFDBFE"
      }}>
        <Clock size={12} color="#2563EB" /> AI Validated
      </span>
    );
  };

  return (
    <div style={{ padding: "28px", overflowY: "auto" }} className="fade-in">
      {/* Customer Hero Banner */}
      <div style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        padding: "22px 26px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "var(--shadow-sm)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
              Welcome back, Alexander
            </h1>
            <span style={{
              fontSize: "11px",
              fontWeight: "600",
              backgroundColor: "#EFF6FF",
              color: "var(--color-accent)",
              border: "1px solid #BFDBFE",
              padding: "2px 8px",
              borderRadius: "4px"
            }}>
              {categoryInfo.name} Hub
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: "4px 0 0 0" }}>
            Manage your claims, view real-time LAYA AI assessment transparency, and track settlement disbursements.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onNavigateNewClaim}
            className="btn btn-primary"
            style={{ gap: "8px", padding: "10px 18px", fontSize: "13px" }}
          >
            <PlusCircle size={16} />
            <span>File a New Claim</span>
          </button>
        </div>
      </div>

      {/* Customer Action Notice if any claim needs documents */}
      {metrics.needsCustomerAction > 0 && (
        <div style={{
          backgroundColor: "#FFFBEB",
          border: "1px solid #FDE68A",
          borderRadius: "8px",
          padding: "14px 18px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#FEF3C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#D97706"
            }}>
              <Upload size={16} />
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#92400E" }}>
                Action Required on {metrics.needsCustomerAction} Claim
              </div>
              <div style={{ fontSize: "12px", color: "#78350F" }}>
                An official report or receipt is pending upload to authorize full settlement.
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const pendingClaim = categoryClaims.find((c) => c.status === "Awaiting documents");
              if (pendingClaim) onSelectClaim(pendingClaim.id);
            }}
            className="btn btn-outline"
            style={{ fontSize: "12px", borderColor: "#F59E0B", color: "#B45309", backgroundColor: "#FFF" }}
          >
            Upload Evidence Now &rarr;
          </button>
        </div>
      )}

      {/* Customer Metric Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "28px"
      }}>
        {/* Total Claims */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              My Total Claims
            </span>
            <FileText size={16} color="var(--color-secondary)" />
          </div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "var(--color-primary)" }}>
            {metrics.total}
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
            {metrics.completed} paid &bull; {metrics.total - metrics.completed} in progress
          </div>
        </div>

        {/* Action Needed */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Action Needed
            </span>
            <FileQuestion size={16} color="var(--color-warning)" />
          </div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: metrics.needsCustomerAction > 0 ? "var(--color-warning)" : "var(--color-primary)" }}>
            {metrics.needsCustomerAction}
          </div>
          <div style={{ fontSize: "11px", color: "#B45309", marginTop: "4px" }}>
            {metrics.needsCustomerAction > 0 ? "Missing records requested" : "All records up to date"}
          </div>
        </div>

        {/* Settled Payouts */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Total Settled Payouts
            </span>
            <DollarSign size={16} color="var(--color-success)" />
          </div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "var(--color-success)" }}>
            ${metrics.totalSettledPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "11px", color: "#059669", marginTop: "4px" }}>
            Disbursed to primary account
          </div>
        </div>

        {/* Avg Decision Time */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Avg Payout Speed
            </span>
            <TrendingDown size={16} color="var(--color-accent)" />
          </div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "var(--color-accent)" }}>
            {metrics.avgProcessingDays} <span style={{ fontSize: "14px", fontWeight: "500" }}>Days</span>
          </div>
          <div style={{ fontSize: "11px", color: "#2563EB", marginTop: "4px" }}>
            Accelerated via LAYA AI
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px 8px 0 0",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "none"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)" }}>
            My Claims &amp; Application Dossiers
          </div>
          <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            Showing {filteredClaims.length} records
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", color: "var(--color-text-muted)", fontWeight: "500" }}>Status:</span>
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: "170px", padding: "5px 10px", fontSize: "12px" }}
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Approved &amp; Paid</option>
            <option value="Under assessment">Under Assessment</option>
            <option value="Requires human review">Adjuster Review</option>
            <option value="Awaiting documents">Awaiting Documents</option>
            <option value="Escalated">Specialist Review</option>
          </select>
        </div>
      </div>

      {/* Claims Portfolio Table */}
      <div className="table-container" style={{ borderRadius: "0 0 8px 8px", borderTop: "1px solid var(--color-border)" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort("id")} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>Claim Reference</span>
                  <ArrowUpDown size={12} color="var(--color-text-muted)" />
                </div>
              </th>
              <th>Incident Type</th>
              <th onClick={() => toggleSort("filingDate")} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>Date Submitted</span>
                  <ArrowUpDown size={12} color="var(--color-text-muted)" />
                </div>
              </th>
              <th onClick={() => toggleSort("claimedAmount")} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>Claimed Amount</span>
                  <ArrowUpDown size={12} color="var(--color-text-muted)" />
                </div>
              </th>
              <th>Document Status</th>
              <th>LAYA AI Triage</th>
              <th>Current Status</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClaims.map((claim) => (
              <tr
                key={claim.id}
                onClick={() => onSelectClaim(claim.id)}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <strong style={{ color: "var(--color-primary)", fontSize: "13px" }}>{claim.id}</strong>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Policy: {claim.policyNumber}</div>
                </td>
                <td>
                  <div style={{ fontWeight: "600", color: "var(--color-text-main)", fontSize: "13px" }}>{claim.claimType}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Incident: {claim.incidentDate}</div>
                </td>
                <td style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                  {claim.filingDate}
                </td>
                <td>
                  <div style={{ fontWeight: "700", color: "var(--color-text-main)", fontSize: "13px" }}>
                    ${claim.claimedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                    Deductible: ${claim.deductible || 500}
                  </div>
                </td>
                <td>
                  <span className={`badge ${claim.docStatus === "Verified" ? "badge-success" : "badge-warning"}`}>
                    {claim.docStatus}
                  </span>
                </td>
                <td>
                  {getLayaBadge(claim)}
                </td>
                <td>
                  {getStatusBadge(claim.status)}
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn btn-outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClaim(claim.id);
                    }}
                    style={{ fontSize: "11px", padding: "4px 10px" }}
                  >
                    View Status &rarr;
                  </button>
                </td>
              </tr>
            ))}

            {paginatedClaims.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  No claims found matching your search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          backgroundColor: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
          fontSize: "12px",
          color: "var(--color-text-muted)"
        }}>
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredClaims.length)} of {filteredClaims.length} claims
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              className="btn btn-outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              style={{ padding: "4px 8px", fontSize: "11px" }}
            >
              <ChevronLeft size={13} /> Prev
            </button>
            <span style={{ padding: "4px 8px", fontWeight: "600", color: "var(--color-primary)" }}>
              {currentPage} / {totalPages}
            </span>
            <button
              className="btn btn-outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              style={{ padding: "4px 8px", fontSize: "11px" }}
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
