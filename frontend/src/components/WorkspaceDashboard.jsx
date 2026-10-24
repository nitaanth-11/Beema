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
  ShieldCheck,
  HelpCircle,
  Building2,
  User,
  Layers,
  Car,
  HeartPulse,
  House,
  Briefcase,
  Trees,
  Lock,
  Truck,
  Ship,
  Plane,
  IndianRupee,
  Sparkles
} from "lucide-react";
import { INSURANCE_CATEGORIES, SEGMENTS } from "../data/mockClaims";
import { formatRupees, formatRupeesCompact, RUPEE_SYMBOL } from "../utils/currency";

const ICON_MAP = {
  Car,
  HeartPulse,
  ShieldCheck,
  House,
  Plane,
  Building2,
  Briefcase,
  Trees,
  Lock,
  Truck,
  Ship,
  ShieldAlert,
  User,
  Layers
};

export default function WorkspaceDashboard({
  currentCategory,
  currentPersona,
  onNavigateHome,
  claims = [],
  onSelectClaim,
  onNavigateNewClaim,
  searchQuery = ""
}) {
  // Current active segment: 'all', 'individual', or 'organisation'
  const initialSegment = useMemo(() => {
    if (currentPersona && currentPersona.segment && currentPersona.segment !== "all") {
      return currentPersona.segment;
    }
    if (!currentCategory) return "all";
    const found = INSURANCE_CATEGORIES.find((c) => c.id === currentCategory);
    return found ? found.segment : "all";
  }, [currentCategory, currentPersona]);

  const [activeSegment, setActiveSegment] = useState(initialSegment);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortField, setSortField] = useState("filingDate");
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Categories available under currently selected segment
  const availableCategories = useMemo(() => {
    if (activeSegment === "all") return INSURANCE_CATEGORIES;
    return INSURANCE_CATEGORIES.filter((c) => c.segment === activeSegment);
  }, [activeSegment]);

  // Claims filtered by active segment and category
  const filteredByScope = useMemo(() => {
    return claims.filter((claim) => {
      // Find category config for this claim
      const catConfig = INSURANCE_CATEGORIES.find((c) => c.id === claim.category);
      const claimSegment = claim.segment || (catConfig ? catConfig.segment : "individual");

      // Segment check
      if (activeSegment !== "all" && claimSegment !== activeSegment) {
        return false;
      }

      // Category check
      if (activeCategoryFilter !== "all" && claim.category !== activeCategoryFilter) {
        return false;
      }

      return true;
    });
  }, [claims, activeSegment, activeCategoryFilter]);

  // Operational Metrics in Rupees
  const metrics = useMemo(() => {
    const total = filteredByScope.length;
    const inProgress = filteredByScope.filter((c) => c.status === "Under assessment" || c.status === "Requires human review").length;
    const needsCustomerAction = filteredByScope.filter((c) => c.status === "Awaiting documents").length;
    const completed = filteredByScope.filter((c) => c.status === "Completed").length;

    // Total claimed financial volume
    const totalExposure = filteredByScope.reduce((acc, curr) => acc + (curr.claimedAmount || 0), 0);

    // Total settled payout amount in Rupees
    const totalSettledPayout = filteredByScope
      .filter((c) => c.status === "Completed")
      .reduce((acc, curr) => acc + (curr.claimedAmount || 0), 0);

    return { 
      total, 
      inProgress, 
      needsCustomerAction, 
      completed, 
      totalExposure,
      totalSettledPayout, 
      avgProcessingDays: "1.9" 
    };
  }, [filteredByScope]);

  // Final Filtered & Sorted Table Rows
  const finalClaims = useMemo(() => {
    return filteredByScope.filter((claim) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesId = (claim.id || "").toLowerCase().includes(q);
        const matchesName = (claim.claimantName || "").toLowerCase().includes(q);
        const matchesPolicy = (claim.policyNumber || "").toLowerCase().includes(q);
        const matchesDesc = (claim.description || "").toLowerCase().includes(q);
        const matchesType = (claim.claimType || "").toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesPolicy && !matchesDesc && !matchesType) return false;
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
  }, [filteredByScope, searchQuery, statusFilter, priorityFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(finalClaims.length / pageSize) || 1;
  const paginatedClaims = finalClaims.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
        return <span className="badge badge-purple">Pending Evidence</span>;
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
          <CheckCircle2 size={12} color="#16a34a" /> Fast-Track (₹)
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
          <Upload size={12} color="#D97706" /> Evidence Required
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
    <div style={{ padding: "24px 28px", overflowY: "auto" }} className="fade-in">
      {/* Active Persona Context Banner (Marsh Institutional Style) */}
      {currentPersona && (
        <div style={{
          backgroundColor: currentPersona.segment === "organisation" ? "#F5F3FF" : "#EFF6FF",
          border: currentPersona.segment === "organisation" ? "1px solid #DDD6FE" : "1px solid #BFDBFE",
          borderRadius: "8px",
          padding: "10px 18px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{
              fontSize: "11px",
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              backgroundColor: currentPersona.segment === "organisation" ? "#7C3AED" : "#2563EB",
              color: "#FFFFFF",
              padding: "2px 8px",
              borderRadius: "4px"
            }}>
              {currentPersona.segment === "organisation" ? "🏢 Organisation Persona" : "👤 Individual Persona"}
            </span>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-primary)" }}>
              {currentPersona.name}
            </span>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              &bull; {currentPersona.identifier} &bull; Policy #{currentPersona.primaryPolicy}
            </span>
          </div>

          <button
            onClick={onNavigateHome}
            style={{
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: "6px",
              padding: "4px 12px",
              fontSize: "11px",
              fontWeight: "700",
              color: "var(--color-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <span>Switch Persona (Return to Home) &rarr;</span>
          </button>
        </div>
      )}

      {/* Top Portfolio Header & Segment Selector */}
      <div style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid var(--color-border)",
        borderRadius: "10px",
        padding: "20px 24px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "var(--shadow-sm)",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--color-primary)", margin: 0 }}>
              Claims Intelligence Dashboard
            </h1>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              fontWeight: "700",
              backgroundColor: "#EFF6FF",
              color: "var(--color-accent)",
              border: "1px solid #BFDBFE",
              padding: "2px 8px",
              borderRadius: "4px"
            }}>
              <IndianRupee size={12} /> INR Currency
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: "2px 0 0 0" }}>
            Real-time loss tracking, fraud detection, and automated settlement across <strong>Individual</strong> &amp; <strong>Organisation</strong> risks.
          </p>
        </div>

        {/* Primary Segment Bifurcation Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{
            display: "inline-flex",
            backgroundColor: "#F1F5F9",
            padding: "4px",
            borderRadius: "8px",
            border: "1px solid var(--color-border)"
          }}>
            {SEGMENTS.map((seg) => {
              const isSelected = activeSegment === seg.id;
              const IconComp = seg.id === "individual" ? User : seg.id === "organisation" ? Building2 : Layers;
              return (
                <button
                  key={seg.id}
                  onClick={() => {
                    setActiveSegment(seg.id);
                    setActiveCategoryFilter("all");
                    setCurrentPage(1);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: isSelected ? "#FFFFFF" : "transparent",
                    color: isSelected ? "var(--color-primary)" : "var(--color-text-muted)",
                    fontWeight: isSelected ? "700" : "500",
                    fontSize: "13px",
                    cursor: "pointer",
                    boxShadow: isSelected ? "0 1px 4px rgba(0, 0, 0, 0.08)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  <IconComp size={15} color={isSelected ? "var(--color-accent)" : "#64748B"} />
                  <span>{seg.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onNavigateNewClaim}
            className="btn btn-primary"
            style={{ 
              gap: "8px", 
              padding: "9px 18px", 
              fontSize: "13px",
              fontWeight: "700",
              boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)"
            }}
          >
            <PlusCircle size={16} />
            <span>File New Claim</span>
          </button>
        </div>
      </div>

      {/* Secondary Category Filter Pills (Health, Environment, Captive, Vehicle, Cyber, Property, etc.) */}
      <div style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        padding: "12px 18px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        overflowX: "auto",
        boxShadow: "var(--shadow-sm)"
      }}>
        <div style={{ 
          fontSize: "12px", 
          fontWeight: "700", 
          color: "var(--color-text-muted)", 
          textTransform: "uppercase", 
          letterSpacing: "0.04em",
          marginRight: "4px",
          whiteSpace: "nowrap"
        }}>
          Categories:
        </div>

        <button
          onClick={() => {
            setActiveCategoryFilter("all");
            setCurrentPage(1);
          }}
          style={{
            padding: "5px 12px",
            borderRadius: "6px",
            border: activeCategoryFilter === "all" ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
            backgroundColor: activeCategoryFilter === "all" ? "#EFF6FF" : "#F8FAFC",
            color: activeCategoryFilter === "all" ? "var(--color-accent)" : "var(--color-secondary)",
            fontSize: "12px",
            fontWeight: activeCategoryFilter === "all" ? "700" : "500",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          All {activeSegment === "all" ? "Categories" : activeSegment === "individual" ? "Individual" : "Organisation"}
        </button>

        {availableCategories.map((cat) => {
          const isSelected = activeCategoryFilter === cat.id;
          const IconComp = ICON_MAP[cat.icon] || FileText;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategoryFilter(cat.id);
                setCurrentPage(1);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "6px",
                border: isSelected ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
                backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
                color: isSelected ? "var(--color-accent)" : "var(--color-secondary)",
                fontSize: "12px",
                fontWeight: isSelected ? "700" : "500",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease"
              }}
            >
              <IconComp size={13} color={isSelected ? "var(--color-accent)" : (cat.color || "#64748B")} />
              <span>{cat.shortName || cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Operational Metric Cards (Strictly in Indian Rupees ₹) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
      }}>
        {/* Total Claims */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Total Claims Logged
            </span>
            <FileText size={16} color="var(--color-secondary)" />
          </div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "var(--color-primary)" }}>
            {metrics.total}
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
            {metrics.completed} settled &bull; {metrics.total - metrics.completed} under review
          </div>
        </div>

        {/* Total Financial Exposure in Rupees */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Incurred Loss Exposure
            </span>
            <IndianRupee size={16} color="var(--color-accent)" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--color-primary)" }}>
            {formatRupeesCompact(metrics.totalExposure)}
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
            {formatRupees(metrics.totalExposure, { includeDecimals: false })}
          </div>
        </div>

        {/* Settled Payouts in Rupees */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Settled Disbursements
            </span>
            <CheckCircle2 size={16} color="var(--color-success)" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--color-success)" }}>
            {formatRupeesCompact(metrics.totalSettledPayout)}
          </div>
          <div style={{ fontSize: "11px", color: "#059669", marginTop: "4px" }}>
            Disbursed via automated NEFT / RTGS
          </div>
        </div>

        {/* Action Needed */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Evidence Needed
            </span>
            <FileQuestion size={16} color={metrics.needsCustomerAction > 0 ? "var(--color-warning)" : "var(--color-secondary)"} />
          </div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: metrics.needsCustomerAction > 0 ? "var(--color-warning)" : "var(--color-primary)" }}>
            {metrics.needsCustomerAction}
          </div>
          <div style={{ fontSize: "11px", color: metrics.needsCustomerAction > 0 ? "#B45309" : "#64748B", marginTop: "4px" }}>
            {metrics.needsCustomerAction > 0 ? "Surveys / FIRs pending" : "All evidence verified"}
          </div>
        </div>

        {/* Fast-Track Speed */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Avg Triage Speed
            </span>
            <TrendingDown size={16} color="var(--color-accent)" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--color-accent)" }}>
            {metrics.avgProcessingDays} <span style={{ fontSize: "14px", fontWeight: "500" }}>Days</span>
          </div>
          <div style={{ fontSize: "11px", color: "#2563EB", marginTop: "4px" }}>
            LAYA Decision Engine
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
        borderBottom: "none",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-primary)" }}>
            Claims Ledger ({finalClaims.length} records)
          </span>

          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Filter size={14} color="var(--color-text-muted)" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                fontSize: "12px",
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
                backgroundColor: "#FFF"
              }}
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Approved &amp; Paid</option>
              <option value="Under assessment">Under Assessment</option>
              <option value="Awaiting documents">Pending Evidence</option>
              <option value="Requires human review">Adjuster Review</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                fontSize: "12px",
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
                backgroundColor: "#FFF"
              }}
            >
              <option value="all">All Priorities</option>
              <option value="routine">Routine</option>
              <option value="priority">Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
          Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, finalClaims.length)} of {finalClaims.length}
        </div>
      </div>

      {/* Claims Data Table */}
      <div style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "0 0 8px 8px",
        overflowX: "auto",
        boxShadow: "var(--shadow-sm)"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
          <thead>
            <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid var(--color-border)" }}>
              <th 
                onClick={() => toggleSort("id")}
                style={{ padding: "12px 16px", fontWeight: "700", color: "#475569", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>Claim Reference</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ padding: "12px 16px", fontWeight: "700", color: "#475569" }}>
                Segment &amp; Line
              </th>
              <th style={{ padding: "12px 16px", fontWeight: "700", color: "#475569" }}>
                Claimant / Organisation
              </th>
              <th 
                onClick={() => toggleSort("filingDate")}
                style={{ padding: "12px 16px", fontWeight: "700", color: "#475569", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>Filing Date</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th 
                onClick={() => toggleSort("claimedAmount")}
                style={{ padding: "12px 16px", fontWeight: "700", color: "#475569", cursor: "pointer", whiteSpace: "nowrap", textAlign: "right" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                  <span>Claimed (₹)</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ padding: "12px 16px", fontWeight: "700", color: "#475569" }}>
                LAYA AI Assessment
              </th>
              <th style={{ padding: "12px 16px", fontWeight: "700", color: "#475569" }}>
                Status
              </th>
              <th style={{ padding: "12px 16px", fontWeight: "700", color: "#475569", textAlign: "right" }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedClaims.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "48px 20px", textAlign: "center", color: "var(--color-text-muted)" }}>
                  <FileText size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-primary)" }}>
                    No claims found for this segment and category filter
                  </div>
                  <div style={{ fontSize: "13px", marginTop: "4px" }}>
                    File a new claim or switch to another insurance category above.
                  </div>
                </td>
              </tr>
            ) : (
              paginatedClaims.map((claim) => {
                const catConfig = INSURANCE_CATEGORIES.find((c) => c.id === claim.category);
                const claimSegment = claim.segment || (catConfig ? catConfig.segment : "individual");
                const IconComp = catConfig ? (ICON_MAP[catConfig.icon] || FileText) : FileText;

                return (
                  <tr 
                    key={claim.id}
                    onClick={() => onSelectClaim(claim.id)}
                    style={{ 
                      borderBottom: "1px solid var(--color-border)",
                      cursor: "pointer",
                      transition: "background-color 0.12s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {/* Claim ID */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: "700", color: "var(--color-accent)" }}>
                        {claim.id}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                        {claim.policyNumber}
                      </div>
                    </td>

                    {/* Segment & Category */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <span style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          backgroundColor: claimSegment === "organisation" ? "#F5F3FF" : "#ECFDF5",
                          color: claimSegment === "organisation" ? "#6D28D9" : "#047857",
                          border: `1px solid ${claimSegment === "organisation" ? "#DDD6FE" : "#A7F3D0"}`
                        }}>
                          {claimSegment === "organisation" ? "🏢 Organisation" : "👤 Individual"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", color: "var(--color-primary)" }}>
                        <IconComp size={14} color={catConfig?.color || "#64748B"} />
                        <span>{catConfig?.name || claim.category}</span>
                      </div>
                    </td>

                    {/* Claimant */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: "600", color: "var(--color-primary)" }}>
                        {claim.claimantName}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--color-text-muted)", maxWidth: "220px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {claim.claimType || claim.description}
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ padding: "14px 16px", color: "#475569", whiteSpace: "nowrap" }}>
                      <div>{claim.filingDate}</div>
                      <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                        Loss: {claim.incidentDate}
                      </div>
                    </td>

                    {/* Amount in Rupees */}
                    <td style={{ padding: "14px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: "700", color: "var(--color-primary)", fontSize: "14px" }}>
                        {formatRupees(claim.claimedAmount)}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                        Ded: {formatRupees(claim.deductible || 0, { includeDecimals: false })}
                      </div>
                    </td>

                    {/* LAYA Assessment */}
                    <td style={{ padding: "14px 16px" }}>
                      {getLayaBadge(claim)}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "14px 16px" }}>
                      {getStatusBadge(claim.status)}
                    </td>

                    {/* Action */}
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectClaim(claim.id);
                        }}
                        className="btn btn-outline"
                        style={{ padding: "5px 12px", fontSize: "12px", gap: "4px" }}
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#F8FAFC"
          }}>
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              Page {currentPage} of {totalPages}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: "5px 10px",
                  borderRadius: "4px",
                  border: "1px solid var(--color-border)",
                  backgroundColor: currentPage === 1 ? "#F1F5F9" : "#FFF",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer"
                }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: "5px 10px",
                  borderRadius: "4px",
                  border: "1px solid var(--color-border)",
                  backgroundColor: currentPage === totalPages ? "#F1F5F9" : "#FFF",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer"
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
