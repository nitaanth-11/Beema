import React, { useState } from "react";
import { Search, Bell, HelpCircle, ChevronRight, User, RefreshCw, Shield, Phone, FileText, Home, Building2, CheckCircle2, Menu } from "lucide-react";
import { INSURANCE_CATEGORIES } from "../data/mockClaims";

export default function TopNav({
  currentCategory,
  onChangeCategory,
  onNavigateHome,
  currentPersona,
  activeTabTitle = "My Claims Hub",
  searchQuery,
  onSearchChange,
  onToggleSidebar,
  sidebarOpen = false
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const categoryInfo = INSURANCE_CATEGORIES.find((c) => c.id === currentCategory) || INSURANCE_CATEGORIES[0];

  const NOTIFICATIONS = [
    {
      id: 1,
      title: "Fast-Track Payout Approved",
      desc: "Great news! Your claim CLM-VEH-IND-2026-081 (₹1,45,000.00) is approved and scheduled for NEFT transfer.",
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
      <div className="topnav__left" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
        <button
          type="button"
          className="app-nav-toggle"
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
          aria-expanded={sidebarOpen}
        >
          <Menu size={18} />
        </button>
        <button
          onClick={onNavigateHome}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: "700",
            color: "var(--color-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: 0
          }}
          title="Return to Home Page"
        >
          <Home size={14} color="var(--color-accent)" />
          <span>Home</span>
        </button>
        <ChevronRight className="topnav__optional" size={14} color="var(--color-text-light)" />
        <span className="topnav__optional" style={{
          fontSize: "11px",
          fontWeight: "700",
          backgroundColor: currentPersona?.segment === "organisation" ? "#F3E8FF" : "#EFF6FF",
          color: currentPersona?.segment === "organisation" ? "#7E22CE" : "#1D4ED8",
          border: currentPersona?.segment === "organisation" ? "1px solid #D8B4FE" : "1px solid #BFDBFE",
          borderRadius: "12px",
          padding: "1px 8px"
        }}>
          {currentPersona?.segment === "organisation" ? "Organisation" : "Individual"}
        </span>
        <ChevronRight size={14} color="var(--color-text-light)" />
        <span style={{ color: "var(--color-text-muted)" }}>{categoryInfo.name}</span>
        <ChevronRight size={14} color="var(--color-text-light)" />
        <span style={{ fontWeight: "700", color: "var(--color-primary)" }}>{activeTabTitle}</span>

        <span className="topnav__optional" style={{
          marginLeft: "8px",
          fontSize: "11px",
          backgroundColor: "#F0FDF4",
          color: "#166534",
          border: "1px solid #BBF7D0",
          borderRadius: "9999px",
          padding: "2px 8px",
          fontWeight: "600"
        }}>
          Policy # {currentPersona?.primaryPolicy || "POL-AUTO-882104"} &bull; Active
        </span>
      </div>

      {/* Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Switch Persona / Home Button */}
        <button
          onClick={onNavigateHome}
          className="btn btn-secondary btn-sm topnav__optional"
          style={{
            fontSize: "12px",
            gap: "6px",
            display: "flex",
            alignItems: "center",
            backgroundColor: "#F1F5F9",
            borderColor: "#CBD5E1",
            fontWeight: "700"
          }}
          title="Return to Big Dual Banners & Switch Persona"
        >
          <Home size={13} color="var(--color-accent)" />
          <span>Switch Persona</span>
        </button>

        {/* Customer Search Bar */}
        <div className="topnav__search" style={{ position: "relative", width: "240px" }}>
          <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
          <input
            type="text"
            className="input"
            placeholder="Search claims, policies, bills..."
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
          className="btn btn-secondary btn-sm topnav__optional"
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

        {/* Spoofed Persona Profile Avatar & Menu */}
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
              borderRadius: currentPersona?.segment === "organisation" ? "8px" : "50%",
              backgroundColor: currentPersona?.avatarBg || "var(--color-primary)",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "800",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
            }}>
              {currentPersona?.avatarInitials || "RM"}
            </div>
            <div style={{ textAlign: "left", display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)", lineHeight: "1.2" }}>
                {currentPersona?.name || "Rajesh Malhotra"}
              </span>
              <span style={{ fontSize: "10px", color: currentPersona?.segment === "organisation" ? "#7C3AED" : "var(--color-accent)", fontWeight: "600" }}>
                {currentPersona?.segment === "organisation" ? "Corporate Entity" : "Policyholder"}
              </span>
            </div>
          </button>

          {profileOpen && (
            <div style={{
              position: "absolute",
              top: "42px",
              right: 0,
              width: "290px",
              backgroundColor: "#FFFFFF",
              borderRadius: "10px",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-lg)",
              padding: "16px",
              zIndex: 50
            }}>
              <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    backgroundColor: currentPersona?.segment === "organisation" ? "#F3E8FF" : "#EFF6FF",
                    color: currentPersona?.segment === "organisation" ? "#7E22CE" : "#1D4ED8",
                    padding: "2px 8px",
                    borderRadius: "4px"
                  }}>
                    {currentPersona?.segment === "organisation" ? "Organisation Persona" : "Individual Persona"}
                  </span>
                  <span style={{ fontSize: "11px", color: "#166534", fontWeight: "700" }}>Verified</span>
                </div>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--color-primary)" }}>
                  {currentPersona?.name}
                </div>
                <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                  {currentPersona?.title || (currentPersona?.officer ? `Risk Officer: ${currentPersona.officer}` : "")}
                </div>
                <div style={{ fontSize: "11px", color: "var(--color-secondary)", marginTop: "4px", fontWeight: "600" }}>
                  ID: {currentPersona?.identifier}
                </div>
              </div>

              <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "6px" }}>
                <strong>Policy:</strong> {currentPersona?.primaryPolicy}
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "6px" }}>
                <strong>Contact:</strong> {currentPersona?.email || "verified@beema.in"}
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "14px" }}>
                <strong>Location:</strong> {currentPersona?.location || "Mumbai, India"}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigateHome();
                  }}
                  style={{ width: "100%", fontSize: "12px", padding: "8px", justifyContent: "center" }}
                >
                  <Home size={14} />
                  <span>Switch Spoofed Persona (Big Banners)</span>
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setProfileOpen(false)}
                  style={{ width: "100%", fontSize: "11px", padding: "6px", justifyContent: "center" }}
                >
                  Close Menu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
