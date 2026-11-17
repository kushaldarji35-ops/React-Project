import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  IoShieldCheckmarkOutline,
  IoLockClosedOutline,
  IoEyeOffOutline,
  IoFingerPrintOutline,
  IoCheckmarkCircleOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import Breadcrumb from "../../components/ui/Breadcrumb";
import "./InfoPages.css";

export default function PrivacyPage() {
  const [prefAnalytics, setPrefAnalytics] = useState(true);
  const [prefPersonalized, setPrefPersonalized] = useState(true);
  const [prefMarketing, setPrefMarketing] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const handleSavePreferences = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="info-page">
      <div className="info-container">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />

        {/* Hero */}
        <section className="info-hero">
          <span className="info-hero__badge">
            <IoLockClosedOutline /> Data Protection & Privacy
          </span>
          <h1 className="info-hero__title">
            Your Privacy Is Our <br />
            Sacred Commitment.
          </h1>
          <p className="info-hero__subtitle">
            We value the trust you place in SHOP.CO. We strictly do not sell, rent, or trade your
            personal data. Learn how we safeguard your information and give you full control.
          </p>
          <div className="info-hero__actions">
            <a href="#preferences" className="btn-primary-dark">
              <IoSettingsOutline size={18} /> Manage Privacy Settings
            </a>
            <Link to="/customer-support" className="btn-secondary-light">
              Contact Privacy Officer
            </Link>
          </div>
        </section>

        {/* 4 Pillars of Privacy */}
        <section className="info-section">
          <div className="info-grid-4">
            <div className="info-card">
              <div className="info-icon-box">
                <IoEyeOffOutline />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "6px" }}>Never Sold</h3>
              <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.5" }}>
                We have never sold customer data to third-party data brokers, and we never will.
              </p>
            </div>

            <div className="info-card">
              <div className="info-icon-box">
                <IoLockClosedOutline />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "6px" }}>256-Bit SSL</h3>
              <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.5" }}>
                Bank-level encryption protects your passwords, transactions, and addresses.
              </p>
            </div>

            <div className="info-card">
              <div className="info-icon-box">
                <IoShieldCheckmarkOutline />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "6px" }}>GDPR & CCPA</h3>
              <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.5" }}>
                Full compliance with European GDPR and California CCPA privacy standards.
              </p>
            </div>

            <div className="info-card">
              <div className="info-icon-box">
                <IoFingerPrintOutline />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "6px" }}>1-Click Erasure</h3>
              <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.5" }}>
                You have the complete right to request a download or deletion of your account anytime.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Privacy Preferences Simulation */}
        <section id="preferences" className="info-section">
          <div className="info-card" style={{ border: "2px solid #000000", padding: "32px", maxWidth: "800px", margin: "0 auto" }}>
            <span className="info-section-tag">Interactive Controls</span>
            <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "6px" }}>
              Customize Your Data Preferences
            </h2>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
              Toggle non-essential trackers and preferences below to control how SHOP.CO personalizes your shopping session.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Essential */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "#f9f9f9", borderRadius: "12px" }}>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "800", marginBottom: "2px" }}>Essential & Security Cookies</h4>
                  <p style={{ fontSize: "12px", color: "#777", margin: 0 }}>Required for cart storage, checkout, and session verification.</p>
                </div>
                <span style={{ fontSize: "12px", fontWeight: "700", background: "#eee", padding: "4px 10px", borderRadius: "6px" }}>
                  Always Active
                </span>
              </div>

              {/* Analytics */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "#f9f9f9", borderRadius: "12px" }}>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "800", marginBottom: "2px" }}>Performance & Error Telemetry</h4>
                  <p style={{ fontSize: "12px", color: "#777", margin: 0 }}>Helps us identify broken links and optimize load speed.</p>
                </div>
                <input
                  type="checkbox"
                  style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#000" }}
                  checked={prefAnalytics}
                  onChange={(e) => setPrefAnalytics(e.target.checked)}
                />
              </div>

              {/* Personalization */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "#f9f9f9", borderRadius: "12px" }}>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "800", marginBottom: "2px" }}>Smart Sizing & Fit Personalization</h4>
                  <p style={{ fontSize: "12px", color: "#777", margin: 0 }}>Remembers your height and style preferences for tailored suggestions.</p>
                </div>
                <input
                  type="checkbox"
                  style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#000" }}
                  checked={prefPersonalized}
                  onChange={(e) => setPrefPersonalized(e.target.checked)}
                />
              </div>

              {/* Marketing */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", background: "#f9f9f9", borderRadius: "12px" }}>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "800", marginBottom: "2px" }}>Exclusive VIP Drop Alerts & SMS</h4>
                  <p style={{ fontSize: "12px", color: "#777", margin: 0 }}>Receive early notifications when limited capsule collections drop.</p>
                </div>
                <input
                  type="checkbox"
                  style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#000" }}
                  checked={prefMarketing}
                  onChange={(e) => setPrefMarketing(e.target.checked)}
                />
              </div>
            </div>

            <div style={{ marginTop: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
              <button className="btn-solid-black" onClick={handleSavePreferences}>
                Save Preferences
              </button>
              {saveToast && (
                <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                  <IoCheckmarkCircleOutline size={18} /> Preferences updated successfully!
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Detailed Sections */}
        <section className="info-section">
          <div className="info-card" style={{ padding: "36px", lineHeight: "1.7" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>1. Information We Collect</h2>
            <p style={{ fontSize: "14px", color: "#555", marginBottom: "20px" }}>
              When you purchase or register on SHOP.CO, we collect necessary transactional information: your name, shipping address, contact email, and phone number. We do not store complete credit card numbers on our servers; card details are securely tokenized through our payment processor partners.
            </p>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>2. How We Use Collected Data</h2>
            <p style={{ fontSize: "14px", color: "#555", marginBottom: "20px" }}>
              Your data is solely used to: (a) fulfill orders and manage logistics; (b) prevent fraudulent transactions; (c) communicate dispatch updates; and (d) provide customer support when requested.
            </p>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>3. Data Retention and Deletion Rights</h2>
            <p style={{ fontSize: "14px", color: "#555", marginBottom: "20px" }}>
              Under GDPR and CCPA, you hold the legal right to request complete data extraction or account deletion. To exercise these rights, please email our Data Protection Office at <strong>privacy@shop.co</strong>. All verified requests are processed within 30 days.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
