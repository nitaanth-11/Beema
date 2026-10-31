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
  Award,
  Zap,
  Info
} from "lucide-react";
import { INSURANCE_CATEGORIES } from "../data/mockClaims";
import { formatRupees, formatRupeesCompact, RUPEE_SYMBOL } from "../utils/currency";

export default function ReportsAnalytics({ claims = [] }) {
  const [timeRange, setTimeRange] = useState("year_to_date");
  const [activeTab, setActiveTab] = useState("acceptance_lift");

  // Customer claims statistics in Indian Rupees
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
      deductibleSatisfied: 10000,
      annualDeductible: 10000,
      coverageLimit: 1500000,
      avgSpeed: "1.9 Days",
      fastTrackPercent: total > 0 ? ((completed / total) * 100).toFixed(0) : 0
    };
  }, [claims]);

  // Monthly LAYA Impact Dataset (With vs. Without LAYA Decision Engine)
  const layaTrendData = [
    { month: "Jan 2026", withoutLaya: 62.4, withLaya: 68.5, fastTrack: 22.0 },
    { month: "Feb 2026", withoutLaya: 63.8, withLaya: 72.1, fastTrack: 34.5 },
    { month: "Mar 2026", withoutLaya: 61.5, withLaya: 76.8, fastTrack: 45.2 },
    { month: "Apr 2026", withoutLaya: 65.2, withLaya: 81.4, fastTrack: 54.0 },
    { month: "May 2026", withoutLaya: 64.0, withLaya: 84.6, fastTrack: 59.8 },
    { month: "Jun 2026", withoutLaya: 63.1, withLaya: 86.2, fastTrack: 63.1 },
    { month: "Jul 2026", withoutLaya: 65.7, withLaya: 87.5, fastTrack: 65.4 },
    { month: "Aug 2026", withoutLaya: 64.5, withLaya: 88.3, fastTrack: 66.8 },
    { month: "Sep 2026", withoutLaya: 63.9, withLaya: 89.0, fastTrack: 67.2 },
    { month: "Oct 2026", withoutLaya: 64.2, withLaya: 89.4, fastTrack: 67.8 },
  ];

  const categoryAcceptance = [
    { name: "Motor / Auto", without: 67.5, withLaya: 91.2, lift: "+23.7%" },
    { name: "Property & Fire", without: 58.0, withLaya: 84.5, lift: "+26.5%" },
    { name: "Health / Floater", without: 65.2, withLaya: 90.1, lift: "+24.9%" },
    { name: "Cyber Liability", without: 54.0, withLaya: 86.4, lift: "+32.4%" },
    { name: "Commercial Fleet", without: 62.8, withLaya: 88.0, lift: "+25.2%" },
  ];

  return (
    <div style={{ padding: "28px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
            Policy Analytics &amp; LAYA Decision Performance
          </h1>
          <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: "4px 0 0 0" }}>
            Real-time audit of claim throughput, LAYA acceptance lift, and straight-through settlement velocity.
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
            {formatRupees(metrics.totalPayout)}
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
            {formatRupees(metrics.deductibleSatisfied, { includeDecimals: false })} / {formatRupees(metrics.annualDeductible, { includeDecimals: false })}
          </div>
          <div style={{ fontSize: "11px", color: "#2563EB", marginTop: "4px" }}>
            Annual deductible 100% satisfied
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

      {/* LAYA Claim Acceptance Rate Graph (Interactive) */}
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={20} color="var(--color-success)" />
              <h2 style={{ fontSize: "16px", fontWeight: "800", color: "var(--color-primary)", margin: 0 }}>
                Claim Acceptance Lift: LAYA Decision Engine vs. Manual Triage
              </h2>
              <span className="badge badge-success" style={{ fontSize: "11px", fontWeight: "700" }}>
                +25.2% Overall Lift
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "6px 0 0 0" }}>
              LAYA eliminates arbitrary desk backlogs by using actuarial constraint routing to auto-approve legitimate claims.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", backgroundColor: "#10B981", borderRadius: "2px" }} />
              <span style={{ fontWeight: "600", color: "var(--color-text-main)" }}>With LAYA (89.4%)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", backgroundColor: "#94A3B8", borderRadius: "2px" }} />
              <span style={{ color: "var(--color-text-muted)" }}>Without LAYA (64.2%)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", backgroundColor: "#3B82F6", borderRadius: "2px" }} />
              <span style={{ color: "var(--color-text-muted)" }}>Fast-Track STP (67.8%)</span>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div style={{ width: "100%", height: "260px", position: "relative", marginBottom: "16px" }}>
          <svg viewBox="0 0 800 240" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            {/* Grid Lines */}
            {[50, 60, 70, 80, 90, 100].map((val, idx) => {
              const y = 220 - ((val - 50) / 50) * 190;
              return (
                <g key={val}>
                  <line x1="50" y1={y} x2="780" y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
                  <text x="40" y={y + 4} textAnchor="end" fontSize="11" fill="#94A3B8" fontWeight="500">
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* Area Fill for LAYA Advantage */}
            <path
              d={`
                M ${50 + (0 * 730) / 9} ${220 - ((layaTrendData[0].withLaya - 50) / 50) * 190}
                ${layaTrendData.map((d, i) => `L ${50 + (i * 730) / 9} ${220 - ((d.withLaya - 50) / 50) * 190}`).join(" ")}
                ${[...layaTrendData].reverse().map((d, i) => `L ${50 + ((9 - i) * 730) / 9} ${220 - ((d.withoutLaya - 50) / 50) * 190}`).join(" ")}
                Z
              `}
              fill="rgba(16, 185, 129, 0.12)"
            />

            {/* Line: Without LAYA (Grey Dashed) */}
            <path
              d={layaTrendData.map((d, i) => `${i === 0 ? "M" : "L"} ${50 + (i * 730) / 9} ${220 - ((d.withoutLaya - 50) / 50) * 190}`).join(" ")}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2.5"
              strokeDasharray="5 5"
            />

            {/* Line: Fast-Track Automated Payout (Blue) */}
            <path
              d={layaTrendData.map((d, i) => `${i === 0 ? "M" : "L"} ${50 + (i * 730) / 9} ${220 - ((d.fastTrack - 50) / 50) * 190}`).join(" ")}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
            />

            {/* Line: With LAYA (Emerald Green) */}
            <path
              d={layaTrendData.map((d, i) => `${i === 0 ? "M" : "L"} ${50 + (i * 730) / 9} ${220 - ((d.withLaya - 50) / 50) * 190}`).join(" ")}
              fill="none"
              stroke="#10B981"
              strokeWidth="3.5"
            />

            {/* Data Points */}
            {layaTrendData.map((d, i) => {
              const cx = 50 + (i * 730) / 9;
              const cyWith = 220 - ((d.withLaya - 50) / 50) * 190;
              const cyWithout = 220 - ((d.withoutLaya - 50) / 50) * 190;
              return (
                <g key={d.month}>
                  {/* Without Point */}
                  <circle cx={cx} cy={cyWithout} r="3.5" fill="#94A3B8" />

                  {/* With Point */}
                  <circle cx={cx} cy={cyWith} r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                  
                  {/* Month Label */}
                  <text x={cx} y="238" textAnchor="middle" fontSize="10.5" fill="#64748B" fontWeight="600">
                    {d.month.split(" ")[0]}
                  </text>
                </g>
              );
            })}

            {/* Target Marker at Peak */}
            <g transform={`translate(${50 + 730}, ${220 - ((89.4 - 50) / 50) * 190 - 12})`}>
              <rect x="-42" y="-18" width="46" height="18" rx="4" fill="#047857" />
              <text x="-19" y="-5" textAnchor="middle" fontSize="11" fill="#FFFFFF" fontWeight="800">
                89.4%
              </text>
            </g>
          </svg>
        </div>

        {/* Impact Metric Comparison Badges */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", paddingTop: "14px", borderTop: "1px solid #F1F5F9" }}>
          <div style={{ padding: "12px", backgroundColor: "#F0FDF4", borderRadius: "8px", border: "1px solid #DCFCE7" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#166534" }}>ACCEPTANCE LIFT</div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#15803D", marginTop: "2px" }}>+25.2%</div>
            <div style={{ fontSize: "11px", color: "#166534", marginTop: "2px" }}>64.2% → 89.4% genuine acceptance</div>
          </div>

          <div style={{ padding: "12px", backgroundColor: "#EFF6FF", borderRadius: "8px", border: "1px solid #DBEAFE" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#1E40AF" }}>STRAIGHT-THROUGH (STP)</div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#1D4ED8", marginTop: "2px" }}>67.8%</div>
            <div style={{ fontSize: "11px", color: "#1E40AF", marginTop: "2px" }}>Zero-touch instant approval</div>
          </div>

          <div style={{ padding: "12px", backgroundColor: "#FAF5FF", borderRadius: "8px", border: "1px solid #F3E8FF" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#6B21A8" }}>CYCLE TIME REDUCTION</div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#7E22CE", marginTop: "2px" }}>88.4%</div>
            <div style={{ fontSize: "11px", color: "#6B21A8", marginTop: "2px" }}>16.4 days → 1.9 days average</div>
          </div>

          <div style={{ padding: "12px", backgroundColor: "#FFFBEB", borderRadius: "8px", border: "1px solid #FEF3C7" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#92400E" }}>DISPUTE FRICTION DROP</div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#B45309", marginTop: "2px" }}>-81.6%</div>
            <div style={{ fontSize: "11px", color: "#92400E", marginTop: "2px" }}>22.8% → 4.2% claim appeals</div>
          </div>
        </div>
      </div>

      {/* Main Charts: Coverage Limit & Category Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* Coverage Limit Utilization */}
        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Coverage Limit Utilization
          </h3>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
              <span style={{ fontWeight: "600", color: "var(--color-text-main)" }}>Policy Lifetime Claims</span>
              <span style={{ color: "var(--color-text-muted)" }}>{formatRupees(metrics.totalPayout)} of {formatRupees(metrics.coverageLimit)} limit</span>
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
                {formatRupees(metrics.coverageLimit - metrics.totalPayout)}
              </strong>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "var(--color-text-muted)" }}>POLICY EXPIRATION</div>
              <strong style={{ fontSize: "15px", color: "var(--color-text-main)" }}>January 2027</strong>
            </div>
          </div>
        </div>

        {/* Category Acceptance Lift Table */}
        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            Acceptance Lift by Line of Cover
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {categoryAcceptance.map((cat) => (
              <div
                key={cat.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  backgroundColor: "#F8FAFC",
                  borderRadius: "6px",
                  fontSize: "12px"
                }}
              >
                <div style={{ fontWeight: "600", color: "var(--color-text-main)", width: "130px" }}>{cat.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-text-muted)" }}>
                  <span>{cat.without}%</span>
                  <span>→</span>
                  <strong style={{ color: "#166534" }}>{cat.withLaya}%</strong>
                </div>
                <span className="badge badge-success" style={{ fontSize: "10.5px", fontWeight: "700" }}>
                  {cat.lift}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
