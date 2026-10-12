import React, { useState, useEffect } from "react";
import CategorySelection from "./components/CategorySelection";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import WorkspaceDashboard from "./components/WorkspaceDashboard";
import NewClaimIntake from "./components/NewClaimIntake";
import ClaimDetailsLaya from "./components/ClaimDetailsLaya";
import DocumentVerification from "./components/DocumentVerification";
import PolicyCoverage from "./components/PolicyCoverage";
import ReportsAnalytics from "./components/ReportsAnalytics";
import ClaimHistory from "./components/ClaimHistory";
import Settings from "./components/Settings";
import { INITIAL_CLAIMS } from "./data/mockClaims";

export default function App() {
  // Category Selection state (persisted across sessions)
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem("beema_category") || null;
  });

  // Navigation tab state
  const [activeTab, setActiveTab] = useState("overview");

  // In-memory claims ledger initialized strictly with the 1 hardcoded baseline claim
  const [claims, setClaims] = useState(() => {
    const saved = localStorage.getItem("beema_claims_ledger");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only keep if 1 or 2 (baseline + user-filed), otherwise reset to single hardcoded claim
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.length <= 3) {
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

  // Handle category selection from Page 1
  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    localStorage.setItem("beema_category", categoryId);
    setActiveTab("overview");
  };

  // Change category returns user to Page 1
  const handleChangeCategory = () => {
    setSelectedCategory(null);
    localStorage.removeItem("beema_category");
    setSelectedClaimId(null);
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
  // If baseline claim category doesn't match selectedCategory, align baseline claim so customer always has their 1 baseline claim:
  const currentCategoryClaims = claims.filter((c) => c.category === selectedCategory);
  const activeCategoryClaims = currentCategoryClaims.length > 0
    ? currentCategoryClaims
    : claims.map(c => ({
        ...c,
        category: selectedCategory,
        id: `CLM-${(selectedCategory || "mtr").substring(0, 3).toUpperCase()}-2026-081`
      }));

  const activeClaim = selectedClaimId
    ? claims.find((c) => c.id === selectedClaimId) || activeCategoryClaims[0]
    : activeCategoryClaims[0] || claims[0];

  // PAGE ONE: If no category selected, render mandatory Category Selection screen
  if (!selectedCategory) {
    return <CategorySelection onSelectCategory={handleSelectCategory} />;
  }

  // Titles for TopNav breadcrumb (Customer Portal POV)
  const TAB_TITLES = {
    overview: "My Claims Hub",
    all_claims: "My Claims & Tracking",
    new_claim: "File a New Claim",
    laya: "LAYA AI Decision Status",
    documents: "My Documents & Receipts",
    policy: "My Policy & Coverage",
    history: "Past Claims & Payouts",
    analytics: "Coverage & Usage Summary",
    settings: "My Adjuster & Support"
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: "var(--color-background)" }}>
      {/* Persistent Enterprise Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "new_claim") setSelectedClaimId(null);
        }}
        currentCategory={selectedCategory}
        onChangeCategory={handleChangeCategory}
        claimsCount={activeCategoryClaims.length}
      />

      {/* Main Content Area */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, height: "100vh" }}>
        {/* Top Navigation */}
        <TopNav
          currentCategory={selectedCategory}
          onChangeCategory={handleChangeCategory}
          activeTabTitle={TAB_TITLES[activeTab] || "My Claims Hub"}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dynamic Page Router */}
        <main style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {activeTab === "overview" && (
            <WorkspaceDashboard
              currentCategory={selectedCategory}
              claims={activeCategoryClaims}
              onSelectClaim={handleSelectClaim}
              onNavigateNewClaim={() => setActiveTab("new_claim")}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === "all_claims" && (
            <WorkspaceDashboard
              currentCategory={selectedCategory}
              claims={activeCategoryClaims}
              onSelectClaim={handleSelectClaim}
              onNavigateNewClaim={() => setActiveTab("new_claim")}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === "new_claim" && (
            <NewClaimIntake
              currentCategory={selectedCategory}
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
    </div>
  );
}
