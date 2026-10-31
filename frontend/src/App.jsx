import React, { useState, useEffect } from "react";
import HomePage from "./components/HomePage";
import CategorySelection from "./components/CategorySelection";
import HorizontalNavbar from "./components/HorizontalNavbar";
import WorkspaceDashboard from "./components/WorkspaceDashboard";
import NewClaimIntake from "./components/NewClaimIntake";
import ClaimDetailsLaya from "./components/ClaimDetailsLaya";
import DocumentVerification from "./components/DocumentVerification";
import PolicyCoverage from "./components/PolicyCoverage";
import ReportsAnalytics from "./components/ReportsAnalytics";
import ClaimHistory from "./components/ClaimHistory";
import Settings from "./components/Settings";
import { INITIAL_CLAIMS, SPOOFED_PERSONAS } from "./data/mockClaims";

export default function App() {
  // Spoofed persona state (Individual or Organisation)
  const [currentPersona, setCurrentPersona] = useState(() => {
    const saved = localStorage.getItem("beema_persona");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SPOOFED_PERSONAS.individual[0];
      }
    }
    return SPOOFED_PERSONAS.individual[0];
  });

  // Dedicated Home Page with Big Dual Banners view state (starts on Home Page)
  const [isHomeView, setIsHomeView] = useState(() => {
    // If user hasn't explicitly proceeded in this session, start at Home Page
    const sessionProceeded = sessionStorage.getItem("beema_session_proceeded");
    return !sessionProceeded;
  });

  // Category Selection state (persisted across sessions)
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem("beema_category") || "vehicle_ind";
  });

  // Navigation tab state
  const [activeTab, setActiveTab] = useState("overview");

  // In-memory claims ledger initialized with multi-segment Rupee baseline claims
  const [claims, setClaims] = useState(() => {
    const saved = localStorage.getItem("beema_claims_ledger");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If parsed contains legacy motor category or dollar values, reseed with INITIAL_CLAIMS
        const hasLegacy = parsed.some(c => c.category === "motor" || c.id === "CLM-MTR-2026-081");
        if (!hasLegacy && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        return INITIAL_CLAIMS;
      }
    }
    return INITIAL_CLAIMS;
  });

  // Selected claim for LAYA detail view
  const [selectedClaimId, setSelectedClaimId] = useState(null);

  // Global search query
  const [searchQuery, setSearchQuery] = useState("");

  // Persist claims ledger changes
  useEffect(() => {
    localStorage.setItem("beema_claims_ledger", JSON.stringify(claims));
  }, [claims]);

  // Handle proceeding from Big Banner Home Page with spoofed persona
  const handleProceedWithPersona = (persona) => {
    setCurrentPersona(persona);
    try {
      localStorage.setItem("beema_persona", JSON.stringify(persona));
      sessionStorage.setItem("beema_session_proceeded", "true");
    } catch (e) {}

    const cat = persona.defaultCategory || (persona.segment === "organisation" ? "captive_org" : "vehicle_ind");
    setSelectedCategory(cat);
    localStorage.setItem("beema_category", cat);

    if (persona.activeClaimId) {
      setSelectedClaimId(persona.activeClaimId);
    }
    setIsHomeView(false);
    setActiveTab("overview");
  };

  // Return to Big Banner Home Page
  const handleNavigateHome = () => {
    setIsHomeView(true);
  };

  // Handle category selection from fallback category view
  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    localStorage.setItem("beema_category", categoryId);
    setActiveTab("overview");
    setIsHomeView(false);
  };

  // Change category returns user to Home Page / Big Banner view
  const handleChangeCategory = () => {
    setIsHomeView(true);
  };

  // Select claim to inspect in LAYA decision support view
  const handleSelectClaim = (claimId) => {
    setSelectedClaimId(claimId);
    setActiveTab("laya");
  };

  // Add newly filed claim
  const handleClaimCreated = (newClaim) => {
    setClaims((prev) => [newClaim, ...prev]);
    setSelectedClaimId(newClaim.id);
    setActiveTab("laya");
  };

  // Update existing claim findings or status
  const handleUpdateClaim = (updatedClaim) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === updatedClaim.id ? updatedClaim : c))
    );
  };

  // Claims in active category
  const currentCategoryClaims = claims.filter((c) => c.category === selectedCategory);
  const activeCategoryClaims = currentCategoryClaims.length > 0
    ? currentCategoryClaims
    : claims;

  const activeClaim = selectedClaimId
    ? claims.find((c) => c.id === selectedClaimId) || activeCategoryClaims[0]
    : activeCategoryClaims[0] || claims[0];

  // PRIMARY FRONT DOOR: Big Banner Home Page with Bifurcation & User Spoofing
  if (isHomeView) {
    return <HomePage onProceedWithPersona={handleProceedWithPersona} />;
  }

  return (
    <div
      className="app-shell"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "var(--color-background, #F8FAFC)",
        color: "var(--color-text, #0F172A)"
      }}
    >
      {/* Enterprise Full-Width Horizontal Header Navbar */}
      <HorizontalNavbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "new_claim") setSelectedClaimId(null);
        }}
        currentCategory={selectedCategory}
        onChangeCategory={handleChangeCategory}
        onNavigateHome={handleNavigateHome}
        currentPersona={currentPersona}
        claimsCount={activeCategoryClaims.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Full-Width Content Container with Crisp Spacing & Field Separation */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: "1480px",
          margin: "0 auto",
          padding: "24px 24px 48px 24px",
          boxSizing: "border-box"
        }}
      >
        {activeTab === "overview" && (
          <WorkspaceDashboard
            currentCategory={selectedCategory}
            currentPersona={currentPersona}
            onNavigateHome={handleNavigateHome}
            claims={claims}
            onSelectClaim={handleSelectClaim}
            onNavigateNewClaim={() => setActiveTab("new_claim")}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === "all_claims" && (
          <WorkspaceDashboard
            currentCategory={selectedCategory}
            currentPersona={currentPersona}
            onNavigateHome={handleNavigateHome}
            claims={claims}
            onSelectClaim={handleSelectClaim}
            onNavigateNewClaim={() => setActiveTab("new_claim")}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === "new_claim" && (
          <NewClaimIntake
            currentCategory={selectedCategory}
            currentPersona={currentPersona}
            onClaimCreated={handleClaimCreated}
            onCancel={() => setActiveTab("overview")}
          />
        )}

        {activeTab === "laya" && (
          <ClaimDetailsLaya
            claim={activeClaim}
            onBack={() => setActiveTab("overview")}
            onUpdateClaim={handleUpdateClaim}
            onNavigateDocuments={() => setActiveTab("documents")}
            onNavigatePolicy={() => setActiveTab("policy")}
          />
        )}

        {activeTab === "documents" && (
          <DocumentVerification
            currentCategory={selectedCategory}
            claims={activeCategoryClaims}
          />
        )}

        {activeTab === "policy" && (
          <PolicyCoverage
            currentCategory={selectedCategory}
          />
        )}

        {activeTab === "history" && (
          <ClaimHistory
            currentCategory={selectedCategory}
            claims={activeCategoryClaims}
            onSelectClaim={handleSelectClaim}
          />
        )}

        {activeTab === "analytics" && (
          <ReportsAnalytics
            claims={activeCategoryClaims}
          />
        )}

        {activeTab === "settings" && (
          <Settings />
        )}
      </main>
    </div>
  );
}
