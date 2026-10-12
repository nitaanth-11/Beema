import React, { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Filter,
  PieChart,
  Users,
  ShieldAlert,
  ArrowUpRight,
  Database,
  DollarSign,
  ShieldCheck,
  Award
} from "lucide-react";
import { INSURANCE_CATEGORIES } from "../data/mockClaims";

export default function ReportsAnalytics({ claims = [] }) {
  const [timeRange, setTimeRange] = useState("year_to_date");

  // Customer claims statistics
  const metrics = useMemo(() => {
    const total = claims.length;
    const completed = claims.filter((c) => c.status === "Completed").length;
    const inProgress = claims.filter((c) => c.status !== "Completed").length;
    const totalPayout = claims
      .filter((c) => c.status === "Completed")
      .reduce((sum, c) => sum + (c.claimedAmount || 0), 0);

    return {
      total,
      completed,
      inProgress,
      totalPayout,
      deductibleSatisfied: 500,
      annualDeductible: 500,
      coverageLimit: 100000,
      avgSpeed: "2.1 Days",
      fastTrackPercent: total > 0 ? ((completed / total) * 100).toFixed(0) : 0
    };
  }, [claims]);

  return (
    <div style={{ padding: "28px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
            My Coverage &amp; Claims Summary
          </h1>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: "4px 0 0 0" }}>
            Overview of your policy usage, approved claim settlements, and deductible fulfillment.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", color: "var(--color-text-muted)", fontWeight: "500" }}>Period:</span>
          <select
            className="input"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ width: "180px", padding: "6px 10px", fontSize: "12px" }}
          >
            <option value="year_to_date">Year to Date (2026)</option>
            <option value="all_time">Entire Policy Lifetime</option>
          </select>
        </div>
      </div>

      {/* Customer KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <div className="card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>
            Total Claims Filed
          </span>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--color-primary)", marginTop: "4px" }}>
            {metrics.total} Claims
          </div>
          <div style={{ fontSize: "11px", color: "#166534", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
            <CheckCircle2 size={12} /> {metrics.completed} successfully settled
          </div>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>
            Total Payouts Received
          </span>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--color-success)", marginTop: "4px" }}>
            ${metrics.totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
            Disbursed directly to your account
          </div>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>
            Annual Deductible Status
          </span>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--color-accent)", marginTop: "4px" }}>
            $500 / $500
          </div>
          <div style={{ fontSize: "11px", color: "#2563EB", marginTop: "4px" }}>
            ✓ Annual deductible 100% satisfied
          </div>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>
            Average Settlement Speed
          </span>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--color-secondary)", marginTop: "4px" }}>
            {metrics.avgSpeed}
          </div>
          <div style={{ fontSize: "11px", color: "#166534", marginTop: "4px" }}>
            Powered by LAYA Instant Triage
          </div>
        </div>
      </div>

      {/* Main Charts & Visual Summaries */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* Coverage Limit Utilization */}
        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Coverage Limit Utilization
          </h3>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
              <span style={{ fontWeight: "600", color: "var(--color-text-main)" }}>Policy Lifetime Claims</span>
              <span style={{ color: "var(--color-text-muted)" }}>${metrics.totalPayout.toLocaleString()} of ${metrics.coverageLimit.toLocaleString()} limit</span>
            </div>
            <div style={{ width: "100%", height: "10px", backgroundColor: "#E2E8F0", borderRadius: "5px", overflow: "hidden" }}>
              <div style={{
                width: `${Math.max(3, (metrics.totalPayout / metrics.coverageLimit) * 100)}%`,
                height: "100%",
                backgroundColor: "var(--color-accent)",
                borderRadius: "5px"
              }} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", backgroundColor: "#F8FAFC", borderRadius: "6px", fontSize: "12px" }}>
            <div>
              <div style={{ color: "var(--color-text-muted)" }}>REMAINING COVERAGE BALANCE</div>
              <strong style={{ fontSize: "15px", color: "var(--color-primary)" }}>
                ${(metrics.coverageLimit - metrics.totalPayout).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "var(--color-text-muted)" }}>POLICY EXPIRATION</div>
              <strong style={{ fontSize: "15px", color: "var(--color-text-main)" }}>January 2027</strong>
            </div>
          </div>
        </div>

        {/* Claim Settlement Funnel */}
        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Claim Status Breakdown
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "6px" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#166534" }}>✓ Approved &amp; Settled Payouts</div>
              <strong style={{ fontSize: "15px", color: "#166534" }}>{metrics.completed}</strong>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "6px" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#1D4ED8" }}>Under Active AI &amp; Adjuster Assessment</div>
              <strong style={{ fontSize: "15px", color: "#1D4ED8" }}>{metrics.inProgress}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
