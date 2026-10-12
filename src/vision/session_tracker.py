import time
import hashlib
from typing import Dict, List, Tuple, Optional
from src.utils.logger import get_logger

logger = get_logger("ClaimSessionTracker")

class ClaimSessionTracker:
    """
    Tracks claim photo upload attempts and rate of re-submissions.
    Enforces anti-tampering rules:
    If a claimant uploads more than 5 times without changing their compensation demand,
    the claim is immediately blocked from automated processing, and routed to human staff:
    'An employee will contact you.'
    """

    MAX_UNMODIFIED_ATTEMPTS = 5
    EMPLOYEE_CONTACT_MESSAGE = "An employee will contact you."

    def __init__(self):
        # Maps claim_id -> session record
        self._sessions: Dict[str, Dict] = {}

    def record_attempt(
        self,
        claim_id: str,
        claimed_amount: float,
        image_signature: Optional[str] = None
    ) -> Tuple[int, bool, Optional[str]]:
        """
        Records an upload attempt for a claim.

        Returns:
            Tuple of (attempt_number, is_blocked, block_message)
        """
        now = time.time()
        session = self._sessions.setdefault(claim_id, {
            "attempts": [],
            "is_blocked": False,
            "block_reason": None
        })

        # If already permanently locked
        if session["is_blocked"]:
            logger.warning(f"Claim {claim_id} is permanently blocked from automated uploads.")
            return len(session["attempts"]), True, self.EMPLOYEE_CONTACT_MESSAGE

        attempts = session["attempts"]
        attempts.append({
            "amount": float(claimed_amount),
            "timestamp": now,
            "signature": image_signature
        })
        attempt_count = len(attempts)

        # Rule: More than 5 uploads (> 5) and claimant has not changed their demand
        if attempt_count > self.MAX_UNMODIFIED_ATTEMPTS:
            # Check the demanded amounts across recent attempts
            amounts = [a["amount"] for a in attempts]
            first_amount = amounts[0]
            current_amount = amounts[-1]
            
            # If demand remains unchanged (or variation < 2%)
            demand_unchanged = abs(current_amount - first_amount) <= (0.02 * first_amount)

            if demand_unchanged:
                session["is_blocked"] = True
                session["block_reason"] = (
                    f"Upload limit exceeded: Claimant submitted {attempt_count} times without adjusting "
                    f"demanded compensation (${current_amount:,.2f}). Automated pipeline locked."
                )
                logger.warning(f"Blocking claim {claim_id}: {session['block_reason']}")
                return attempt_count, True, self.EMPLOYEE_CONTACT_MESSAGE

        return attempt_count, False, None

    def is_blocked(self, claim_id: str) -> bool:
        return self._sessions.get(claim_id, {}).get("is_blocked", False)

    def reset_session(self, claim_id: str):
        """Clears session for claim (used in testing or manual adjuster reset)."""
        if claim_id in self._sessions:
            del self._sessions[claim_id]

# Global shared instance
session_tracker = ClaimSessionTracker()
