import React, { useState } from "react";
import { 
  Shield, 
  Building2, 
  User, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Cpu, 
  Layers, 
  IndianRupee, 
  Car, 
  HeartPulse, 
  House, 
  ShieldAlert, 
  Briefcase, 
  Trees, 
  Lock, 
  Truck, 
  Ship, 
  Plane, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink
} from "lucide-react";
import { SPOOFED_PERSONAS } from "../data/mockClaims";
import { formatRupees } from "../utils/currency";

export default function HomePage({ onProceedWithPersona }) {
  // Currently selected spoofed user in Individual
  const [selectedIndPersonaId, setSelectedIndPersonaId] = useState(SPOOFED_PERSONAS.individual[0].id);
  // Currently selected spoofed user in Organisation
  const [selectedOrgPersonaId, setSelectedOrgPersonaId] = useState(SPOOFED_PERSONAS.organisation[0].id);

  // Active hover preview
  const [hoveredBanner, setHoveredBanner] = useState(null);

  const selectedIndPersona = SPOOFED_PERSONAS.individual.find(p => p.id === selectedIndPersonaId) || SPOOFED_PERSONAS.individual[0];
  const selectedOrgPersona = SPOOFED_PERSONAS.organisation.find(p => p.id === selectedOrgPersonaId) || SPOOFED_PERSONAS.organisation[0];

  const handleProceedIndividual = () => {
    onProceedWithPersona(selectedIndPersona);
  };

  const handleProceedOrganisation = () => {
    onProceedWithPersona(selectedOrgPersona);
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--color-background)",
      color: "var(--color-text-main)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      fontFamily: "var(--font-family)"
    }}>
      {/* Top Institutional Header (Marsh / McLennan Style) */}
      <header style={{
        padding: "16px 40px",
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "var(--shadow-sm)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            backgroundColor: "var(--color-primary)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF"
          }}>
            <Shield size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--color-primary)" }}>
                BEEMA
              </span>
              <span style={{
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.06em",
                backgroundColor: "#EFF6FF",
                color: "var(--color-accent)",
                border: "1px solid #BFDBFE",
                padding: "2px 8px",
                borderRadius: "4px"
              }}>
                ENTERPRISE CLAIMS INTELLIGENCE
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
              Institutional Multi-Modal Claims Triage &amp; Fraud Investigation Platform
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px", fontSize: "12px", color: "var(--color-text-muted)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <IndianRupee size={14} color="var(--color-accent)" />
            <span>Valuation Standard: <strong style={{ color: "var(--color-primary)" }}>INR (₹) Standard</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Cpu size={14} color="var(--color-success)" />
            <span>LAYA Engine: <strong style={{ color: "var(--color-success)" }}>Active</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Layers size={14} color="#7C3AED" />
            <span>Syndicate Ledger: <strong style={{ color: "#7C3AED" }}>Synchronized</strong></span>
          </div>
        </div>
      </header>

      {/* Main Home Canvas */}
      <main style={{
        maxWidth: "1320px",
        margin: "0 auto",
        padding: "36px 24px 44px",
        width: "100%"
      }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
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
            <span>PORTAL BIFURCATION &bull; SELECT CLIENT PERSONA TO PROCEED</span>
          </div>

          <h1 style={{
            fontSize: "34px",
            fontWeight: "800",
            color: "var(--color-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "10px"
          }}>
            Enterprise Insurance Claims Gateway
          </h1>
          <p style={{
            fontSize: "15px",
            color: "var(--color-text-muted)",
            maxWidth: "760px",
            margin: "0 auto",
            lineHeight: "1.5"
          }}>
            IRDAI-compliant bifurcated platform for <strong>Individual</strong> retail policyholders and <strong>Organisation</strong> enterprise corporate risks. Select a spoofed profile below to experience the real-time adjudicator.
          </p>
        </div>

        {/* ==================================================== */}
        {/* BIG DUAL BANNERS (MARSH STYLE: CLEAN, SHARP, INSTITUTIONAL) */}
        {/* ==================================================== */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "28px",
          marginBottom: "32px"
        }}>

          {/* ========================================== */}
          {/* BANNER 1: INDIVIDUAL (RETAIL & PERSONAL)   */}
          {/* ========================================== */}
          <div
            onMouseEnter={() => setHoveredBanner("individual")}
            onMouseLeave={() => setHoveredBanner(null)}
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "10px",
              border: hoveredBanner === "individual" ? "1px solid #2563EB" : "1px solid var(--color-border)",
              boxShadow: hoveredBanner === "individual" ? "var(--shadow-lg)" : "var(--shadow-md)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "all 0.18s ease-in-out",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Top Accent Stripe */}
            <div style={{ height: "4px", backgroundColor: "#2563EB", width: "100%" }} />

            <div style={{ padding: "28px" }}>
              {/* Header Title */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    backgroundColor: "#EFF6FF",
                    border: "1px solid #BFDBFE",
                    color: "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <User size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#2563EB"
                    }}>
                      PORTAL 01 &bull; RETAIL
                    </span>
                    <h2 style={{ fontSize: "22px", fontWeight: "800", margin: "2px 0 0 0", color: "var(--color-primary)" }}>
                      Individual Portal
                    </h2>
                  </div>
                </div>

                <span style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  backgroundColor: "#ECFDF5",
                  color: "#065F46",
                  border: "1px solid #A7F3D0",
                  padding: "4px 10px",
                  borderRadius: "20px"
                }}>
                  Personal &amp; Retail Lines
                </span>
              </div>

              <p style={{ fontSize: "13px", color: "var(--color-text-muted)", lineHeight: "1.5", marginBottom: "18px" }}>
                Policies covering private motor collision damage, health hospitalisation floaters, residential fire/water casualty, and personal digital UPI cyber fraud.
              </p>

              {/* Personal Lines Categories Included */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-secondary)", marginBottom: "8px" }}>
                  Personal Lines Covered (Values in INR ₹):
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", backgroundColor: "#F8FAFC", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                    <Car size={15} color="#2563EB" />
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-primary)" }}>Vehicle Insurance</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", backgroundColor: "#F8FAFC", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                    <HeartPulse size={15} color="#059669" />
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-primary)" }}>Health Insurance</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", backgroundColor: "#F8FAFC", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                    <House size={15} color="#D97706" />
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-primary)" }}>Property Risk (Home)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", backgroundColor: "#F8FAFC", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                    <ShieldAlert size={15} color="#4F46E5" />
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-primary)" }}>Personal Cyber Risk</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", backgroundColor: "#F8FAFC", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                    <ShieldCheck size={15} color="#7C3AED" />
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-primary)" }}>Life &amp; Term Cover</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", backgroundColor: "#F8FAFC", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                    <Plane size={15} color="#0284C7" />
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-primary)" }}>Travel Transit</span>
                  </div>
                </div>
              </div>

              {/* SPOOF POLICYHOLDER PERSONA SECTION */}
              <div style={{
                backgroundColor: "#F8FAFC",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                padding: "14px 16px",
                marginBottom: "20px"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-primary)" }}>
                    👤 Spoof Individual Policyholder:
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    Select Persona:
                  </span>
                </div>

                {/* Persona Selector Chips */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
                  {SPOOFED_PERSONAS.individual.map((persona) => {
                    const isSelected = selectedIndPersonaId === persona.id;
                    return (
                      <button
                        key={persona.id}
                        type="button"
                        onClick={() => setSelectedIndPersonaId(persona.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "5px 11px",
                          borderRadius: "16px",
                          border: isSelected ? "1px solid #2563EB" : "1px solid #CBD5E1",
                          backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
                          color: isSelected ? "#1D4ED8" : "var(--color-secondary)",
                          fontSize: "12px",
                          fontWeight: isSelected ? "700" : "500",
                          cursor: "pointer",
                          transition: "all 0.12s ease"
                        }}
                      >
                        <span style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          backgroundColor: isSelected ? "#2563EB" : "#94A3B8"
                        }} />
                        <span>{persona.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Persona Identity Details */}
                <div style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      backgroundColor: selectedIndPersona.avatarBg,
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "800",
                      fontSize: "13px"
                    }}>
                      {selectedIndPersona.avatarInitials}
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-primary)" }}>
                        {selectedIndPersona.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                        {selectedIndPersona.title} &bull; {selectedIndPersona.identifier}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "10px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Active Claim</div>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--color-accent)" }}>
                      {formatRupees(selectedIndPersona.claimedAmount, { includeDecimals: false })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BIG PROCEED BUTTON (INDIVIDUAL) */}
            <div style={{ padding: "0 28px 24px" }}>
              <button
                onClick={handleProceedIndividual}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "13px 20px",
                  fontSize: "14px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                <span>Proceed as {selectedIndPersona.name.split(" ")[0]} (Individual Portal)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>


          {/* ========================================== */}
          {/* BANNER 2: ORGANISATION (COMMERCIAL RISK)   */}
          {/* ========================================== */}
          <div
            onMouseEnter={() => setHoveredBanner("organisation")}
            onMouseLeave={() => setHoveredBanner(null)}
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "10px",
              border: hoveredBanner === "organisation" ? "1px solid #0F766E" : "1px solid var(--color-border)",
              boxShadow: hoveredBanner === "organisation" ? "var(--shadow-lg)" : "var(--shadow-md)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "all 0.18s ease-in-out",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Top Accent Stripe */}
            <div style={{ height: "4px", backgroundColor: "#0F766E", width: "100%" }} />

            <div style={{ padding: "28px" }}>
              {/* Header Title */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    backgroundColor: "#F0FDFA",
                    border: "1px solid #CCFBF1",
                    color: "#0F766E",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Building2 size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#0F766E"
                    }}>
                      PORTAL 02 &bull; CORPORATE
                    </span>
                    <h2 style={{ fontSize: "22px", fontWeight: "800", margin: "2px 0 0 0", color: "var(--color-primary)" }}>
                      Organisation Portal
                    </h2>
                  </div>
                </div>

                <span style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  backgroundColor: "#F5F3FF",
                  color: "#6D28D9",
                  border: "1px solid #DDD6FE",
                  padding: "4px 10px",
                  borderRadius: "20px"
                }}>
                  Corporate &amp; Commercial Lines
                </span>
              </div>

              <p style={{ fontSize: "13px", color: "var(--color-text-muted)", lineHeight: "1.5", marginBottom: "18px" }}>
                Commercial lines covering self-insured captive retention pools, environmental pollution remediation, corporate ransomware response, and factory all-risk.
              </p>

              {/* Corporate Lines Categories Included */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-secondary)", marginBottom: "8px" }}>
                  Corporate Lines Covered (Values in INR ₹):
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", backgroundColor: "#F8FAFC", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                    <Briefcase size={15} color="#0F766E" />
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-primary)" }}>Captive Insurance</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", backgroundColor: "#F8FAFC", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                    <Trees size={15} color="#16A34A" />
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-primary)" }}>Environment Risk</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", backgroundColor: "#F8FAFC", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                    <Lock size={15} color="#4F46E5" />
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-primary)" }}>Corporate Cyber</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", backgroundColor: "#F8FAFC", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                    <Building2 size={15} color="#EA580C" />
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-primary)" }}>Property (Industrial)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", backgroundColor: "#F8FAFC", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                    <Truck size={15} color="#2563EB" />
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-primary)" }}>Commercial Fleet</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", backgroundColor: "#F8FAFC", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                    <Ship size={15} color="#0284C7" />
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-primary)" }}>Trade &amp; Marine Cargo</span>
                  </div>
                </div>
              </div>

              {/* SPOOF CORPORATE RISK OFFICER SECTION */}
              <div style={{
                backgroundColor: "#F8FAFC",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                padding: "14px 16px",
                marginBottom: "20px"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-primary)" }}>
                    🏢 Spoof Corporate Risk Entity:
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    Select Entity:
                  </span>
                </div>

                {/* Corporate Persona Selector Chips */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
                  {SPOOFED_PERSONAS.organisation.map((corp) => {
                    const isSelected = selectedOrgPersonaId === corp.id;
                    return (
                      <button
                        key={corp.id}
                        type="button"
                        onClick={() => setSelectedOrgPersonaId(corp.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "5px 11px",
                          borderRadius: "16px",
                          border: isSelected ? "1px solid #0F766E" : "1px solid #CBD5E1",
                          backgroundColor: isSelected ? "#F0FDFA" : "#FFFFFF",
                          color: isSelected ? "#0F766E" : "var(--color-secondary)",
                          fontSize: "12px",
                          fontWeight: isSelected ? "700" : "500",
                          cursor: "pointer",
                          transition: "all 0.12s ease"
                        }}
                      >
                        <span style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          backgroundColor: isSelected ? "#0F766E" : "#94A3B8"
                        }} />
                        <span>{corp.name.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Corporate Identity Details */}
                <div style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "6px",
                      backgroundColor: selectedOrgPersona.avatarBg,
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "800",
                      fontSize: "13px"
                    }}>
                      {selectedOrgPersona.avatarInitials}
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-primary)" }}>
                        {selectedOrgPersona.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                        Officer: {selectedOrgPersona.officer} &bull; {selectedOrgPersona.identifier}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "10px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Corporate Claim</div>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: "#0F766E" }}>
                      {formatRupees(selectedOrgPersona.claimedAmount, { includeDecimals: false })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BIG PROCEED BUTTON (ORGANISATION) */}
            <div style={{ padding: "0 28px 24px" }}>
              <button
                onClick={handleProceedOrganisation}
                style={{
                  width: "100%",
                  padding: "13px 20px",
                  backgroundColor: "#0F766E",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "background-color 0.15s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#115E59"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#0F766E"}
              >
                <span>Proceed as {selectedOrgPersona.name.split(" ")[0]} (Organisation Portal)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>

        {/* Global Master Syndicate Bar */}
        <div style={{
          backgroundColor: "var(--color-surface)",
          borderRadius: "8px",
          border: "1px solid var(--color-border)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "var(--shadow-sm)",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)" }}>
              Need to inspect both portfolios simultaneously?
            </div>
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              Open the unified master claims ledger to monitor all retail and corporate syndicates in Indian Rupees (₹).
            </div>
          </div>

          <button
            onClick={() => onProceedWithPersona({
              id: "unified_admin",
              name: "Unified Master Auditor",
              segment: "all",
              title: "Chief Claims Syndicate Auditor",
              defaultCategory: "vehicle_ind"
            })}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: "700", gap: "6px" }}
          >
            <span>Enter Unified Portfolio Ledger</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer style={{
        padding: "16px 40px",
        backgroundColor: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "12px",
        color: "var(--color-text-muted)"
      }}>
        <div>
          Beema Autonomous Insurance Platform &bull; Built in strict accordance with Indian Insurance (IRDAI) guidelines
        </div>
        <div>
          Delta Lakehouse Columnar Logs &bull; ResNet-18 Deep Damage Extractor &bull; LAYA Triage Core
        </div>
      </footer>
    </div>
  );
}
