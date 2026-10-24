"""
Letterhead Analyzer and Policy Domain Cross-Verification Engine.
Audits document headers, institutional seals, official credentials, and policy alignment.
"""
import re
from typing import Dict, Any, List, Optional, Tuple
from src.utils.logger import get_logger

logger = get_logger("LetterheadVerifier")

class LetterheadVerifier:
    # Institutional authority patterns grouped by policy category
    AUTHORITY_REGISTRY = {
        "motor": {
            "primary": [
                {
                    "type": "Law Enforcement / Police Department",
                    "keywords": [
                        "police department", "highway patrol", "state trooper", "sheriff's office",
                        "traffic collision investigation", "department of public safety", "accident investigation bureau",
                        "law enforcement agency", "metropolitan police", "patrol division"
                    ],
                    "weight": 1.0,
                    "badge_label": "Official Police Department Seal"
                },
                {
                    "type": "Certified Collision Repair Facility",
                    "keywords": [
                        "collision center", "auto body", "certified repair facility", "body shop",
                        "dealership service center", "automotive repair", "collision specialists",
                        "apex certified", "caliber collision", "auto collision", "towing service"
                    ],
                    "weight": 0.95,
                    "badge_label": "Certified Collision Facility Letterhead"
                }
            ],
            "allowed_secondary": ["Law Enforcement / Police Department", "Certified Collision Repair Facility"]
        },
        "health": {
            "primary": [
                {
                    "type": "Licensed Hospital / Medical Center",
                    "keywords": [
                        "hospital", "medical center", "health system", "memorial hospital",
                        "presbyterian", "saint jude", "general hospital", "university hospital",
                        "emergency department", "inpatient pavilion", "regional medical"
                    ],
                    "weight": 1.0,
                    "badge_label": "Accredited Hospital Letterhead"
                },
                {
                    "type": "Attending Physician / Clinical Practice",
                    "keywords": [
                        "doctor of medicine", "m.d.", "attending physician", "medical clinic",
                        "department of cardiology", "surgery center", "clinical associates",
                        "pediatric", "internal medicine", "health clinic", "physician"
                    ],
                    "weight": 0.95,
                    "badge_label": "Licensed Medical Practitioner Letterhead"
                }
            ],
            "allowed_secondary": ["Licensed Hospital / Medical Center", "Attending Physician / Clinical Practice"]
        },
        "property": {
            "primary": [
                {
                    "type": "Fire Department / Public Safety Bureau",
                    "keywords": [
                        "fire department", "fire rescue", "fire marshal", "building department",
                        "municipal code enforcement", "disaster response agency"
                    ],
                    "weight": 1.0,
                    "badge_label": "Municipal Fire & Safety Letterhead"
                },
                {
                    "type": "Licensed General Contractor / Restoration Specialist",
                    "keywords": [
                        "restoration services", "general contractor", "structural engineering",
                        "roofing specialists", "water damage mitigation", "licensed contractor",
                        "servpro", "property inspection bureau"
                    ],
                    "weight": 0.95,
                    "badge_label": "Licensed Contractor Letterhead"
                }
            ],
            "allowed_secondary": ["Fire Department / Public Safety Bureau", "Licensed General Contractor / Restoration Specialist"]
        },
        "life": {
            "primary": [
                {
                    "type": "Bureau of Vital Statistics / County Registrar",
                    "keywords": [
                        "vital statistics", "department of public health", "county registrar",
                        "office of vital records", "state department of health", "county clerk"
                    ],
                    "weight": 1.0,
                    "badge_label": "State Vital Records Certified Letterhead"
                },
                {
                    "type": "Certified Medical Examiner / Coroner",
                    "keywords": [
                        "medical examiner", "coroner's office", "forensic pathology",
                        "county coroner", "chief medical examiner"
                    ],
                    "weight": 1.0,
                    "badge_label": "Official Coroner / Medical Examiner Seal"
                }
            ],
            "allowed_secondary": ["Bureau of Vital Statistics / County Registrar", "Certified Medical Examiner / Coroner"]
        },
        "travel": {
            "primary": [
                {
                    "type": "Commercial Airline / Carrier Authority",
                    "keywords": [
                        "airline", "airways", "aviation authority", "international airport",
                        "carrier operations", "baggage services", "delta", "united", "lufthansa"
                    ],
                    "weight": 1.0,
                    "badge_label": "Commercial Carrier Letterhead"
                },
                {
                    "type": "Consulate / Embassy / Port Authority",
                    "keywords": [
                        "consulate general", "embassy of", "port authority", "customs and border",
                        "overseas medical clinic"
                    ],
                    "weight": 0.95,
                    "badge_label": "Consular / Port Authority Letterhead"
                }
            ],
            "allowed_secondary": ["Commercial Airline / Carrier Authority", "Consulate / Embassy / Port Authority"]
        },
        "commercial": {
            "primary": [
                {
                    "type": "Certified Forensic Accounting / Audit Firm",
                    "keywords": [
                        "cpa", "certified public accountant", "forensic audit", "financial advisory",
                        "loss assessment", "accounting associates", "deloitte", "pwc", "kpmg", "ey"
                    ],
                    "weight": 1.0,
                    "badge_label": "Certified Audit Firm Letterhead"
                }
            ],
            "allowed_secondary": ["Certified Forensic Accounting / Audit Firm"]
        }
    }

    @classmethod
    def analyze_document(
        cls,
        full_text: str,
        header_text: str,
        policy_category: str = "motor",
        claimed_amount: float = 0.0,
        incident_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Scans header region and full text to extract organization, official credentials,
        and evaluates authenticity against the policy line.
        """
        cat_key = (policy_category or "motor").lower()
        if cat_key not in cls.AUTHORITY_REGISTRY:
            cat_key = "motor"

        text_to_scan = f"{header_text}\n{full_text}".lower()
        header_lower = header_text.lower()

        # 1. Detect Institutional Letterhead Organization
        detected_org, authority_type, org_category, letterhead_in_header = cls._detect_letterhead(
            header_lower=header_lower,
            full_text_lower=text_to_scan,
            header_raw=header_text
        )

        # 2. Extract Official Case / Report / License / Badge Numbers
        case_id = cls._extract_case_id(full_text)
        badge_or_license = cls._extract_credentials(full_text)
        extracted_amount = cls._extract_amount(full_text)
        extracted_date = cls._extract_date(full_text)

        # 3. Assess Category Alignment
        is_category_match = False
        alignment_status = "MISSING_INSTITUTIONAL_LETTERHEAD"

        if detected_org and authority_type:
            allowed_authorities = cls.AUTHORITY_REGISTRY[cat_key]["allowed_secondary"]
            if authority_type in allowed_authorities:
                is_category_match = True
                alignment_status = "PERFECT_MATCH"
            else:
                is_category_match = False
                alignment_status = "MISMATCHED_AUTHORITY"

        # 4. Compute Weighted Authenticity Score
        score = 0.0
        evidence_markers = []

        if detected_org:
            score += 0.40 if letterhead_in_header else 0.25
            evidence_markers.append(f"Institutional letterhead identified: '{detected_org}' ({authority_type})")
            if letterhead_in_header:
                evidence_markers.append("Letterhead positioned in official top header block (standard regulatory layout)")
        else:
            evidence_markers.append("No recognized regulatory or institutional letterhead found in header block")

        if is_category_match:
            score += 0.30
            evidence_markers.append(f"Authority matches line of business '{policy_category.capitalize()} Insurance'")
        elif detected_org:
            evidence_markers.append(f"Warning: Authority '{authority_type}' does not correspond to expected authorities for '{policy_category.capitalize()} Insurance'")

        if case_id:
            score += 0.15
            evidence_markers.append(f"Official Case / Report Reference identified: {case_id}")

        if badge_or_license:
            score += 0.10
            evidence_markers.append(f"Official Credentials / Registration verified: {badge_or_license}")

        if extracted_amount is not None:
            score += 0.05
            evidence_markers.append(f"Itemized financial sum verified in document: ₹{extracted_amount:,.2f}")
            if claimed_amount > 0 and abs(claimed_amount - extracted_amount) <= max(2500.0, claimed_amount * 0.05):
                score += 0.05
                evidence_markers.append(f"Financial sum matches claimant demand (₹{claimed_amount:,.2f}) within policy tolerance")

        # Cap score
        authenticity_score = min(1.0, max(0.08, round(score, 3)))
        is_genuine = authenticity_score >= 0.70 and is_category_match

        # 5. Formulate Verdict
        if is_genuine:
            verdict = "AUTHENTIC_VERIFIED"
            badge = f"✓ Authentic {authority_type} Letterhead Verified"
            explanation = (
                f"Document verified with genuine '{detected_org}' letterhead. "
                f"Official reference ({case_id or 'Verified'}) matches {policy_category.capitalize()} policy requirements."
            )
        elif not is_category_match and detected_org:
            verdict = "MISMATCHED_POLICY_AUTHORITY"
            badge = f"⚠️ Mismatched Authority: {authority_type}"
            explanation = (
                f"Document displays authentic letterhead from '{detected_org}', but this is a {authority_type} "
                f"whereas this claim requires an official authority for {policy_category.capitalize()} Insurance."
            )
        else:
            verdict = "SUSPICIOUS_UNVERIFIED_LETTERHEAD"
            badge = "❌ Unverified / Missing Official Letterhead"
            explanation = (
                f"Document lacks an official recognized institutional letterhead for {policy_category.capitalize()} Insurance. "
                f"Please attach a valid official report (e.g. Police Report for vehicle collisions, Hospital Bill for medical care)."
            )

        return {
            "is_genuine": is_genuine,
            "authenticity_score": authenticity_score,
            "letterhead_detected": bool(detected_org),
            "letterhead_organization": detected_org or "Unidentified / Generic Entity",
            "authority_type": authority_type or "Unspecified Entity",
            "category_alignment": alignment_status,
            "report_or_invoice_id": case_id,
            "extracted_amount": extracted_amount,
            "officer_or_physician_id": badge_or_license,
            "incident_date_found": extracted_date,
            "verdict": verdict,
            "verdict_badge": badge,
            "explanation": explanation,
            "key_evidence_markers": evidence_markers
        }

    @classmethod
    def _detect_letterhead(
        cls,
        header_lower: str,
        full_text_lower: str,
        header_raw: str
    ) -> Tuple[Optional[str], Optional[str], Optional[str], bool]:
        """
        Iterates over authority registry to find matching organization names and authorities.
        """
        # First priority: check top header text specifically, prioritizing specific keywords
        candidates = []
        for cat_name, cat_data in cls.AUTHORITY_REGISTRY.items():
            for auth in cat_data["primary"]:
                sorted_kws = sorted(auth["keywords"], key=len, reverse=True)
                for kw in sorted_kws:
                    if kw in header_lower:
                        org_name = cls._extract_display_org_name(header_raw, kw)
                        candidates.append((len(kw), org_name, auth["type"], cat_name, True))
                        break

        if candidates:
            # Sort by keyword length descending (most specific match)
            candidates.sort(key=lambda c: c[0], reverse=True)
            best = candidates[0]
            return best[1], best[2], best[3], best[4]

        # Second priority: check full document text if header was unformatted
        for cat_name, cat_data in cls.AUTHORITY_REGISTRY.items():
            for auth in cat_data["primary"]:
                sorted_kws = sorted(auth["keywords"], key=len, reverse=True)
                for kw in sorted_kws:
                    if kw in full_text_lower:
                        org_name = kw.title()
                        return org_name, auth["type"], cat_name, False

        return None, None, None, False

    @staticmethod
    def _extract_display_org_name(header_raw: str, keyword: str) -> str:
        """
        Finds the line in the raw header that contains the keyword and cleans it up.
        """
        lines = [l.strip() for l in header_raw.splitlines() if l.strip()]
        for line in lines:
            if keyword in line.lower():
                # Clean up line
                cleaned = re.sub(r'[\*\#\_\|]+', '', line).strip()
                if len(cleaned) < 80:
                    return cleaned
        if lines:
            return lines[0]
        return keyword.title()

    @staticmethod
    def _extract_case_id(text: str) -> Optional[str]:
        """
        Extracts official report, case, incident, or invoice numbers.
        """
        patterns = [
            r'(?:estimate\s*(?:\/|\&)?\s*invoice|invoice|estimate|case|report|incident|claim|citation|inv|file)\s*(?:no|number|#|\:|\/)*\s*([A-Za-z0-9\-_]{4,22})',
            r'(?:CHP|LAPD|NYPD|POL|MED|HOSP|INV|APX)-[0-9]{4,8}-[0-9]{2,6}',
            r'#\s*([A-Za-z0-9\-_]{5,15})'
        ]
        for pat in patterns:
            match = re.search(pat, text, re.IGNORECASE)
            if match:
                return match.group(0).strip()
        return None

    @staticmethod
    def _extract_credentials(text: str) -> Optional[str]:
        """
        Extracts officer badge number, physician NPI / license #, or contractor license.
        """
        patterns = [
            r'(?:badge|officer badge|star)\s*(?:no|number|#|\:)\s*([0-9A-Za-z\-]+)',
            r'(?:npi|license|lic|medical lic|registration)\s*(?:no|number|#|\:)\s*([0-9A-Za-z\-]+)',
            r'Officer\s+[A-Za-z\.\s]+,\s*Badge\s*#?\s*([0-9]+)',
            r'Dr\.\s+[A-Za-z\.\s]+,\s*M\.?D\.?'
        ]
        for pat in patterns:
            match = re.search(pat, text, re.IGNORECASE)
            if match:
                return match.group(0).strip()
        return None

    @staticmethod
    def _extract_amount(text: str) -> Optional[float]:
        """
        Extracts highest plausible invoice or estimate amount in Indian Rupees (₹) or USD.
        """
        matches = re.findall(r'(?:[₹$]|Rs\.?|INR)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?)', text, re.IGNORECASE)
        if matches:
            amounts = []
            for m in matches:
                try:
                    val = float(m.replace(",", ""))
                    if 100.0 <= val <= 100000000.0:
                        amounts.append(val)
                except ValueError:
                    continue
            if amounts:
                return max(amounts)
        return None

    @staticmethod
    def _extract_date(text: str) -> Optional[str]:
        """
        Extracts formatted dates.
        """
        match = re.search(r'\b(202[0-9]-[0-1][0-9]-[0-3][0-9])\b', text)
        if match:
            return match.group(1)
        match_us = re.search(r'\b([0-1]?[0-9]/[0-3]?[0-9]/202[0-9])\b', text)
        if match_us:
            return match_us.group(1)
        return None
