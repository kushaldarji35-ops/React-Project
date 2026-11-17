import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  IoFlashOutline,
  IoShieldCheckmarkOutline,
  IoSyncOutline,
  IoDiamondOutline,
  IoSparklesOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoBodyOutline,
  IoCartOutline,
} from "react-icons/io5";
import Breadcrumb from "../../components/ui/Breadcrumb";
import "./InfoPages.css";

export default function FeaturesPage() {
  const [userHeight, setUserHeight] = useState("175");
  const [userWeight, setUserWeight] = useState("70");
  const [recommendedSize, setRecommendedSize] = useState("Medium (M) - Regular Fit");

  const handleCalcSize = (e) => {
    e.preventDefault();
    const h = parseInt(userHeight, 10);
    const w = parseInt(userWeight, 10);
    if (w < 55) {
      setRecommendedSize("Small (S) - Slim Fit");
    } else if (w < 72) {
      setRecommendedSize("Medium (M) - Standard Regular Fit");
    } else if (w < 85) {
      setRecommendedSize("Large (L) - Comfort Relaxed Fit");
    } else {
      setRecommendedSize("X-Large (XL) - Oversized Streetwear Fit");
    }
  };

  const featureCards = [
    {
      icon: IoSparklesOutline,
      title: "AI Smart Fit Advisor",
      desc: "Never order the wrong size again. Our smart sizing engine cross-references 200,000+ body scans to recommend your ideal fit.",
      highlight: "99.4% Fit Accuracy",
    },
    {
      icon: IoFlashOutline,
      title: "Ultra-Fast 24-48h Dispatch",
      desc: "All orders placed before 3 PM ship the same day from our automated fulfillment centers with live SMS & email tracking.",
      highlight: "Real-time Telemetry",
    },
    {
      icon: IoDiamondOutline,
      title: "Direct-From-Atelier Pricing",
      desc: "By removing traditional middlemen, retail markups, and excessive marketing bloat, we pass up to 50% savings to you.",
      highlight: "Zero Wholesaler Markup",
    },
    {
      icon: IoSyncOutline,
      title: "30-Day Doorstep Returns",
      desc: "Didn't love the fit or color? Hand it back to our courier or schedule a free home pickup in under 60 seconds.",
      highlight: "Zero Return Fees",
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: "Certified Non-Toxic Fabrics",
      desc: "All cotton, linens, and blended yarns are OEKO-TEX Standard 100 certified, hypoallergenic, and safe for sensitive skin.",
      highlight: "GOTS & OEKO Certified",
    },
    {
      icon: IoBodyOutline,
      title: "Inclusive Sizing from XS to 4XL",
      desc: "Fashion is for every physique. We design proportions meticulously for athletic, slim, tall, and plus-size frames.",
      highlight: "True-to-Life Proportions",
    },
  ];

  const comparisonRows = [
    { feature: "OEKO-TEX Certified Organic Cotton", shopco: true, traditional: "Partial", fastFashion: false },
    { feature: "AI Fit & Sizing Recommendation", shopco: true, traditional: false, fastFashion: false },
    { feature: "Transparent Direct Atelier Pricing", shopco: true, traditional: false, fastFashion: false },
    { feature: "30-Day Free Doorstep Return Pickup", shopco: true, traditional: "Buyer pays return", fastFashion: "Store credit only" },
    { feature: "Biodegradable & Recycled Packaging", shopco: true, traditional: false, fastFashion: false },
    { feature: "Longevity & Wash-Resistant Color", shopco: "50+ Washes tested", traditional: "Variable", fastFashion: "Fades in 3-5 washes" },
  ];

  return (
    <div className="info-page">
      <div className="info-container">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Features" }]} />

        {/* Hero */}
        <section className="info-hero">
          <span className="info-hero__badge">
            <IoFlashOutline /> Innovation & Craft
          </span>
          <h1 className="info-hero__title">
            Engineered For Modern Comfort, <br />
            Designed to Turn Heads.
          </h1>
          <p className="info-hero__subtitle">
            Discover why millions trust SHOP.CO for their everyday wardrobe essentials.
            Every stitch is supported by state-of-the-art textile engineering.
          </p>
          <div className="info-hero__actions">
            <a href="#fit-advisor" className="btn-primary-dark">
              Try Interactive Fit Advisor
            </a>
            <Link to="/category/casual" className="btn-secondary-light">
              Explore Catalog
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="info-section">
          <div className="info-section-header">
            <div className="info-section-tag">Distinct Advantages</div>
            <h2 className="info-section-title">The SHOP.CO Standard</h2>
            <p className="info-section-desc">
              Every garment in our catalog is engineered to redefine fashion longevity and comfort.
            </p>
          </div>

          <div className="info-grid-3">
            {featureCards.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="info-card info-card--hover">
                  <div className="info-icon-box">
                    <Icon />
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "11px",
                      fontWeight: "700",
                      background: "#f0f0f0",
                      color: "#111",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      marginBottom: "12px",
                      textTransform: "uppercase",
                    }}
                  >
                    {feat.highlight}
                  </span>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "8px" }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#525252", lineHeight: "1.6" }}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interactive Fit Advisor Simulation */}
        <section id="fit-advisor" className="info-section">
          <div className="info-card" style={{ background: "#ffffff", border: "2px solid #000000", padding: "36px" }}>
            <div className="info-grid-2" style={{ alignItems: "center" }}>
              <div>
                <span className="info-section-tag">Interactive Tool</span>
                <h3 style={{ fontSize: "24px", fontWeight: "900", marginBottom: "12px" }}>
                  Interactive AI Fit Predictor
                </h3>
                <p style={{ fontSize: "14px", color: "#555", lineHeight: "1.6", marginBottom: "20px" }}>
                  Enter your height and weight to simulate our proprietary sizing engine.
                  Find your tailored fit instantly before adding any garment to cart.
                </p>

                <form onSubmit={handleCalcSize} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <label className="info-form-label">Height (cm)</label>
                      <input
                        type="number"
                        className="info-form-input"
                        value={userHeight}
                        onChange={(e) => setUserHeight(e.target.value)}
                        required
                        min="130"
                        max="220"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="info-form-label">Weight (kg)</label>
                      <input
                        type="number"
                        className="info-form-input"
                        value={userWeight}
                        onChange={(e) => setUserWeight(e.target.value)}
                        required
                        min="35"
                        max="160"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-solid-black" style={{ alignSelf: "flex-start" }}>
                    Calculate Recommended Size
                  </button>
                </form>
              </div>

              <div
                style={{
                  background: "#f9f9f9",
                  borderRadius: "16px",
                  padding: "32px",
                  border: "1px dashed #cccccc",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", color: "#888", marginBottom: "8px" }}>
                  Calculated Optimal Size
                </div>
                <div style={{ fontSize: "22px", fontWeight: "900", color: "#000000", marginBottom: "8px" }}>
                  {recommendedSize}
                </div>
                <div style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
                  Estimated probability of a perfect fit: <strong>99.2%</strong>
                </div>
                <Link to="/category/casual" className="btn-solid-black">
                  <IoCartOutline size={18} /> Shop Products In Your Size
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="info-section">
          <div className="info-section-header">
            <div className="info-section-tag">Direct Comparison</div>
            <h2 className="info-section-title">How We Stack Up Against The Market</h2>
          </div>

          <div className="info-card" style={{ padding: "0", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}>
                  <th style={{ padding: "16px 20px", fontSize: "14px", fontWeight: "800" }}>Feature / Standard</th>
                  <th style={{ padding: "16px 20px", fontSize: "14px", fontWeight: "900", color: "#000" }}>SHOP.CO</th>
                  <th style={{ padding: "16px 20px", fontSize: "14px", fontWeight: "600", color: "#666" }}>Traditional Luxury</th>
                  <th style={{ padding: "16px 20px", fontSize: "14px", fontWeight: "600", color: "#666" }}>Fast Fashion</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "16px 20px", fontSize: "14px", fontWeight: "600" }}>{row.feature}</td>
                    <td style={{ padding: "16px 20px", fontSize: "14px", fontWeight: "800", color: "#16a34a" }}>
                      {typeof row.shopco === "boolean" ? (
                        <IoCheckmarkOutline size={20} style={{ verticalAlign: "middle" }} />
                      ) : (
                        row.shopco
                      )}
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: "14px", color: "#555" }}>
                      {typeof row.traditional === "boolean" ? (
                        row.traditional ? <IoCheckmarkOutline size={18} /> : <IoCloseOutline size={18} color="#dc2626" />
                      ) : (
                        row.traditional
                      )}
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: "14px", color: "#777" }}>
                      {typeof row.fastFashion === "boolean" ? (
                        row.fastFashion ? <IoCheckmarkOutline size={18} /> : <IoCloseOutline size={18} color="#dc2626" />
                      ) : (
                        row.fastFashion
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
