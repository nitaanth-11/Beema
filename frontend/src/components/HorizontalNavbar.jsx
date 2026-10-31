import React, { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  FileSpreadsheet,
  PlusCircle,
  Cpu,
  FileCheck,
  ShieldCheck,
  History,
  BarChart3,
  Headphones,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Shield,
  Car,
  HeartPulse,
  House,
  Plane,
  Building2,
  Lock,
  Truck,
  Ship,
  Briefcase,
  Trees,
  User,
  CheckCircle2,
  Home,
  LogOut,
  ExternalLink,
  Check,
  X
} from "lucide-react";
import { INSURANCE_CATEGORIES, SPOOFED_PERSONAS } from "../data/mockClaims";
import { formatRupees } from "../utils/currency";

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
  Ship
};

export default function HorizontalNavbar({
  activeTab,
  onTabChange,
  currentCategory,
  onChangeCategory,
  onNavigateHome,
  currentPersona,
  claimsCount = 0,
  searchQuery,
  onSearchChange
}) {
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const categoryRef = useRef(null);
  const personaRef = useRef(null);
  const notifRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryMenuOpen(false);
      }
      if (personaRef.current && !personaRef.current.contains(event.target)) {
        setPersonaMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categoryInfo =
    INSURANCE_CATEGORIES.find((c) => c.id === currentCategory) || INSURANCE_CATEGORIES[0];
  const CategoryIcon = ICON_MAP[categoryInfo.icon] || Car;

  const NAV_ITEMS = [
    { id: "overview", label: "Claims Hub", icon: LayoutDashboard },
    { id: "all_claims", label: "Track Claims", icon: FileSpreadsheet, badge: claimsCount },
    { id: "new_claim", label: "File a Claim", icon: PlusCircle, isAction: true },
    { id: "laya", label: "LAYA Intelligence", icon: Cpu },
    { id: "documents", label: "Document Audit", icon: FileCheck },
    { id: "policy", label: "Policy & Cover", icon: ShieldCheck },
    { id: "history", label: "Past Payouts", icon: History },
    { id: "analytics", label: "Analytics & Lift", icon: BarChart3 },
    { id: "settings", label: "Adjuster & Support", icon: Headphones }
  ];

  const NOTIFICATIONS = [
    {
      id: 1,
      title: "Fast-Track Payout Approved",
      desc: "Claim CLM-VEH-2026-101 (Rs. 1,85,000) verified and scheduled for direct settlement.",
      time: "20m ago",
      unread: true
    },
    {
      id: 2,
      title: "Document Verification Passed",
      desc: "Apex Auto Repair invoice verified with 100% policy match and authentic letterhead.",
      time: "2h ago",
      unread: true
    },
    {
      id: 3,
      title: "Incident Report Flagged",
      desc: "Synthetic AI image markers detected on CLM-CYB-2026-202. Routed to forensics.",
      time: "1d ago",
      unread: false
    }
  ];

  return (
    <header
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid var(--color-border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 3px rgba(11, 34, 57, 0.04)"
      }}
    >
      {/* Tier 1: Brand Header & Context Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "54px",
          padding: "0 24px",
          borderBottom: "1px solid #F1F5F9"
        }}
      >
        {/* Left: Brand Logo & Category Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Brand Mark */}
          <button
            onClick={onNavigateHome}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0
            }}
            title="Return to Beema Home"
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "6px",
                backgroundColor: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF"
              }}
            >
              <Shield size={16} color="#60A5FA" />
            </div>
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "800",
                  letterSpacing: "0.04em",
                  color: "var(--color-primary)",
                  lineHeight: 1.1
                }}
              >
                BEEMA
              </div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "600",
                  letterSpacing: "0.06em",
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase"
                }}
              >
                Claims Intelligence
              </div>
            </div>
          </button>

          {/* Vertical Divider */}
          <div style={{ width: "1px", height: "22px", backgroundColor: "var(--color-border)" }} />

          {/* Category Dropdown */}
          <div ref={categoryRef} style={{ position: "relative" }}>
            <button
              onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                backgroundColor: "#F8FAFC",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                color: "var(--color-primary)",
                transition: "all 0.15s ease"
              }}
            >
              <CategoryIcon size={14} color="var(--color-accent)" />
              <span>{categoryInfo.name}</span>
              <ChevronDown size={13} color="var(--color-text-muted)" />
            </button>

            {categoryMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: "6px",
                  width: "280px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px -5px rgba(11, 34, 57, 0.12)",
                  padding: "8px",
                  zIndex: 100
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "6px 8px"
                  }}
                >
                  Select Line of Coverage
                </div>
                {INSURANCE_CATEGORIES.map((cat) => {
                  const CatIcon = ICON_MAP[cat.icon] || Shield;
                  const isSelected = cat.id === currentCategory;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onChangeCategory(cat.id);
                        setCategoryMenuOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "8px 10px",
                        backgroundColor: isSelected ? "#EFF6FF" : "transparent",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: "12px",
                        color: isSelected ? "var(--color-accent)" : "var(--color-text-main)",
                        fontWeight: isSelected ? "700" : "500"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <CatIcon size={14} color={isSelected ? "var(--color-accent)" : "#64748B"} />
                        <span>{cat.name}</span>
                      </div>
                      {isSelected && <Check size={13} color="var(--color-accent)" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Search, Persona Context & Quick Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Search Box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#F8FAFC",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              padding: "5px 12px",
              width: "240px"
            }}
          >
            <Search size={14} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search claims, policy IDs..."
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: "12px",
                width: "100%",
                color: "var(--color-text-main)"
              }}
            />
          </div>

          {/* Vertical Divider */}
          <div style={{ width: "1px", height: "20px", backgroundColor: "var(--color-border)" }} />

          {/* Persona Switcher Menu */}
          <div ref={personaRef} style={{ position: "relative" }}>
            <button
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 10px",
                backgroundColor: currentPersona?.segment === "organisation" ? "#F5F3FF" : "#F0F9FF",
                border: currentPersona?.segment === "organisation" ? "1px solid #DDD6FE" : "1px solid #BAE6FD",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                textAlign: "left"
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: currentPersona?.avatarBg || "var(--color-accent)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: "700"
                }}
              >
                {currentPersona?.avatarInitials || "U"}
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)", lineHeight: 1.1 }}>
                  {currentPersona?.name || "Active User"}
                </div>
                <div style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                  {currentPersona?.segment === "organisation" ? "Organisation" : "Individual"}
                </div>
              </div>
              <ChevronDown size={12} color="#64748B" />
            </button>

            {personaMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "6px",
                  width: "290px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px -5px rgba(11, 34, 57, 0.12)",
                  padding: "10px",
                  zIndex: 100
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase", padding: "4px 6px" }}>
                  Active Persona Context
                </div>
                <div style={{ padding: "8px", backgroundColor: "#F8FAFC", borderRadius: "6px", marginBottom: "8px", fontSize: "11px" }}>
                  <div style={{ fontWeight: "700", color: "var(--color-primary)" }}>{currentPersona?.name}</div>
                  <div style={{ color: "var(--color-text-muted)" }}>Policy: {currentPersona?.identifier}</div>
                  <div style={{ color: "var(--color-text-muted)" }}>Adjuster: {currentPersona?.officer}</div>
                </div>

                <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--color-text-muted)", textTransform: "uppercase", padding: "4px 6px" }}>
                  Switch Test Persona
                </div>
                {[...SPOOFED_PERSONAS.individual, ...SPOOFED_PERSONAS.organisation].map((p) => {
                  const isCurr = p.id === currentPersona?.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        localStorage.setItem("beema_persona", JSON.stringify(p));
                        window.location.reload();
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "6px 8px",
                        border: "none",
                        backgroundColor: isCurr ? "#EFF6FF" : "transparent",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "11.5px",
                        textAlign: "left"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: isCurr ? "700" : "500", color: isCurr ? "var(--color-accent)" : "var(--color-text-main)" }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                          {p.segment === "organisation" ? "Organisation" : "Individual"} • {p.title}
                        </div>
                      </div>
                      {isCurr && <Check size={13} color="var(--color-accent)" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
                backgroundColor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748B",
                position: "relative"
              }}
              title="Notifications"
            >
              <Bell size={15} />
              <div
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#EF4444"
                }}
              />
            </button>

            {notificationsOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "6px",
                  width: "320px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px -5px rgba(11, 34, 57, 0.12)",
                  padding: "12px",
                  zIndex: 100
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-primary)" }}>Recent Notifications</span>
                  <span style={{ fontSize: "10.5px", color: "var(--color-accent)", cursor: "pointer", fontWeight: "600" }}>Mark read</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "8px",
                        backgroundColor: n.unread ? "#F8FAFC" : "#FFFFFF",
                        border: "1px solid #F1F5F9",
                        borderRadius: "6px",
                        fontSize: "11.5px"
                      }}
                    >
                      <div style={{ fontWeight: "700", color: "var(--color-primary)" }}>{n.title}</div>
                      <div style={{ color: "var(--color-text-muted)", fontSize: "11px", marginTop: "2px" }}>{n.desc}</div>
                      <div style={{ fontSize: "10px", color: "#94A3B8", marginTop: "4px" }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Exit / Return Home */}
          <button
            onClick={onNavigateHome}
            style={{
              padding: "6px 12px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: "600",
              color: "var(--color-text-main)",
              cursor: "pointer"
            }}
            title="Exit workspace to main home page"
          >
            <Home size={14} color="#64748B" />
            <span>Home</span>
          </button>
        </div>
      </div>

      {/* Tier 2: Horizontal Navigation Tabs Bar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          height: "44px",
          padding: "0 24px",
          backgroundColor: "#F8FAFC",
          overflowX: "auto",
          whiteSpace: "nowrap"
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAction = item.isAction;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: isAction ? "5px 12px" : "6px 12px",
                backgroundColor: isAction
                  ? isActive ? "#1D4ED8" : "#2563EB"
                  : isActive ? "#FFFFFF" : "transparent",
                color: isAction
                  ? "#FFFFFF"
                  : isActive ? "var(--color-accent)" : "var(--color-text-main)",
                border: isAction
                  ? "none"
                  : isActive ? "1px solid var(--color-border)" : "1px solid transparent",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: isActive ? "700" : "500",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: isActive && !isAction ? "0 1px 2px rgba(11, 34, 57, 0.05)" : "none",
                marginRight: isAction ? "8px" : "0"
              }}
            >
              <Icon size={14} color={isAction ? "#FFFFFF" : isActive ? "var(--color-accent)" : "#64748B"} />
              <span>{item.label}</span>
              {typeof item.badge === "number" && item.badge > 0 && (
                <span
                  style={{
                    backgroundColor: isActive ? "#EFF6FF" : "#E2E8F0",
                    color: isActive ? "#1D4ED8" : "#475569",
                    padding: "1px 6px",
                    borderRadius: "10px",
                    fontSize: "10px",
                    fontWeight: "700"
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

