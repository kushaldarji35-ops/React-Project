import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  IoCardOutline,
  IoShieldCheckmarkOutline,
  IoLockClosedOutline,
  IoCalculatorOutline,
  IoCheckmarkCircle,
  IoLogoPaypal,
  IoLogoApple,
  IoLogoGoogle,
} from "react-icons/io5";
import Breadcrumb from "../../components/ui/Breadcrumb";
import "./InfoPages.css";

export default function PaymentsPage() {
  const [cartAmount, setCartAmount] = useState(160);

  const installmentAmount = (cartAmount / 4).toFixed(2);

  const paymentOptions = [
    {
      title: "Credit & Debit Cards",
      desc: "Instant authorization with Visa, Mastercard, American Express, and Discover. Protected by 3D Secure 2.0 authentication.",
      badge: "Instant",
      badges: ["Visa", "Mastercard", "Amex"],
    },
    {
      title: "Digital Wallets",
      desc: "Checkout in one click using Apple Pay, Google Pay, or PayPal without entering manual card numbers.",
      badge: "1-Click",
      badges: ["Apple Pay", "Google Pay", "PayPal"],
    },
    {
      title: "Buy Now, Pay Later (Klarna)",
      desc: "Split your total into 4 equal bi-weekly payments with 0% interest and zero hidden fees.",
      badge: "0% APR",
      badges: ["Klarna", "4 Payments"],
    },
    {
      title: "Cash on Delivery / Net Banking",
      desc: "Available in select metropolitan regions. Inspect your package at your door before making payment.",
      badge: "Doorstep",
      badges: ["Cash on Delivery", "UPI / Net Banking"],
    },
  ];

  return (
    <div className="info-page">
      <div className="info-container">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Payments" }]} />

        {/* Hero */}
        <section className="info-hero">
          <span className="info-hero__badge">
            <IoLockClosedOutline /> Bank-Grade Security
          </span>
          <h1 className="info-hero__title">
            Flexible, Seamless & <br />
            Ultra-Secure Payments.
          </h1>
          <p className="info-hero__subtitle">
            Every transaction on SHOP.CO is backed by 256-bit encryption, tokenized checkout, and
            flexible interest-free installment options.
          </p>
          <div className="info-hero__actions">
            <a href="#calculator" className="btn-primary-dark">
              Try Installment Calculator
            </a>
            <Link to="/customer-support" className="btn-secondary-light">
              Billing Support
            </Link>
          </div>
        </section>

        {/* Payment Gateways Grid */}
        <section className="info-section">
          <div className="info-section-header">
            <div className="info-section-tag">Supported Methods</div>
            <h2 className="info-section-title">Accepted Payment Tenders</h2>
          </div>

          <div className="info-grid-2">
            {paymentOptions.map((opt, idx) => (
              <div key={idx} className="info-card info-card--hover">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        background: "#000",
                        color: "#fff",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        textTransform: "uppercase",
                      }}
                    >
                      {opt.badge}
                    </span>
                    <h3 style={{ fontSize: "18px", fontWeight: "800", marginTop: "8px" }}>{opt.title}</h3>
                  </div>
                </div>

                <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6", marginBottom: "18px" }}>
                  {opt.desc}
                </p>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {opt.badges.map((b, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        background: "#f0f0f0",
                        color: "#222",
                        padding: "4px 12px",
                        borderRadius: "8px",
                      }}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Installment Calculator */}
        <section id="calculator" className="info-section">
          <div className="info-card" style={{ background: "#ffffff", border: "2px solid #000000", padding: "36px" }}>
            <div className="info-grid-2" style={{ alignItems: "center" }}>
              <div>
                <span className="info-section-tag">Flexible Financing</span>
                <h3 style={{ fontSize: "24px", fontWeight: "900", marginBottom: "10px" }}>
                  Klarna 4-Installment Calculator
                </h3>
                <p style={{ fontSize: "14px", color: "#555", lineHeight: "1.6", marginBottom: "20px" }}>
                  Drag the slider or enter an estimated order amount to see how simple and manageable
                  your bi-weekly payments will be. 0% interest, no hard credit pull.
                </p>

                <div className="info-form-group">
                  <label className="info-form-label">Total Order Value: ${cartAmount}</label>
                  <input
                    type="range"
                    min="40"
                    max="1000"
                    step="10"
                    value={cartAmount}
                    onChange={(e) => setCartAmount(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#000", cursor: "pointer" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#888", marginTop: "4px" }}>
                    <span>$40</span>
                    <span>$500</span>
                    <span>$1,000</span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "#fdf2f8",
                  borderRadius: "16px",
                  padding: "28px",
                  border: "1px dashed #f472b6",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#db2777", marginBottom: "6px" }}>
                  Klarna Pay in 4 Breakdown
                </div>
                <div style={{ fontSize: "36px", fontWeight: "900", color: "#000", marginBottom: "4px" }}>
                  ${installmentAmount} <span style={{ fontSize: "16px", fontWeight: "600", color: "#666" }}>/ 2 weeks</span>
                </div>
                <div style={{ fontSize: "13px", color: "#444", marginBottom: "18px" }}>
                  Total of 4 payments = <strong>${cartAmount.toFixed(2)}</strong> (0% APR)
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", fontSize: "11px", fontWeight: "700" }}>
                  <div style={{ background: "#fff", padding: "8px 4px", borderRadius: "8px" }}>Due Today: ${installmentAmount}</div>
                  <div style={{ background: "#fff", padding: "8px 4px", borderRadius: "8px" }}>Wk 2: ${installmentAmount}</div>
                  <div style={{ background: "#fff", padding: "8px 4px", borderRadius: "8px" }}>Wk 4: ${installmentAmount}</div>
                  <div style={{ background: "#fff", padding: "8px 4px", borderRadius: "8px" }}>Wk 6: ${installmentAmount}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Badges */}
        <section className="info-section">
          <div className="info-grid-3">
            <div className="info-card">
              <div className="info-icon-box">
                <IoShieldCheckmarkOutline />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "6px" }}>PCI-DSS Level 1</h3>
              <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.6" }}>
                The highest level of certification available in the payments industry, auditing security and encryption protocols.
              </p>
            </div>

            <div className="info-card">
              <div className="info-icon-box">
                <IoLockClosedOutline />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "6px" }}>End-to-End Tokenization</h3>
              <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.6" }}>
                Your actual card number never enters our database. It is converted into encrypted one-time authorization tokens.
              </p>
            </div>

            <div className="info-card">
              <div className="info-icon-box">
                <IoCheckmarkCircle />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "6px" }}>Zero Fraud Liability</h3>
              <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.6" }}>
                Shop with complete peace of mind. Any unauthorized transaction is refunded 100% with no questions asked.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
