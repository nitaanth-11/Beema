// Mock data for the Beema policyholder portal (INR baseline).

export const SEGMENTS = [
  { id: "all", label: "All Lines" },
  { id: "individual", label: "Individual" },
  { id: "organisation", label: "Organisation" },
];

export const INSURANCE_CATEGORIES = [
  { id: "vehicle_ind", idPrefix: "VEH", segment: "individual", name: "Vehicle Insurance", shortName: "Vehicle", icon: "Car", color: "#2563EB",
    shortDesc: "Car & two-wheeler accident and theft claims.",
    description: "Own-damage, third-party and theft claims for private cars and two-wheelers.",
    defaultTypes: ["Accidental Damage", "Theft", "Third-Party Liability"] },
  { id: "health_ind", idPrefix: "HLT", segment: "individual", name: "Health Insurance", shortName: "Health", icon: "HeartPulse", color: "#DC2626",
    shortDesc: "Hospitalisation and cashless treatment claims.",
    description: "Inpatient, daycare and reimbursement claims for individuals and families.",
    defaultTypes: ["Hospitalisation", "Day Care Procedure", "Reimbursement"] },
  { id: "home_ind", idPrefix: "HOM", segment: "individual", name: "Home Insurance", shortName: "Home", icon: "House", color: "#059669",
    shortDesc: "Fire, flood and burglary cover for homes.",
    description: "Structure and contents claims for residential property.",
    defaultTypes: ["Fire Damage", "Water Damage", "Burglary"] },
  { id: "travel_ind", idPrefix: "TRV", segment: "individual", name: "Travel Insurance", shortName: "Travel", icon: "Plane", color: "#7C3AED",
    shortDesc: "Trip cancellation and baggage claims.",
    description: "Medical emergencies, delays, cancellations and lost baggage abroad.",
    defaultTypes: ["Trip Cancellation", "Lost Baggage", "Medical Emergency"] },
  { id: "captive_org", idPrefix: "CAP", segment: "organisation", name: "Captive Corporate Cover", shortName: "Captive", icon: "Building2", color: "#6D28D9",
    shortDesc: "Enterprise captive programme claims.",
    description: "Large-loss claims under a captive insurance programme.",
    defaultTypes: ["Property Loss", "Business Interruption", "Liability"] },
  { id: "fleet_org", idPrefix: "FLT", segment: "organisation", name: "Fleet & Cargo", shortName: "Fleet", icon: "Truck", color: "#D97706",
    shortDesc: "Commercial fleet and goods-in-transit claims.",
    description: "Commercial vehicles, marine cargo and transit losses.",
    defaultTypes: ["Fleet Accident", "Cargo Loss", "Marine Transit"] },
  { id: "cyber_org", idPrefix: "CYB", segment: "organisation", name: "Cyber Liability", shortName: "Cyber", icon: "Lock", color: "#0F766E",
    shortDesc: "Data breach and ransomware claims.",
    description: "First- and third-party cyber incident losses.",
    defaultTypes: ["Data Breach", "Ransomware", "Network Interruption"] },
];

export const SPOOFED_PERSONAS = {
  individual: [
    { id: "ind-aarav", segment: "individual", name: "Aarav Mehta", title: "Retail Policyholder", email: "aarav.mehta@example.com",
      location: "Mumbai, MH", identifier: "POL-VEH-48213", primaryPolicy: "POL-VEH-48213", officer: "Neha Kulkarni",
      avatarInitials: "AM", avatarBg: "#2563EB", claimedAmount: 185000, defaultCategory: "vehicle_ind", activeClaimId: "CLM-VEH-2026-101" },
    { id: "ind-priya", segment: "individual", name: "Priya Nair", title: "Family Floater Holder", email: "priya.nair@example.com",
      location: "Kochi, KL", identifier: "POL-HLT-77120", primaryPolicy: "POL-HLT-77120", officer: "Rohan Desai",
      avatarInitials: "PN", avatarBg: "#DC2626", claimedAmount: 320000, defaultCategory: "health_ind", activeClaimId: "CLM-HLT-2026-102" },
  ],
  organisation: [
    { id: "org-sundaram", segment: "organisation", name: "Sundaram Logistics Pvt Ltd", title: "Risk Manager", email: "risk@sundaramlogistics.example.com",
      location: "Chennai, TN", identifier: "POL-CAP-90031", primaryPolicy: "POL-CAP-90031", officer: "Karan Malhotra",
      avatarInitials: "SL", avatarBg: "#7C3AED", claimedAmount: 4200000, defaultCategory: "captive_org", activeClaimId: "CLM-CAP-2026-201" },
    { id: "org-vertex", segment: "organisation", name: "Vertex Digital Services", title: "CISO Office", email: "ciso@vertexdigital.example.com",
      location: "Bengaluru, KA", identifier: "POL-CYB-55410", primaryPolicy: "POL-CYB-55410", officer: "Anita Rao",
      avatarInitials: "VD", avatarBg: "#0F766E", claimedAmount: 2750000, defaultCategory: "cyber_org", activeClaimId: "CLM-CYB-2026-202" },
  ],
};

const claim = (o) => ({
  filingDate: "2026-09-12", incidentDate: "2026-09-08", deductible: 5000, compositeRiskScore: 22, layaPriority: "Low",
  assignedReviewer: "Neha Kulkarni", evidence: { documents: [], images: [] },
  findings: { verifiedFacts: [], missingInformation: [], layaRecommendation: "MANUAL_REVIEW" },
  visualAnalysis: {}, ...o,
});

export const INITIAL_CLAIMS = [
  claim({ id: "CLM-VEH-2026-101", category: "vehicle_ind", segment: "individual", claimantName: "Aarav Mehta", policyNumber: "POL-VEH-48213",
    claimType: "Accidental Damage", description: "Rear-end collision at a signal; bumper and boot damaged.", claimedAmount: 185000, status: "Completed",
    layaPriority: "Low", compositeRiskScore: 14, evidence: { repairEstimateAmount: 185000, policeReportAvailable: true, documents: [], images: [] },
    findings: { verifiedFacts: ["Policy active on incident date", "Damage consistent with photos"], missingInformation: [], layaRecommendation: "FAST_TRACK_PAYOUT" },
    visualAnalysis: { damageSeverityTier: "Moderate Localized Damage", fairCostRange: "₹1,60,000 – ₹2,00,000", detectedComponents: ["Rear bumper", "Boot lid"] } }),
  claim({ id: "CLM-HLT-2026-102", category: "health_ind", segment: "individual", claimantName: "Priya Nair", policyNumber: "POL-HLT-77120",
    claimType: "Hospitalisation", description: "Three-day admission for appendectomy.", claimedAmount: 320000, status: "In Review",
    layaPriority: "Medium", compositeRiskScore: 38, assignedReviewer: "Rohan Desai",
    findings: { verifiedFacts: ["Hospital is network-empanelled"], missingInformation: ["Discharge summary"], layaRecommendation: "MANUAL_REVIEW" } }),
  claim({ id: "CLM-CAP-2026-201", category: "captive_org", segment: "organisation", claimantName: "Sundaram Logistics Pvt Ltd", policyNumber: "POL-CAP-90031",
    claimType: "Property Loss", description: "Warehouse fire damaging stored inventory.", claimedAmount: 4200000, status: "Escalated",
    layaPriority: "High", compositeRiskScore: 71, deductible: 100000, assignedReviewer: "Karan Malhotra",
    findings: { verifiedFacts: ["Fire brigade report filed"], missingInformation: ["Inventory valuation", "Fire safety audit"], layaRecommendation: "ESCALATE_SIU" } }),
  claim({ id: "CLM-CYB-2026-202", category: "cyber_org", segment: "organisation", claimantName: "Vertex Digital Services", policyNumber: "POL-CYB-55410",
    claimType: "Ransomware", description: "Ransomware encrypted production file servers.", claimedAmount: 2750000, status: "In Review",
    layaPriority: "High", compositeRiskScore: 55, assignedReviewer: "Anita Rao",
    findings: { verifiedFacts: ["Incident reported within 24h"], missingInformation: ["Forensic report"], layaRecommendation: "MANUAL_REVIEW" } }),
];

export const INITIAL_POLICIES = [
  { id: "POL-VEH-48213", category: "vehicle_ind", holder: "Aarav Mehta", type: "Comprehensive Motor Policy", effectiveDate: "2026-01-01", expirationDate: "2026-12-31" },
  { id: "POL-HLT-77120", category: "health_ind", holder: "Priya Nair", type: "Family Floater Health Plan", effectiveDate: "2026-02-15", expirationDate: "2027-02-14" },
  { id: "POL-CAP-90031", category: "captive_org", holder: "Sundaram Logistics Pvt Ltd", type: "Captive Property & BI Programme", effectiveDate: "2026-04-01", expirationDate: "2027-03-31" },
  { id: "POL-CYB-55410", category: "cyber_org", holder: "Vertex Digital Services", type: "Cyber Liability Policy", effectiveDate: "2026-03-01", expirationDate: "2027-02-28" },
];
