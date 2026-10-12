import React, { useState } from "react";
import { 
  Car, 
  HeartPulse, 
  ShieldCheck, 
  House, 
  Plane, 
  Building2, 
  ArrowRight, 
  Check, 
  Shield, 
  Layers, 
  Cpu, 
  FileCheck2 
} from "lucide-react";
import { INSURANCE_CATEGORIES } from "../data/mockClaims";

const ICON_MAP = {
  Car,
  HeartPulse,
  ShieldCheck,
  House,
  Plane,
  Building2
};

export default function CategorySelection({ onSelectCategory }) {
  const [selectedId, setSelectedId] = useState(null);

  const handleCardClick = (id) => {
    setSelectedId(id);
  };

  const handleContinue = () => {
    if (selectedId) {
      onSelectCategory(selectedId);
    }
  };

  const selectedCategory = INSURANCE_CATEGORIES.find((c) => c.id === selectedId);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--color-background)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      {/* Top Enterprise Header */}
      <header style={{
        padding: "16px 36px",
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            backgroundColor: "var(--color-primary)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFF"
          }}>
            <Shield size={18} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: "18px", fontWeight: "700", color: "var(--color-primary)", letterSpacing: "-0.02em" }}>
            BEEMA
          </span>
          <span style={{ 
            fontSize: "11px", 
            backgroundColor: "#EFF6FF", 
            color: "var(--color-accent)", 
            fontWeight: "600", 
            padding: "2px 8px", 
            borderRadius: "4px",
            border: "1px solid #BFDBFE"
          }}>
            ENTERPRISE INTELLIGENCE
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "13px", color: "var(--color-text-muted)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Cpu size={14} color="var(--color-success)" />
            <span>LAYA Decision Engine: <strong>Local Active</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Layers size={14} color="var(--color-accent)" />
            <span>Delta Lakehouse: <strong>Gold Synced</strong></span>
          </div>
        </div>
      </header>

      {/* Main Category Selection Canvas */}
      <main style={{
        maxWidth: "1080px",
        margin: "0 auto",
        padding: "48px 24px",
        width: "100%"
      }} className="fade-in">
        
        {/* Title Section */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "700", color: "var(--color-primary)", marginBottom: "8px" }}>
            Welcome to Beema
          </h1>
          <p style={{ fontSize: "16px", color: "var(--color-text-muted)", marginBottom: "16px" }}>
            Intelligent claims assessment. Clearer evidence. Better-informed decisions.
          </p>
          <div style={{
            display: "inline-block",
            padding: "8px 18px",
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--color-border)",
            borderRadius: "9999px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-secondary)" }}>
              Which type of insurance claim would you like to assess?
            </span>
          </div>
        </div>

        {/* 6 Category Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
          marginBottom: "36px"
        }}>
          {INSURANCE_CATEGORIES.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || FileCheck2;
            const isSelected = selectedId === cat.id;

            return (
              <div
                key={cat.id}
                role="button"
                tabIndex={0}
                onClick={() => handleCardClick(cat.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick(cat.id);
                  }
                }}
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: isSelected ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                  borderRadius: "8px",
                  padding: "22px 20px",
                  cursor: "pointer",
                  transition: "all 0.18s ease-in-out",
                  boxShadow: isSelected ? "0 4px 12px rgba(37, 99, 235, 0.12)" : "var(--shadow-sm)",
                  position: "relative",
                  outline: "none"
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = "var(--color-secondary-light)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                  }
                }}
              >
                {/* Selection Checkmark */}
                <div style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  border: isSelected ? "2px solid var(--color-accent)" : "2px solid #CBD5E1",
                  backgroundColor: isSelected ? "var(--color-accent)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFF",
                  transition: "all 0.15s ease"
                }}>
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </div>

                {/* Category Icon */}
                <div style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "8px",
                  backgroundColor: isSelected ? "#EFF6FF" : "#F1F5F9",
                  color: isSelected ? "var(--color-accent)" : "var(--color-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  transition: "all 0.15s ease"
                }}>
                  <IconComponent size={24} strokeWidth={2} />
                </div>

                {/* Content */}
                <h3 style={{
                  fontSize: "17px",
                  fontWeight: "600",
                  color: isSelected ? "var(--color-accent)" : "var(--color-primary)",
                  marginBottom: "6px"
                }}>
                  {cat.name}
                </h3>
                
                <p style={{
                  fontSize: "13px",
                  lineHeight: "1.45",
                  color: "var(--color-text-muted)",
                  marginBottom: "12px"
                }}>
                  {cat.description}
                </p>

                <div style={{
                  display: "inline-block",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: isSelected ? "var(--color-accent)" : "#64748B",
                  backgroundColor: isSelected ? "#DBEAFE" : "#F8FAFC",
                  padding: "3px 8px",
                  borderRadius: "4px"
                }}>
                  {cat.badge}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Panel */}
        <div style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-primary)" }}>
              {selectedCategory ? (
                <>Selected: <span style={{ color: "var(--color-accent)" }}>{selectedCategory.name}</span></>
              ) : (
                "No category selected"
              )}
            </div>
            <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
              {selectedCategory
                ? "Click continue to enter the dedicated claims intelligence workspace."
                : "Please select an insurance line above to proceed into the claims workspace."}
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={!selectedId}
            className="btn btn-primary btn-lg"
            style={{
              padding: "12px 28px",
              fontSize: "14px",
              gap: "10px"
            }}
          >
            <span>Continue to Workspace</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: "18px 36px",
        backgroundColor: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "12px",
        color: "var(--color-text-muted)"
      }}>
        <span>Beema Claims Intelligence Platform &copy; 2026. Non-autoregressive decision engine powered by local LAYA.</span>
        <span>Version 2.4.0-Enterprise • ISO 27001 & SOC 2 Type II Certified Workspace</span>
      </footer>
    </div>
  );
}
