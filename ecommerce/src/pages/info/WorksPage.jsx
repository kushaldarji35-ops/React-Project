import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  IoConstructOutline,
  IoColorPaletteOutline,
  IoCutOutline,
  IoCubeOutline,
  IoAirplaneOutline,
  IoCheckmarkCircle,
  IoArrowForwardOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import Breadcrumb from "../../components/ui/Breadcrumb";
import "./InfoPages.css";

export default function WorksPage() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: "01",
      icon: IoColorPaletteOutline,
      title: "Inspiration & Silhouette Architecture",
      desc: "Our design team in Milan and London studies emerging silhouettes, archival streetwear cuts, and functional everyday tailoring to sketch collections that remain effortlessly relevant season after season.",
      highlights: [
        "Over 120 preliminary sketches per release",
        "Color palette tested under daylight, incandescent, and evening lighting",
        "3D digital prototyping to minimize physical waste",
      ],
    },
    {
      num: "02",
      icon: IoCutOutline,
      title: "Certified Ethical Fiber Sourcing",
      desc: "We exclusively purchase long-staple combed cotton, responsibly sheared Merino wool, and recycled performance poly from audited mills that adhere strictly to OEKO-TEX and GOTS standards.",
      highlights: [
        "Strict zero-hazardous-chemical dyeing mandate",
        "Traceability guarantee for every yarn spindle",
        "Fair living wage guarantees across all spinning facilities",
      ],
    },
    {
      num: "03",
      icon: IoConstructOutline,
      title: "Artisan Tailoring & Stress Testing",
      desc: "Every piece undergoes dual-side flatlock or triple-needle seam reinforcement. Prototypes are washed 30 times and tested for tensile strength, pilling resistance, and color steadfastness before production.",
      highlights: [
        "Pre-shrunk fabric wash ensuring zero shrinkage post-purchase",
        "Reinforced collar bands to prevent bacon-neck stretching",
        "Reinforced stress points on pockets and belt loops",
      ],
    },
    {
      num: "04",
      icon: IoCubeOutline,
      title: "Zero-Waste Sustainable Packaging",
      desc: "Our garments are folded into 100% biodegradable cornstarch bags and sealed in FSC-certified recycled mailers. No single-use virgin plastics ever touch your order.",
      highlights: [
        "100% home-compostable inner packaging",
        "Custom branded paper tape and recycled hangtags",
        "Carbon-offset shipping calculation applied to every package",
      ],
    },
    {
      num: "05",
      icon: IoAirplaneOutline,
      title: "Express Dispatch & Real-Time Tracking",
      desc: "Orders are scanned and routed via our automated fulfillment centers. From the moment your package departs to the moment it arrives at your doorstep, you receive step-by-step telemetry updates.",
      highlights: [
        "Same-day dispatch for orders before 3 PM",
        "Live GPS tracking link sent via SMS and Email",
        "Signature on delivery or safe drop options available",
      ],
    },
  ];

  return (
    <div className="info-page">
      <div className="info-container">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "How It Works" }]} />

        {/* Hero */}
        <section className="info-hero">
          <span className="info-hero__badge">
            <IoConstructOutline /> The Process
          </span>
          <h1 className="info-hero__title">
            From Atelier Sketch <br />
            To Your Everyday Wardrobe.
          </h1>
          <p className="info-hero__subtitle">
            Transparency is at the heart of our craft. Follow the exact journey every SHOP.CO
            garment takes before arriving perfectly prepared for you.
          </p>
          <div className="info-hero__actions">
            <Link to="/features" className="btn-primary-dark">
              Explore Our Features
            </Link>
            <Link to="/category/casual" className="btn-secondary-light">
              Shop Collections
            </Link>
          </div>
        </section>

        {/* Interactive Step Navigator */}
        <section className="info-section">
          <div className="info-section-header">
            <div className="info-section-tag">Interactive Breakdown</div>
            <h2 className="info-section-title">The 5-Stage Craft Journey</h2>
            <p className="info-section-desc">Click on any stage below to inspect our manufacturing and fulfillment standards.</p>
          </div>

          {/* Stepper Tabs */}
          <div className="info-tabs-bar">
            {steps.map((st, idx) => (
              <button
                key={idx}
                className={`info-tab-btn ${activeStep === idx ? "active" : ""}`}
                onClick={() => setActiveStep(idx)}
              >
                Step {st.num}: {st.title.split("&")[0]}
              </button>
            ))}
          </div>

          {/* Active Step Showcase */}
          <div className="info-card" style={{ border: "2px solid #000000", padding: "36px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: "900",
                  color: "#000000",
                  background: "#f0f0f0",
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {steps[activeStep].num}
              </span>
              <div>
                <span className="info-section-tag">Stage {activeStep + 1} of 5</span>
                <h3 style={{ fontSize: "24px", fontWeight: "800" }}>{steps[activeStep].title}</h3>
              </div>
            </div>

            <p style={{ fontSize: "16px", color: "#444", lineHeight: "1.7", marginBottom: "24px" }}>
              {steps[activeStep].desc}
            </p>

            <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "14px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
                Quality Standards & Safeguards
              </h4>
              <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {steps[activeStep].highlights.map((h, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#333" }}>
                    <IoCheckmarkCircle size={18} color="#16a34a" /> {h}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "28px" }}>
              <button
                className="btn-outline"
                disabled={activeStep === 0}
                style={{ opacity: activeStep === 0 ? 0.4 : 1, cursor: activeStep === 0 ? "not-allowed" : "pointer" }}
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              >
                Previous Step
              </button>
              <button
                className="btn-solid-black"
                disabled={activeStep === steps.length - 1}
                style={{ opacity: activeStep === steps.length - 1 ? 0.4 : 1, cursor: activeStep === steps.length - 1 ? "not-allowed" : "pointer" }}
                onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
              >
                Next Step <IoArrowForwardOutline />
              </button>
            </div>
          </div>
        </section>

        {/* Why Transparency Matters */}
        <section className="info-section">
          <div className="info-grid-3">
            <div className="info-card">
              <div className="info-icon-box">
                <IoInformationCircleOutline />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "8px" }}>Zero Markups</h3>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6" }}>
                Traditional department stores mark up clothing up to 8x to pay for expensive retail rents and distributor chains. We ship straight from our workshops to you.
              </p>
            </div>
            <div className="info-card">
              <div className="info-icon-box">
                <IoCheckmarkCircle />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "8px" }}>Small Batch Drops</h3>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6" }}>
                Instead of overproducing millions of units destined for landfills, we produce in agile, precision batches that align with actual community demand.
              </p>
            </div>
            <div className="info-card">
              <div className="info-icon-box">
                <IoAirplaneOutline />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "8px" }}>Carbon Balanced</h3>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6" }}>
                We invest in verified carbon capture projects to balance 100% of the emissions generated in shipping your packages across land and air.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
