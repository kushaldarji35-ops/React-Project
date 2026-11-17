import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  IoAirplaneOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoCalculatorOutline,
  IoCalendarOutline,
  IoCubeOutline,
} from "react-icons/io5";
import Breadcrumb from "../../components/ui/Breadcrumb";
import "./InfoPages.css";

export default function DeliveryDetailsPage() {
  const [calcCountry, setCalcCountry] = useState("US");
  const [calcPostal, setCalcPostal] = useState("10001");
  const [calcResult, setCalcResult] = useState(null);

  const shippingMethods = [
    {
      title: "Standard Ground Delivery",
      time: "3 - 5 Business Days",
      cost: "FREE over $50 (or $4.99)",
      badge: "Most Popular",
      desc: "Reliable and eco-optimized delivery routed via electric courier fleets and regional ground networks.",
    },
    {
      title: "Express Air Priority",
      time: "1 - 2 Business Days",
      cost: "$9.99 flat rate",
      badge: "Fastest",
      desc: "Guaranteed next-day or 2-day priority dispatch with airport air-cargo routing for when time is critical.",
    },
    {
      title: "Same-Day Metro Dispatch",
      time: "Delivered by 8:00 PM today",
      cost: "$14.99",
      badge: "Metro Only",
      desc: "Place your order before 12:00 PM in select metropolitan hubs (NYC, London, LA, Chicago, Toronto).",
    },
    {
      title: "International Global Priority",
      time: "4 - 7 Business Days",
      cost: "Calculated at checkout (Free over $150)",
      badge: "Worldwide",
      desc: "Delivered to 120+ countries with all import duties and local VAT pre-calculated and cleared at customs.",
    },
  ];

  const handleCalculateRate = (e) => {
    e.preventDefault();
    const today = new Date();
    const standardDate = new Date(today);
    standardDate.setDate(today.getDate() + 3);

    const expressDate = new Date(today);
    expressDate.setDate(today.getDate() + 1);

    setCalcResult({
      standardEstimate: standardDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      expressEstimate: expressDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      country: calcCountry === "US" ? "United States" : calcCountry === "UK" ? "United Kingdom" : calcCountry === "CA" ? "Canada" : "European Union",
      postal: calcPostal,
    });
  };

  return (
    <div className="info-page">
      <div className="info-container">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Delivery Details" }]} />

        {/* Hero */}
        <section className="info-hero">
          <span className="info-hero__badge">
            <IoAirplaneOutline /> Worldwide Logistics
          </span>
          <h1 className="info-hero__title">
            Fast, Dependable & <br />
            Carbon-Neutral Delivery.
          </h1>
          <p className="info-hero__subtitle">
            We partner with premier global courier networks (FedEx, DHL, UPS) to bring you swift,
            transparent, and fully insured shipping right to your doorstep.
          </p>
          <div className="info-hero__actions">
            <a href="#calculator" className="btn-primary-dark">
              Calculate Delivery Time
            </a>
            <Link to="/manage-deliveries" className="btn-secondary-light">
              Track Active Shipment
            </Link>
          </div>
        </section>

        {/* Shipping Methods Grid */}
        <section className="info-section">
          <div className="info-section-header">
            <div className="info-section-tag">Tier Options</div>
            <h2 className="info-section-title">Shipping Speeds & Pricing</h2>
            <p className="info-section-desc">Select the delivery option that best suits your timeline at checkout.</p>
          </div>

          <div className="info-grid-2">
            {shippingMethods.map((m, idx) => (
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
                      {m.badge}
                    </span>
                    <h3 style={{ fontSize: "18px", fontWeight: "800", marginTop: "8px" }}>{m.title}</h3>
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#16a34a", textAlign: "right" }}>
                    {m.cost}
                  </span>
                </div>

                <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6", marginBottom: "16px" }}>
                  {m.desc}
                </p>

                <div
                  style={{
                    background: "#f7f7f7",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#222",
                  }}
                >
                  <IoTimeOutline size={16} /> Estimated Arrival: {m.time}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Shipping Estimator Widget */}
        <section id="calculator" className="info-section">
          <div className="info-card" style={{ background: "#ffffff", border: "2px solid #000000", padding: "36px" }}>
            <div className="info-grid-2" style={{ alignItems: "center" }}>
              <div>
                <span className="info-section-tag">Estimate Transit</span>
                <h3 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "10px" }}>
                  Delivery Time Calculator
                </h3>
                <p style={{ fontSize: "14px", color: "#555", lineHeight: "1.6", marginBottom: "20px" }}>
                  Enter your destination details to calculate guaranteed arrival dates and rates for your postal code.
                </p>

                <form onSubmit={handleCalculateRate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <label className="info-form-label">Country / Region</label>
                      <select
                        className="info-form-select"
                        value={calcCountry}
                        onChange={(e) => setCalcCountry(e.target.value)}
                      >
                        <option value="US">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="CA">Canada</option>
                        <option value="EU">European Union</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label className="info-form-label">Postal / Zip Code</label>
                      <input
                        type="text"
                        className="info-form-input"
                        placeholder="e.g. 10001"
                        required
                        value={calcPostal}
                        onChange={(e) => setCalcPostal(e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-solid-black" style={{ alignSelf: "flex-start" }}>
                    <IoCalculatorOutline size={18} /> Calculate Transit Times
                  </button>
                </form>
              </div>

              <div
                style={{
                  background: "#f9f9f9",
                  borderRadius: "16px",
                  padding: "28px",
                  border: "1px dashed #cccccc",
                }}
              >
                {calcResult ? (
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#888", marginBottom: "10px" }}>
                      Rates for {calcResult.country} ({calcResult.postal})
                    </div>
                    <div style={{ marginBottom: "14px", paddingBottom: "12px", borderBottom: "1px solid #eee" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "15px" }}>
                        <span>Standard Ground</span>
                        <span style={{ color: "#16a34a" }}>FREE over $50</span>
                      </div>
                      <div style={{ fontSize: "13px", color: "#666", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                        <IoCalendarOutline /> Arrives by: <strong>{calcResult.standardEstimate}</strong>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "15px" }}>
                        <span>Express Air Cargo</span>
                        <span>$9.99</span>
                      </div>
                      <div style={{ fontSize: "13px", color: "#666", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                        <IoCalendarOutline /> Arrives by: <strong>{calcResult.expressEstimate} (Priority)</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", color: "#777", padding: "20px 0" }}>
                    <IoAirplaneOutline size={36} color="#bbb" style={{ margin: "0 auto 8px" }} />
                    <p style={{ fontSize: "14px" }}>Enter postal code above and click calculate.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Guarantees */}
        <section className="info-section">
          <div className="info-grid-3">
            <div className="info-card">
              <div className="info-icon-box">
                <IoShieldCheckmarkOutline />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "6px" }}>100% Insured Packages</h3>
              <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.6" }}>
                Every single parcel is protected against loss, damage, or porch theft. If anything happens in transit, we replace it instantly.
              </p>
            </div>

            <div className="info-card">
              <div className="info-icon-box">
                <IoCubeOutline />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "6px" }}>Discreet Luxury Packaging</h3>
              <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.6" }}>
                Packaged in durable, weather-sealed matte mailers designed to keep garments crisp, clean, and wrinkle-free.
              </p>
            </div>

            <div className="info-card">
              <div className="info-icon-box">
                <IoCheckmarkCircle />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "6px" }}>Hassle-Free Doorstep Pickup</h3>
              <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.6" }}>
                Need a size swap? Our courier brings the replacement and picks up the return piece in one seamless visit.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
