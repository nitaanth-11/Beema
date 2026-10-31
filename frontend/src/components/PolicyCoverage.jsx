import React, { useState, useMemo } from "react";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  Calendar,
  DollarSign,
  Filter,
  ExternalLink,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Info
} from "lucide-react";
import { INSURANCE_CATEGORIES, INITIAL_POLICIES } from "../data/mockClaims";
import { formatRupees, formatRupeesCompact, RUPEE_SYMBOL } from "../utils/currency";

export default function PolicyCoverage({ currentCategory }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [clauseStatusFilter, setClauseStatusFilter] = useState("all");

  const categoryInfo = INSURANCE_CATEGORIES.find((c) => c.id === currentCategory) || INSURANCE_CATEGORIES[0];

  const policies = useMemo(() => {
    const matched = INITIAL_POLICIES.filter((p) => p.category === currentCategory);
    return matched.length > 0 ? matched : INITIAL_POLICIES;
  }, [currentCategory]);

  const activePolicy = selectedPolicyId
    ? policies.find((p) => p.id === selectedPolicyId) || policies[0]
    : policies[0];

  const filteredClauses = useMemo(() => {
    if (!activePolicy?.clauses) return [];
    return activePolicy.clauses.filter((clause) => {
      const matchesSearch = !searchTerm ||
        clause.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clause.text.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = clauseStatusFilter === "all" ||
        clause.status.toLowerCase() === clauseStatusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [activePolicy, searchTerm, clauseStatusFilter]);

  const getClauseBadge = (status) => {
    switch (status) {
      case "Supported":
        return <span className="badge badge-success">Fully Covered</span>;
      case "Excluded":
        return <span className="badge badge-error">Policy Exclusion</span>;
      default:
        return <span className="badge badge-warning">Subject to Deductible</span>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
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
              My Policy &amp; Coverage Explorer
            </h1>
            <span style={{ fontSize: "11px", backgroundColor: "#EFF6FF", color: "var(--color-accent)", fontWeight: "600", padding: "2px 8px", borderRadius: "4px" }}>
              {categoryInfo.name} Plan
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: "4px 0 0 0" }}>
            Understand exactly what is covered under your active insurance contract, deductible rules, and benefits.
          </p>
        </div>

        {/* Search inside Clauses */}
        <div style={{ position: "relative", width: "320px" }}>
          <Search size={14} color="var(--color-text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search your benefits, OEM parts, limits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "34px", fontSize: "12px" }}
          />
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "340px 1fr",
        flex: 1,
        minHeight: 0,
        backgroundColor: "var(--color-background)"
      }}>
        {/* Left Column: My Active Policies */}
        <div style={{
          borderRight: "1px solid var(--color-border)",
          backgroundColor: "#FFFFFF",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--color-border)", backgroundColor: "#F8FAFC", fontSize: "12px", fontWeight: "600", color: "var(--color-secondary)" }}>
            MY ACTIVE POLICIES ({policies.length})
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {policies.map((pol) => {
              const isSelected = activePolicy?.id === pol.id;
              return (
                <div
                  key={pol.id}
                  onClick={() => setSelectedPolicyId(pol.id)}
                  style={{
                    padding: "16px 18px",
                    borderBottom: "1px solid var(--color-border)",
                    backgroundColor: isSelected ? "#F1F5F9" : "transparent",
                    borderLeft: isSelected ? "3px solid var(--color-accent)" : "3px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-primary)" }}>
                      {pol.id}
                    </span>
                    <span className="badge badge-success" style={{ fontSize: "10px" }}>
                      Active
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-main)", fontWeight: "500" }}>
                    {pol.holder}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                    {pol.type}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                    Active Term: {pol.effectiveDate} to {pol.expirationDate}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Policy Benefits Explorer */}
        {activePolicy && (
          <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Top Specification Banner */}
            <div className="card" style={{ padding: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
                      {activePolicy.id}
                    </h2>
                    <span className="badge badge-success">Active &amp; In Good Standing</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                    Named Policyholder: <strong style={{ color: "var(--color-text-main)" }}>{activePolicy.holder}</strong> &bull; Plan: <strong style={{ color: "var(--color-text-main)" }}>{activePolicy.type}</strong>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>
                    Policy Renewal Date
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-main)", marginTop: "2px" }}>
                    {activePolicy.expirationDate}
                  </div>
                </div>
              </div>

              {/* Financial Boundaries */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", paddingTop: "14px", borderTop: "1px solid var(--color-border)" }}>
                <div style={{ backgroundColor: "#F8FAFC", padding: "14px", borderRadius: "6px", border: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Maximum Coverage Limit (₹)</span>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--color-primary)", marginTop: "2px" }}>
                    {formatRupees(activePolicy.coverageLimit)}
                  </div>
                </div>
                <div style={{ backgroundColor: "#F8FAFC", padding: "14px", borderRadius: "6px", border: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Your Policy Deductible (₹)</span>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--color-secondary)", marginTop: "2px" }}>
                    {formatRupees(activePolicy.deductible)}
                  </div>
                </div>
                <div style={{ backgroundColor: "#F8FAFC", padding: "14px", borderRadius: "6px", border: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Included Endorsements</span>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--color-text-main)", marginTop: "2px" }}>
                    {activePolicy.clauses?.length || 0} Benefits Active
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Clauses Workspace */}
            <div className="card" style={{ padding: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
                    What Am I Covered For? (Policy Terms Explained)
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                    Transparent guidelines on how Beema and LAYA assess your claims.
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Filter:</span>
                  <select
                    className="form-input"
                    value={clauseStatusFilter}
                    onChange={(e) => setClauseStatusFilter(e.target.value)}
                    style={{ width: "160px", padding: "6px 10px", fontSize: "12px" }}
                  >
                    <option value="all">All Terms</option>
                    <option value="supported">Covered Benefits Only</option>
                    <option value="excluded">Exclusions Only</option>
                  </select>
                </div>
              </div>

              {/* Clause List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredClauses.map((clause) => (
                  <div
                    key={clause.id}
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      padding: "16px",
                      backgroundColor: clause.status === "Supported" ? "#F8FAFC" : "#FFFBEB"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          fontSize: "11px",
                          fontFamily: "monospace",
                          fontWeight: "700",
                          backgroundColor: "#E2E8F0",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          color: "var(--color-primary)"
                        }}>
                          {clause.id}
                        </span>
                        <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text-main)", margin: 0 }}>
                          {clause.title}
                        </h4>
                      </div>
                      {getClauseBadge(clause.status)}
                    </div>

                    <p style={{
                      fontSize: "13px",
                      color: "var(--color-text-muted)",
                      lineHeight: "1.5",
                      margin: "0 0 10px 0",
                      backgroundColor: "#FFFFFF",
                      padding: "10px 12px",
                      borderRadius: "4px",
                      border: "1px solid #E2E8F0"
                    }}>
                      &ldquo;{clause.text}&rdquo;
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--color-text-muted)" }}>
                      <span>Policy Document Reference: Master_Policy_{activePolicy.id}.pdf</span>
                      <span style={{ color: clause.status === "Supported" ? "var(--color-success)" : "var(--color-error)", fontWeight: "600" }}>
                        {clause.status === "Supported" ? "Covered Benefit" : "Standard Policy Exclusion"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
