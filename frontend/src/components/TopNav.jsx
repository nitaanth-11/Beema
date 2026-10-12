import React, { useState } from "react";
import { Search, Bell, HelpCircle, ChevronRight, User, RefreshCw, Shield, Phone, FileText } from "lucide-react";
import { INSURANCE_CATEGORIES } from "../data/mockClaims";

export default function TopNav({
  currentCategory,
  onChangeCategory,
  activeTabTitle = "My Claims Hub",
  searchQuery,
  onSearchChange
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const categoryInfo = INSURANCE_CATEGORIES.find((c) => c.id === currentCategory) || INSURANCE_CATEGORIES[0];

  const NOTIFICATIONS = [
    {
      id: 1,
      title: "Fast-Track Payout Approved",
      desc: "Great news! Your claim CLM-MTR-2026-081 ($2,450.00) is approved and scheduled for transfer.",
      time: "20m ago",
      unread: true,
      type: "success"
    },
    {
      id: 2,
      title: "Action Required on Claim CLM-MTR-2026-104",
      desc: "Please upload your official Highway Patrol report so we can complete your total loss claim.",
      time: "2h ago",
      unread: true,
      type: "action"
    },
    {
      id: 3,
      title: "Receipt Verified",
      desc: "Your repair invoice from Apex Auto Repair has been verified with 100% policy match.",
      time: "1d ago",
      unread: false,
      type: "info"
    }
  ];

  return (
    <header style={{
      height: "var(--topbar-height)",
      backgroundColor: "var(--color-surface)",
      borderBottom: "1px solid var(--color-border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      position: "sticky",
      top: 0,
      zIndex: 20
    }}>
      {/* Left: Breadcrumbs & Customer Context */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
        <span style={{ fontWeight: "600", color: "var(--color-secondary)" }}>Beema Portal</span>
        <ChevronRight size={14} color="var(--color-text-light)" />
        <span style={{ color: "var(--color-text-muted)" }}>{categoryInfo.name}</span>
        <ChevronRight size={14} color="var(--color-text-light)" />
        <span style={{ fontWeight: "700", color: "var(--color-primary)" }}>{activeTabTitle}</span>

        <span style={{
          marginLeft: "8px",
          fontSize: "11px",
          backgroundColor: "#F0FDF4",
          color: "#166534",
          border: "1px solid #BBF7D0",
          borderRadius: "9999px",
          padding: "2px 8px",
          fontWeight: "600"
        }}>
          Policy # POL-AUTO-882104 &bull; Active
        </span>
      </div>

      {/* Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Customer Search Bar */}
        <div style={{ position: "relative", width: "260px" }}>
          <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
          <input
            type="text"
            className="input"
            placeholder="Search your claims, receipts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              paddingLeft: "32px",
              paddingRight: "10px",
              paddingTop: "6px",
              paddingBottom: "6px",
              fontSize: "12px",
              backgroundColor: "#F8FAFC"
            }}
          />
        </div>

        {/* Change Category Action */}
        <button
          onClick={onChangeCategory}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: "12px", gap: "5px" }}
          title="Switch Insurance Line"
        >
          <RefreshCw size={12} />
          <span>Switch Line</span>
        </button>

        {/* Notifications Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              backgroundColor: "#F8FAFC",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
              color: "var(--color-secondary)"
            }}
            title="My Claim Updates"
          >
            <Bell size={16} />
            <span style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: "var(--color-accent)"
            }} />
          </button>

          {notificationsOpen && (
            <div style={{
              position: "absolute",
              top: "40px",
              right: 0,
              width: "340px",
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-md)",
              padding: "12px",
              zIndex: 50
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "8px",
                borderBottom: "1px solid var(--color-border)",
                marginBottom: "8px"
              }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-primary)" }}>
                  Claim Updates & Notifications
                </span>
                <span style={{ fontSize: "11px", color: "var(--color-accent)", fontWeight: "600" }}>2 New</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {NOTIFICATIONS.map((n) => (
                  <div key={n.id} style={{
                    padding: "8px 10px",
                    borderRadius: "6px",
                    backgroundColor: n.type === "action" ? "#FFFBEB" : (n.unread ? "#EFF6FF" : "#F8FAFC"),
                    border: `1px solid ${n.type === "action" ? "#FDE68A" : (n.unread ? "#BFDBFE" : "var(--color-border)")}`
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: n.type === "action" ? "#B45309" : "var(--color-primary)" }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>{n.time}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-main)", lineHeight: "1.4" }}>
                      {n.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customer Profile Avatar & Menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px"
            }}
          >
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "var(--color-primary)",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "700"
            }}>
              AV
            </div>
            <div style={{ textAlign: "left", display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-primary)", lineHeight: "1.2" }}>
                Alexander Vance
              </span>
              <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                Policyholder
              </span>
            </div>
          </button>

          {profileOpen && (
            <div style={{
              position: "absolute",
              top: "42px",
              right: 0,
              width: "260px",
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-md)",
              padding: "14px",
              zIndex: 50
            }}>
              <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "10px", marginBottom: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-primary)" }}>Alexander Vance</div>
                <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>alexander.vance@example.com</div>
                <div style={{ fontSize: "11px", color: "#166534", marginTop: "4px", fontWeight: "600" }}>✓ ID Verified &bull; Active Coverage</div>
              </div>

              <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                <strong>Assigned Adjuster:</strong> Sarah Jenkins
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "12px" }}>
                <strong>Direct Line:</strong> +1 (800) 555-0199
              </div>

              <button
                className="btn btn-outline"
                onClick={() => setProfileOpen(false)}
                style={{ width: "100%", fontSize: "11px", padding: "6px" }}
              >
                Close Menu
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
