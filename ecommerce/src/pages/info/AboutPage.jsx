import React from "react";
import { Link } from "react-router-dom";
import {
  IoSparklesOutline,
  IoCheckmarkCircleOutline,
  IoLeafOutline,
  IoHeartOutline,
  IoShieldCheckmarkOutline,
  IoArrowForwardOutline,
  IoPeopleOutline,
  IoGlobeOutline,
} from "react-icons/io5";
import Breadcrumb from "../../components/ui/Breadcrumb";
import "./InfoPages.css";

export default function AboutPage() {
  const stats = [
    { value: "15M+", label: "Happy Customers Worldwide" },
    { value: "200+", label: "Global Designer Brands" },
    { value: "30k+", label: "Handcrafted Styles" },
    { value: "99.8%", label: "Satisfaction Rate" },
  ];

  const values = [
    {
      icon: IoSparklesOutline,
      title: "Uncompromising Quality",
      desc: "Every single thread, seam, and button is tested for longevity, comfort, and premium feel. We don't settle for fast-fashion compromises.",
    },
    {
      icon: IoLeafOutline,
      title: "Eco-Conscious Future",
      desc: "From 100% organic cotton to biodegradable packaging, we ensure our carbon footprint decreases while style quotient rises.",
    },
    {
      icon: IoHeartOutline,
      title: "Customer Obsession",
      desc: "Your confidence is our measure of success. We provide hassle-free 30-day returns, round-the-clock support, and personalized fit recommendations.",
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: "Fair & Ethical Craft",
      desc: "We partner exclusively with certified ateliers that guarantee fair living wages, ethical working conditions, and skilled craftsmanship.",
    },
  ];

  const milestones = [
    {
      year: "2020",
      title: "The Genesis",
      text: "Founded with a clear vision: bring runway-worthy streetwear and everyday luxury to style-forward individuals worldwide.",
    },
    {
      year: "2022",
      title: "Global Reach",
      text: "Expanded delivery to over 45 countries, partnering with visionary indie designers and sustainable cotton mills.",
    },
    {
      year: "2024",
      title: "Zero-Waste Movement",
      text: "Transitioned to 100% compostable mailers and recycled hardware across our entire supply chain.",
    },
    {
      year: "2026",
      title: "The Modern Era",
      text: "Serving millions of fashion enthusiasts with AI-tailored sizing, real-time tracking, and exclusive weekly drops.",
    },
  ];

  return (
    <div className="info-page">
      <div className="info-container">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />

        {/* Hero */}
        <section className="info-hero">
          <span className="info-hero__badge">
            <IoSparklesOutline /> Our Story & Vision
          </span>
          <h1 className="info-hero__title">
            Crafting Timeless Style, <br />
            Empowering Modern Expression.
          </h1>
          <p className="info-hero__subtitle">
            At SHOP.CO, we believe what you wear is a reflection of your individuality.
            We blend avant-garde silhouettes with comfortable everyday staples to build
            wardrobes that inspire confidence without breaking the bank.
          </p>
          <div className="info-hero__actions">
            <Link to="/category/casual" className="btn-primary-dark">
              Explore Collections <IoArrowForwardOutline />
            </Link>
            <Link to="/works" className="btn-secondary-light">
              How We Work
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="info-stats-grid">
          {stats.map((s, idx) => (
            <div key={idx} className="info-stat-card">
              <div className="info-stat-num">{s.value}</div>
              <div className="info-stat-label">{s.label}</div>
            </div>
          ))}
        </section>

        {/* Brand Mission & Values */}
        <section className="info-section">
          <div className="info-section-header">
            <div className="info-section-tag">Core Principles</div>
            <h2 className="info-section-title">Built On Trust, Style & Integrity</h2>
            <p className="info-section-desc">
              We stand against throwaway fashion. Everything we design is tailored to last through seasons and trends.
            </p>
          </div>

          <div className="info-grid-2">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="info-card info-card--hover">
                  <div className="info-icon-box">
                    <Icon />
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
                    {val.title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#525252", lineHeight: "1.6" }}>
                    {val.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Timeline */}
        <section className="info-section">
          <div className="info-section-header">
            <div className="info-section-tag">Our Milestones</div>
            <h2 className="info-section-title">The Evolution of SHOP.CO</h2>
          </div>

          <div className="info-grid-4">
            {milestones.map((item, idx) => (
              <div key={idx} className="info-card" style={{ borderLeft: "4px solid #000000" }}>
                <span style={{ fontSize: "24px", fontWeight: "900", color: "#000000", display: "block", marginBottom: "6px" }}>
                  {item.year}
                </span>
                <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "6px" }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.5" }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Join the Community CTA */}
        <div className="info-card" style={{ background: "#000000", color: "#ffffff", textAlign: "center", padding: "48px 24px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "12px" }}>
            Ready to Elevate Your Everyday Style?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", maxWidth: "560px", margin: "0 auto 24px", fontSize: "15px" }}>
            Join over 15 million shoppers discovering fresh weekly arrivals, sustainable apparel, and unmatched tailoring.
          </p>
          <Link to="/category/casual" className="btn-primary-dark">
            Shop New Arrivals
          </Link>
        </div>
      </div>
    </div>
  );
}
