import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Cpu,
  Database,
  Shield,
  Save,
  CheckCircle2,
  PhoneCall,
  Mail,
  Send,
  CreditCard,
  Bell,
  HelpCircle
} from "lucide-react";

export default function Settings() {
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [payoutBank, setPayoutBank] = useState("Chase Bank •••• 4921");
  const [supportMessage, setSupportMessage] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setMessageSent(true);
    setSupportMessage("");
    setTimeout(() => setMessageSent(false), 3500);
  };

  return (
    <div style={{ padding: "28px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
          My Adjuster &amp; Support Concierge
        </h1>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: "4px 0 0 0" }}>
          Contact your dedicated claims specialist, update payout accounts, and manage claim notifications.
        </p>
      </div>

      {savedSuccess && (
        <div style={{
          backgroundColor: "#F0FDF4",
          border: "1px solid #BBF7D0",
          borderRadius: "6px",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          color: "#166534"
        }}>
          <CheckCircle2 size={16} />
          Your notification and payout preferences have been saved.
        </div>
      )}

      {messageSent && (
        <div style={{
          backgroundColor: "#EFF6FF",
          border: "1px solid #BFDBFE",
          borderRadius: "6px",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          color: "#1E40AF"
        }}>
          <CheckCircle2 size={16} />
          Your message has been sent to Sarah Jenkins. You will receive a response within 2 hours.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", maxWidth: "1000px" }}>
        
        {/* Left Column: Your Dedicated Adjuster */}
        <div className="card" style={{ padding: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "var(--color-accent)",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
              fontSize: "16px"
            }}>
              SJ
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
                Sarah Jenkins
              </h3>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                Senior Claims Adjuster &bull; Beema Concierge
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", marginBottom: "18px", backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-text-main)" }}>
              <PhoneCall size={14} color="var(--color-accent)" />
              <span>Direct Phone: <strong>+1 (800) 555-0199 (Ext. 402)</strong></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-text-main)" }}>
              <Mail size={14} color="var(--color-accent)" />
              <span>Email: <strong>sarah.jenkins@beema-claims.com</strong></span>
            </div>
          </div>

          {/* Direct Message Form */}
          <form onSubmit={handleSendMessage}>
            <label className="form-label">Send a Direct Message to Sarah</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Ask about payment schedules, repair authorizations, or supplemental claims..."
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              style={{ resize: "none", fontSize: "12px", marginBottom: "10px" }}
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ fontSize: "12px", padding: "8px 16px" }}
            >
              <Send size={13} /> Send Inquiry
            </button>
          </form>
        </div>

        {/* Right Column: Payout Account & Notification Preferences */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Payout Direct Deposit Account */}
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <CreditCard size={18} color="var(--color-accent)" />
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
                Direct Deposit Payout Account
              </h3>
            </div>

            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "12px" }}>
              Approved claim reimbursements are automatically transferred to your verified bank account.
            </div>

            <input
              type="text"
              className="form-input"
              value={payoutBank}
              onChange={(e) => setPayoutBank(e.target.value)}
              style={{ fontSize: "13px", fontWeight: "600", marginBottom: "10px" }}
            />
            <span style={{ fontSize: "11px", color: "var(--color-success)", fontWeight: "600" }}>
              ✓ Verified for Instant Fast-Track ACH Transfer
            </span>
          </div>

          {/* Notification Preferences */}
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Bell size={18} color="var(--color-accent)" />
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
                Claim Notification Alerts
              </h3>
            </div>

            <form onSubmit={handleSavePreferences} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  id="sms_alerts"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                />
                <label htmlFor="sms_alerts" style={{ fontSize: "13px", cursor: "pointer", color: "var(--color-text-main)" }}>
                  Receive SMS text alerts on payout approvals &amp; status changes
                </label>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  id="email_alerts"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                />
                <label htmlFor="email_alerts" style={{ fontSize: "13px", cursor: "pointer", color: "var(--color-text-main)" }}>
                  Receive email copies of evidence verifications &amp; settlement summaries
                </label>
              </div>

              <div style={{ marginTop: "10px" }}>
                <button type="submit" className="btn btn-outline" style={{ fontSize: "12px", padding: "6px 14px" }}>
                  Save Preferences
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
