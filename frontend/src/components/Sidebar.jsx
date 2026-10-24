import React from "react";
import {
  LayoutDashboard,
  FileSpreadsheet,
  PlusCircle,
  Cpu,
  FileCheck,
  ShieldAlert,
  History,
  BarChart3,
  UserCheck,
  RefreshCw,
  Shield,
  Car,
  HeartPulse,
  ShieldCheck,
  House,
  Plane,
  Building2,
  CheckCircle2,
  Headphones,
  User,
  Briefcase,
  Trees,
  Lock,
  Truck,
  Ship,
  Home
} from "lucide-react";
import { INSURANCE_CATEGORIES } from "../data/mockClaims";

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
  ShieldAlert
};

export default function Sidebar({
  activeTab,
  onTabChange,
  currentCategory,
  onChangeCategory,
  onNavigateHome,
  currentPersona,
  claimsCount = 0
}) {
  const categoryInfo = INSURANCE_CATEGORIES.find((c) => c.id === currentCategory) || INSURANCE_CATEGORIES[0];
  const CategoryIcon = ICON_MAP[categoryInfo.icon] || Car;

  const NAV_ITEMS = [
    { id: "overview", label: "My Claims Hub", icon: LayoutDashboard },
    { id: "all_claims", label: "My Claims & Tracking", icon: FileSpreadsheet, badge: claimsCount },
    { id: "new_claim", label: "File a New Claim", icon: PlusCircle },
    { id: "laya", label: "LAYA AI Decision Status", icon: Cpu },
    { id: "documents", label: "My Documents & Receipts", icon: FileCheck },
    { id: "policy", label: "My Policy & Coverage", icon: ShieldAlert },
    { id: "history", label: "Past Claims & Payouts", icon: History },
    { id: "analytics", label: "Coverage & Usage Summary", icon: BarChart3 },
    { id: "settings", label: "My Adjuster & Support", icon: Headphones }
  ];

  return (
    <aside style={{
      width: "var(--sidebar-width)",
      backgroundColor: "var(--color-primary)",
      color: "#FFFFFF",
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid rgba(255, 255, 255, 0.08)",
      flexShrink: 0,
      minHeight: "100vh"
    }}>
      {/* Brand Header */}
      <div style={{
        padding: "16px 18px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            backgroundColor: "var(--color-accent)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFF"
          }}>
            <Shield size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "700", letterSpacing: "-0.01em" }}>BEEMA</div>
            <div style={{ fontSize: "10px", color: "#93C5FD", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600" }}>
              Claims Intelligence
            </div>
          </div>
        </div>

        <button
          onClick={onNavigateHome}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "6px",
            padding: "5px 8px",
            color: "#FFFFFF",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "11px",
            fontWeight: "600"
          }}
          title="Return to Big Dual Banners (Home)"
        >
          <Home size={12} />
          <span>Home</span>
        </button>
      </div>

      {/* Selected Category Tile */}
      <div style={{
        padding: "12px 14px",
        margin: "12px 14px 6px 14px",
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "10px", fontWeight: "600", textTransform: "uppercase", color: "#94A3B8", letterSpacing: "0.05em" }}>
            Active Insurance Line
          </span>
          <button
            onClick={onChangeCategory}
            style={{
              background: "none",
              border: "none",
              color: "#93C5FD",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "3px",
              padding: "2px 4px",
              borderRadius: "3px"
            }}
            title="Switch Insurance Category"
          >
            <RefreshCw size={11} />
            <span>Switch</span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <div style={{
            width: "24px",
            height: "24px",
            borderRadius: "4px",
            backgroundColor: "var(--color-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <CategoryIcon size={14} color="#FFF" />
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#F8FAFC" }}>
              {categoryInfo.name}
            </div>
            <div style={{ fontSize: "10px", color: categoryInfo.segment === "organisation" ? "#C4B5FD" : "#86EFAC", fontWeight: "600" }}>
              {categoryInfo.segment === "organisation" ? "🏢 Organisation" : "👤 Individual"}
            </div>
          </div>
        </div>
      </div>

      {/* Spoofed Persona Profile Pill */}
      <div style={{
        margin: "0 14px 10px 14px",
        padding: "10px 12px",
        backgroundColor: currentPersona?.segment === "organisation" ? "rgba(124, 58, 237, 0.2)" : "rgba(37, 99, 235, 0.2)",
        borderRadius: "6px",
        border: currentPersona?.segment === "organisation" ? "1px solid rgba(167, 139, 250, 0.4)" : "1px solid rgba(96, 165, 250, 0.4)",
        display: "flex",
        alignItems: "center",
        gap: "10px"
      }}>
        <div style={{
          width: "28px",
          height: "28px",
          borderRadius: currentPersona?.segment === "organisation" ? "6px" : "50%",
          backgroundColor: currentPersona?.avatarBg || "var(--color-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFF",
          fontWeight: "800",
          fontSize: "11px",
          flexShrink: 0
        }}>
          {currentPersona?.avatarInitials || "RM"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {currentPersona?.name || "Rajesh Malhotra"}
          </div>
          <div style={{ fontSize: "10px", color: currentPersona?.segment === "organisation" ? "#E9D5FF" : "#BFDBFE" }}>
            {currentPersona?.segment === "organisation" ? "🏢 Corporate Risk Officer" : "👤 Retail Policyholder"}
          </div>
        </div>
      </div>

      {/* Main Customer Navigation */}
      <nav style={{ padding: "4px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "9px 12px",
                fontSize: "13px",
                fontWeight: isActive ? "600" : "400",
                color: isActive ? "#FFFFFF" : "#CBD5E1",
                backgroundColor: isActive ? "rgba(37, 99, 235, 0.28)" : "transparent",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.12s ease",
                borderLeft: isActive ? "3px solid var(--color-accent)" : "3px solid transparent"
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} color={isActive ? "#60A5FA" : "#94A3B8"} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  color: "#E2E8F0",
                  padding: "1px 7px",
                  borderRadius: "10px"
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Reassuring Customer Assistant Status */}
      <div style={{
        padding: "12px 14px",
        margin: "12px 14px",
        backgroundColor: "rgba(11, 29, 47, 0.8)",
        borderRadius: "6px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        fontSize: "11px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <CheckCircle2 size={12} color="#10B981" />
          <span style={{ fontWeight: "600", color: "#E2E8F0" }}>LAYA AI Assistant Active</span>
        </div>
        <div style={{ color: "#94A3B8", fontSize: "10px", lineHeight: "1.4" }}>
          Your claims are automatically validated for instant Fast-Track payout eligibility.
        </div>
      </div>
    </aside>
  );
}
