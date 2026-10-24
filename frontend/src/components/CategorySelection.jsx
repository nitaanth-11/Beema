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
  FileCheck2,
  Briefcase,
  Trees,
  Lock,
  Truck,
  Ship,
  ShieldAlert,
  User,
  IndianRupee,
  Sparkles
} from "lucide-react";
import { INSURANCE_CATEGORIES, SEGMENTS } from "../data/mockClaims";

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

export default function CategorySelection({ onSelectCategory }) {
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  const handleCardClick = (id) => {
    setSelectedId(id);
  };

  const handleContinue = () => {
    if (selectedId) {
      onSelectCategory(selectedId);
    }
  };

  const handleSkipToDashboard = () => {
    onSelectCategory(selectedSegment === "organisation" ? "captive_org" : "vehicle_ind");
  };

  const filteredCategories = selectedSegment === "all"
    ? INSURANCE_CATEGORIES
    : INSURANCE_CATEGORIES.filter((c) => c.segment === selectedSegment);

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
            width: "34px",
            height: "34px",
            backgroundColor: "var(--color-primary)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFF"
          }}>
            <Shield size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "19px", fontWeight: "800", color: "var(--color-primary)", letterSpacing: "-0.03em" }}>
                BEEMA
              </span>
              <span style={{ 
                fontSize: "11px", 
                backgroundColor: "#EFF6FF", 
                color: "var(--color-accent)", 
                fontWeight: "700", 
                padding: "2px 8px", 
                borderRadius: "4px",
                border: "1px solid #BFDBFE"
              }}>
                ENTERPRISE CLAIMS INTELLIGENCE
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
              Multi-Segment Claims & Fraud Investigation Engine (INR Currency)
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "13px", color: "var(--color-text-muted)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <IndianRupee size={14} color="var(--color-accent)" />
            <span>Currency: <strong>Indian Rupees (₹)</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Cpu size={14} color="var(--color-success)" />
            <span>LAYA Decision Engine: <strong>Active</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Layers size={14} color="#7C3AED" />
            <span>Delta Lakehouse: <strong>Gold Synchronized</strong></span>
          </div>
        </div>
      </header>

      {/* Main Category Selection Canvas */}
      <main style={{
        maxWidth: "1180px",
        margin: "0 auto",
        padding: "40px 24px 60px",
        width: "100%"
      }} className="fade-in">
        
        {/* Title Section */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 14px",
            backgroundColor: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: "9999px",
            fontSize: "12px",
            fontWeight: "700",
            color: "var(--color-accent)",
            marginBottom: "14px"
          }}>
            <Sparkles size={14} />
            <span>AI-POWERED LOSS ADJUSTMENT & TRIAGE IN RUPEES (₹)</span>
          </div>
          <h1 style={{ fontSize: "34px", fontWeight: "800", color: "var(--color-primary)", marginBottom: "8px", letterSpacing: "-0.02em" }}>
            Welcome to Beema Insurance Platform
          </h1>
          <p style={{ fontSize: "16px", color: "var(--color-text-muted)", maxWidth: "680px", margin: "0 auto 24px" }}>
            Bifurcated claims assessment for <strong>Individual</strong> retail policyholders and <strong>Organisation</strong> enterprise risks with multi-modal fraud detection.
          </p>

          {/* Segment Selector Tabs (Individual vs Organisation Bifurcation) */}
          <div style={{
            display: "inline-flex",
            backgroundColor: "#F1F5F9",
            padding: "5px",
            borderRadius: "10px",
            border: "1px solid var(--color-border)",
            gap: "4px"
          }}>
            {SEGMENTS.map((seg) => {
              const isSelected = selectedSegment === seg.id;
              const IconComp = seg.id === "individual" ? User : seg.id === "organisation" ? Building2 : Layers;
              return (
                <button
                  key={seg.id}
                  onClick={() => setSelectedSegment(seg.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    borderRadius: "7px",
                    border: "none",
                    backgroundColor: isSelected ? "#FFFFFF" : "transparent",
                    color: isSelected ? "var(--color-primary)" : "var(--color-text-muted)",
                    fontWeight: isSelected ? "700" : "500",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: isSelected ? "0 2px 6px rgba(0, 0, 0, 0.08)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  <IconComp size={16} color={isSelected ? "var(--color-accent)" : "#64748B"} />
                  <span>{seg.label}</span>
                  <span style={{
                    fontSize: "11px",
                    padding: "1px 6px",
                    borderRadius: "10px",
                    backgroundColor: isSelected ? "#EFF6FF" : "#E2E8F0",
                    color: isSelected ? "var(--color-accent)" : "#64748B",
                    fontWeight: "700"
                  }}>
                    {seg.id === "all" 
                      ? INSURANCE_CATEGORIES.length 
                      : INSURANCE_CATEGORIES.filter(c => c.segment === seg.id).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "18px",
          marginBottom: "36px"
        }}>
          {filteredCategories.map((cat) => {
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
                  borderRadius: "10px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "all 0.18s ease-in-out",
                  boxShadow: isSelected ? "0 6px 16px rgba(37, 99, 235, 0.15)" : "var(--shadow-sm)",
                  position: "relative",
                  outline: "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = "var(--color-secondary-light)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                    e.currentTarget.style.transform = "none";
                  }
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    {/* Category Icon */}
                    <div style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "8px",
                      backgroundColor: isSelected ? "#EFF6FF" : "#F8FAFC",
                      color: isSelected ? "var(--color-accent)" : (cat.color || "var(--color-secondary)"),
                      border: `1px solid ${isSelected ? "#BFDBFE" : "#E2E8F0"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <IconComponent size={22} strokeWidth={2.2} />
                    </div>

                    {/* Segment Badge & Selection Radio */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        backgroundColor: cat.segment === "organisation" ? "#F5F3FF" : "#ECFDF5",
                        color: cat.segment === "organisation" ? "#6D28D9" : "#047857",
                        border: `1px solid ${cat.segment === "organisation" ? "#DDD6FE" : "#A7F3D0"}`
                      }}>
                        {cat.segment === "organisation" ? "🏢 Organisation" : "👤 Individual"}
                      </span>

                      <div style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: isSelected ? "2px solid var(--color-accent)" : "2px solid #CBD5E1",
                        backgroundColor: isSelected ? "var(--color-accent)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFF"
                      }}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{
                    fontSize: "17px",
                    fontWeight: "700",
                    color: isSelected ? "var(--color-accent)" : "var(--color-primary)",
                    marginBottom: "6px"
                  }}>
                    {cat.name}
                  </h3>
                  
                  <p style={{
                    fontSize: "13px",
                    lineHeight: "1.5",
                    color: "var(--color-text-muted)",
                    marginBottom: "14px"
                  }}>
                    {cat.description}
                  </p>
                </div>

                {/* Sub-type Pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "auto" }}>
                  {(cat.defaultTypes || []).slice(0, 2).map((type, tIdx) => (
                    <span key={tIdx} style={{
                      fontSize: "11px",
                      backgroundColor: "#F1F5F9",
                      color: "#475569",
                      padding: "2px 7px",
                      borderRadius: "4px",
                      border: "1px solid #E2E8F0"
                    }}>
                      {type}
                    </span>
                  ))}
                  {(cat.defaultTypes || []).length > 2 && (
                    <span style={{ fontSize: "11px", color: "#94A3B8", alignSelf: "center" }}>
                      +{cat.defaultTypes.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Panel */}
        <div style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "10px",
          padding: "18px 26px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "var(--shadow-sm)",
          flexWrap: "wrap",
          gap: "14px"
        }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)" }}>
              {selectedCategory ? (
                <span>Selected: <strong style={{ color: "var(--color-accent)" }}>{selectedCategory.name}</strong> ({selectedCategory.segment === "organisation" ? "Organisation" : "Individual"})</span>
              ) : (
                "Please select an insurance line above, or jump straight into the full portfolio dashboard."
              )}
            </div>
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              Financial settlements, claims verification and loss values processed in Indian Rupees (₹).
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={handleSkipToDashboard}
              style={{
                padding: "10px 18px",
                backgroundColor: "transparent",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                color: "var(--color-text-muted)",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Enter Dashboard Directly
            </button>

            <button
              onClick={handleContinue}
              disabled={!selectedId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 24px",
                backgroundColor: selectedId ? "var(--color-accent)" : "#94A3B8",
                color: "#FFF",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: selectedId ? "pointer" : "not-allowed",
                boxShadow: selectedId ? "0 2px 8px rgba(37, 99, 235, 0.35)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              <span>Assess Claims in this Line</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </main>

      {/* Enterprise Security Footer */}
      <footer style={{
        padding: "16px 36px",
        backgroundColor: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "12px",
        color: "var(--color-text-muted)"
      }}>
        <div>
          Beema Enterprise Claims AI — Supporting Indian General & Corporate Insurance Guidelines
        </div>
        <div>
          ACID Delta Lakehouse • PyTorch ResNet-18 CV • LAYA Decision Core
        </div>
      </footer>
    </div>
  );
}
