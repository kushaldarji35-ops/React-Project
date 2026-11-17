import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  IoDocumentTextOutline,
  IoPrintOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import Breadcrumb from "../../components/ui/Breadcrumb";
import "./InfoPages.css";

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState("s1");

  const sections = [
    { id: "s1", title: "1. Agreement & Acceptance" },
    { id: "s2", title: "2. Account Registration & Security" },
    { id: "s3", title: "3. Product Accuracy & Sizing" },
    { id: "s4", title: "4. Pricing, Currency & Payment" },
    { id: "s5", title: "5. Shipping, Delivery & Customs" },
    { id: "s6", title: "6. Returns, Exchanges & Refunds" },
    { id: "s7", title: "7. Intellectual Property Rights" },
    { id: "s8", title: "8. Limitation of Liability" },
    { id: "s9", title: "9. Governing Law & Arbitration" },
  ];

  return (
    <div className="info-page">
      <div className="info-container">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Terms & Conditions" }]} />

        {/* Hero */}
        <section className="info-hero">
          <span className="info-hero__badge">
            <IoDocumentTextOutline /> Legal Information
          </span>
          <h1 className="info-hero__title">Terms & Conditions of Service</h1>
          <p className="info-hero__subtitle">
            Effective Date: January 1, 2026. Please read these terms carefully before accessing or
            purchasing from SHOP.CO.
          </p>
          <div className="info-hero__actions">
            <button className="btn-primary-dark" onClick={() => window.print()}>
              <IoPrintOutline size={18} /> Print or Save Document
            </button>
            <Link to="/privacy-policy" className="btn-secondary-light">
              View Privacy Policy
            </Link>
          </div>
        </section>

        {/* Content Layout with Sidebar Nav */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "32px", alignItems: "start" }}>
          {/* Quick TOC Sidebar */}
          <div
            className="info-card"
            style={{ position: "sticky", top: "100px", padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <span className="info-section-tag" style={{ marginBottom: "6px" }}>Table of Contents</span>
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                style={{
                  fontSize: "13px",
                  fontWeight: activeSection === sec.id ? "700" : "500",
                  color: activeSection === sec.id ? "#000000" : "#666666",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  background: activeSection === sec.id ? "#f0f0f0" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                {sec.title}
              </a>
            ))}
          </div>

          {/* Main Legal Text Panel */}
          <div className="info-card" style={{ padding: "36px", lineHeight: "1.7" }}>
            <div id="s1" style={{ marginBottom: "36px", scrollMarginTop: "120px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>
                1. Agreement & Acceptance
              </h2>
              <p style={{ color: "#444", fontSize: "14px", marginBottom: "12px" }}>
                By creating an account, browsing our catalog, or placing an order on SHOP.CO (the "Platform"),
                you agree to be legally bound by these Terms and Conditions. If you do not agree to these terms,
                you must discontinue the use of our services immediately.
              </p>
              <div style={{ background: "#f8f9fa", borderLeft: "4px solid #000", padding: "12px 16px", borderRadius: "0 8px 8px 0", fontSize: "13px", color: "#333" }}>
                <strong>Summary:</strong> By shopping with us, you accept our service policies, pricing agreements, and fulfillment terms.
              </div>
            </div>

            <div id="s2" style={{ marginBottom: "36px", scrollMarginTop: "120px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>
                2. Account Registration & Security
              </h2>
              <p style={{ color: "#444", fontSize: "14px", marginBottom: "12px" }}>
                When creating an account, you agree to provide authentic, accurate, and current information.
                You are solely responsible for maintaining the confidentiality of your credentials and password.
                SHOP.CO will never ask for your password via email or unsolicited telephone communication.
              </p>
            </div>

            <div id="s3" style={{ marginBottom: "36px", scrollMarginTop: "120px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>
                3. Product Accuracy, Imagery & Sizing
              </h2>
              <p style={{ color: "#444", fontSize: "14px", marginBottom: "12px" }}>
                We make every effort to display true-to-life colors, textile textures, and garment dimensions.
                However, slight color variations may occur depending on your display device's calibration.
                All sizing charts and AI fit recommendations are provided as close guidance based on standard metric scales.
              </p>
            </div>

            <div id="s4" style={{ marginBottom: "36px", scrollMarginTop: "120px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>
                4. Pricing, Currency & Payment Terms
              </h2>
              <p style={{ color: "#444", fontSize: "14px", marginBottom: "12px" }}>
                All prices are presented in the local currency selected or detected by geolocator.
                SHOP.CO reserves the right to correct erroneous pricing if a technical malfunction occurs before order confirmation.
                Payments are securely processed via PCI-DSS certified tokenization protocols.
              </p>
            </div>

            <div id="s5" style={{ marginBottom: "36px", scrollMarginTop: "120px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>
                5. Shipping, Courier Hand-off & Customs
              </h2>
              <p style={{ color: "#444", fontSize: "14px", marginBottom: "12px" }}>
                Title and risk of loss for merchandise pass to you upon delivery to the carrier.
                For international deliveries, import taxes, duties, and customs fees are calculated transparently at checkout to prevent unexpected delivery fees.
              </p>
            </div>

            <div id="s6" style={{ marginBottom: "36px", scrollMarginTop: "120px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>
                6. 30-Day Returns, Exchanges & Refunds
              </h2>
              <p style={{ color: "#444", fontSize: "14px", marginBottom: "12px" }}>
                Items can be returned or exchanged within 30 days of confirmed delivery, provided they remain unworn,
                unwashed, with original hangtags intact. Refunds are issued to the original payment tender within 2-4 business days of inspection.
              </p>
            </div>

            <div id="s7" style={{ marginBottom: "36px", scrollMarginTop: "120px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>
                7. Intellectual Property Rights
              </h2>
              <p style={{ color: "#444", fontSize: "14px", marginBottom: "12px" }}>
                All trademarks, logos, photography, visual layouts, and digital code on SHOP.CO are the exclusive property
                of SHOP.CO Ltd. Any unauthorized reproduction or reverse engineering is strictly prohibited under international copyright laws.
              </p>
            </div>

            <div id="s8" style={{ marginBottom: "36px", scrollMarginTop: "120px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>
                8. Limitation of Liability
              </h2>
              <p style={{ color: "#444", fontSize: "14px", marginBottom: "12px" }}>
                In no event shall SHOP.CO, its directors, employees, or partners be liable for any indirect, incidental,
                or consequential damages resulting from product use or platform downtime exceeding the purchase price of the item.
              </p>
            </div>

            <div id="s9" style={{ marginBottom: "16px", scrollMarginTop: "120px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>
                9. Governing Law & Dispute Resolution
              </h2>
              <p style={{ color: "#444", fontSize: "14px" }}>
                These terms are governed by and construed in accordance with the laws of Delaware, USA, and international e-commerce commercial codes.
                Any disputes not resolved informally shall be settled by binding individual arbitration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
