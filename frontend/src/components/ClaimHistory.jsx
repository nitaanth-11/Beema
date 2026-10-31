import React, { useState } from "react";
import {
  History,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  DollarSign
} from "lucide-react";
import { INSURANCE_CATEGORIES } from "../data/mockClaims";
import { formatRupees } from "../utils/currency";

export default function ClaimHistory({ currentCategory, claims = [], onSelectClaim }) {
  const categoryInfo = INSURANCE_CATEGORIES.find((c) => c.id === currentCategory) || INSURANCE_CATEGORIES[0];
  const [filterQuery, setFilterQuery] = useState("");

  const filteredHistory = claims
    .filter((c) => c.category === currentCategory)
    .filter((c) => {
      if (!filterQuery) return true;
      const q = filterQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        (c.claimantName || "").toLowerCase().includes(q) ||
        (c.policyNumber || "").toLowerCase().includes(q) ||
        (c.claimType || "").toLowerCase().includes(q)
      );
    });

  return (
    <div style={{ padding: "28px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
              Past Claims &amp; Settlement Archive
            </h1>
            <span style={{ fontSize: "11px", backgroundColor: "#EFF6FF", color: "var(--color-accent)", fontWeight: "600", padding: "2px 8px", borderRadius: "4px" }}>
              {categoryInfo.name} History
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: "4px 0 0 0" }}>
            Your complete chronological record of submitted claims, verified evidence, and disbursed settlements.
          </p>
        </div>

        <div style={{ position: "relative", width: "300px" }}>
          <Search size={14} color="var(--color-text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="input"
            placeholder="Search claim, incident type..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{ paddingLeft: "34px", fontSize: "12px" }}
          />
        </div>
      </div>

      {/* History Ledger Table */}
      <div className="card" style={{ padding: "20px" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Claim Reference</th>
              <th>Incident Type</th>
              <th>Date of Incident</th>
              <th>Date Filed</th>
              <th>Claimed Amount (₹)</th>
              <th>LAYA Verification</th>
              <th>Settlement Status</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((claim) => (
              <tr key={claim.id}>
                <td>
                  <strong style={{ color: "var(--color-primary)" }}>{claim.id}</strong>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Policy: {claim.policyNumber}</div>
                </td>
                <td style={{ fontWeight: "600" }}>{claim.claimType}</td>
                <td>{claim.incidentDate}</td>
                <td>{claim.filingDate}</td>
                <td style={{ fontWeight: "700" }}>
                  {formatRupees(claim.claimedAmount)}
                </td>
                <td>
                  <span style={{
                    fontWeight: "600",
                    color: claim.status === "Completed" ? "var(--color-success)" : "var(--color-accent)",
                    fontSize: "12px"
                  }}>
                    {claim.status === "Completed" ? "Fast-Track Verified" : "AI In-Progress"}
                  </span>
                </td>
                <td>
                  <span className={`badge ${
                    claim.status === "Completed"
                      ? "badge-success"
                      : claim.status === "Escalated"
                      ? "badge-error"
                      : "badge-info"
                  }`}>
                    {claim.status === "Completed" ? "Approved & Paid" : claim.status}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => onSelectClaim(claim.id)}
                    style={{ fontSize: "11px", padding: "4px 10px" }}
                  >
                    View Details &rarr;
                  </button>
                </td>
              </tr>
            ))}

            {filteredHistory.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--color-text-muted)" }}>
                  No historical claims found for this query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
