import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  IoBriefcaseOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoCashOutline,
  IoHeartOutline,
  IoAirplaneOutline,
  IoSparklesOutline,
  IoCheckmarkCircleOutline,
  IoCloseOutline,
  IoDocumentAttachOutline,
} from "react-icons/io5";
import Breadcrumb from "../../components/ui/Breadcrumb";
import "./InfoPages.css";

export default function CareerPage() {
  const [activeDept, setActiveDept] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    portfolio: "",
    experience: "3-5 years",
    coverNote: "",
  });

  const jobs = [
    {
      id: "eng-1",
      title: "Senior Full Stack React / Node Engineer",
      dept: "Engineering",
      location: "Remote / Hybrid (London / NYC)",
      type: "Full-Time",
      salary: "$130k - $160k + Equity",
      desc: "Architect scalable e-commerce infrastructure, lightning-fast checkout experiences, and AI fit recommendation algorithms.",
      tags: ["React 19", "Node.js", "PostgreSQL", "Cloud"],
    },
    {
      id: "des-1",
      title: "Lead Apparel & Streetwear Designer",
      dept: "Design & Fashion",
      location: "Milan, Italy / Hybrid",
      type: "Full-Time",
      salary: "€85k - €110k + Bonus",
      desc: "Direct our seasonal streetwear and luxury-casual capsules. Own the creative lifecycle from moodboards and techpacks to mill partnerships.",
      tags: ["Creative Direction", "Techpack", "Textiles", "Pattern Cutting"],
    },
    {
      id: "mkt-1",
      title: "Head of Influencer & Creator Marketing",
      dept: "Growth & Marketing",
      location: "Remote (Global)",
      type: "Full-Time",
      salary: "$95k - $125k + Performance Bonus",
      desc: "Spearhead our global creator collaborations, TikTok style trends, and VIP ambassador programs across Europe, US, and Asia.",
      tags: ["Influencer Marketing", "TikTok", "Brand Partnerships"],
    },
    {
      id: "eng-2",
      title: "Senior UI/UX Product Designer",
      dept: "Engineering",
      location: "Remote (Anywhere)",
      type: "Full-Time",
      salary: "$110k - $140k",
      desc: "Craft seamless, luxurious mobile & desktop shopping interfaces with micro-interactions, responsive grids, and design tokens.",
      tags: ["Figma", "Design Systems", "Prototyping", "UX Research"],
    },
    {
      id: "ops-1",
      title: "Global Supply Chain & Logistics Specialist",
      dept: "Operations",
      location: "London, UK / On-site",
      type: "Full-Time",
      salary: "£55k - £75k",
      desc: "Supervise our automated fulfillment networks, inventory allocations, and international courier SLA performance.",
      tags: ["Supply Chain", "SLA", "Inventory Ops", "Green Logistics"],
    },
    {
      id: "des-2",
      title: "Junior Fashion Colorist & Material Scout",
      dept: "Design & Fashion",
      location: "New York, USA / On-site",
      type: "Full-Time",
      salary: "$65k - $80k",
      desc: "Assist our head of textiles in discovering regenerative organic fibers, conducting lab dip evaluations, and ensuring color harmony.",
      tags: ["Fabric Testing", "Lab Dips", "Sustainable Materials"],
    },
  ];

  const perks = [
    {
      icon: IoCashOutline,
      title: "$2,500 Annual Wardrobe",
      desc: "Enjoy a generous quarterly clothing allowance to wear and test our newest drops.",
    },
    {
      icon: IoLocationOutline,
      title: "Flexible Remote-First",
      desc: "Work from our hubs in London, Milan, or NYC, or anywhere in your preferred time zone.",
    },
    {
      icon: IoAirplaneOutline,
      title: "Global Team Retreats",
      desc: "Annual team gatherings in world-class destinations to connect, brainstorm, and celebrate.",
    },
    {
      icon: IoSparklesOutline,
      title: "Learning & Wellness Stipend",
      desc: "$1,500 annually for gym memberships, masterclasses, books, and wellness perks.",
    },
  ];

  const filteredJobs =
    activeDept === "All" ? jobs : jobs.filter((j) => j.dept === activeDept);

  const handleApplySubmit = (e) => {
    e.preventDefault();
    setApplySuccess(true);
    setTimeout(() => {
      setApplySuccess(false);
      setSelectedJob(null);
      setFormData({ name: "", email: "", portfolio: "", experience: "3-5 years", coverNote: "" });
    }, 2800);
  };

  return (
    <div className="info-page">
      <div className="info-container">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Careers" }]} />

        {/* Hero */}
        <section className="info-hero">
          <span className="info-hero__badge">
            <IoBriefcaseOutline /> Careers at SHOP.CO
          </span>
          <h1 className="info-hero__title">
            Build The Future of <br />
            Next-Gen Fashion Tech.
          </h1>
          <p className="info-hero__subtitle">
            We are a collective of designers, software engineers, fabric obsessives, and storytellers
            reimagining how millions discover, wear, and love clothing.
          </p>
          <div className="info-hero__actions">
            <a href="#openings" className="btn-primary-dark">
              View {jobs.length} Open Positions
            </a>
          </div>
        </section>

        {/* Perks Grid */}
        <section className="info-section">
          <div className="info-section-header">
            <div className="info-section-tag">Life At SHOP.CO</div>
            <h2 className="info-section-title">Why You'll Love Working Here</h2>
          </div>

          <div className="info-grid-4">
            {perks.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="info-card info-card--hover">
                  <div className="info-icon-box">
                    <Icon />
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "8px" }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.6" }}>
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Open Positions */}
        <section id="openings" className="info-section">
          <div className="info-section-header">
            <div className="info-section-tag">Join The Movement</div>
            <h2 className="info-section-title">Open Opportunities</h2>
            <p className="info-section-desc">Select a department to filter open positions.</p>
          </div>

          {/* Department Filter Tabs */}
          <div className="info-tabs-bar">
            {["All", "Engineering", "Design & Fashion", "Growth & Marketing", "Operations"].map((dept) => (
              <button
                key={dept}
                className={`info-tab-btn ${activeDept === dept ? "active" : ""}`}
                onClick={() => setActiveDept(dept)}
              >
                {dept} {dept === "All" ? `(${jobs.length})` : `(${jobs.filter((j) => j.dept === dept).length})`}
              </button>
            ))}
          </div>

          {/* Jobs Listing */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="info-card"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "20px",
                }}
              >
                <div style={{ flex: "1 1 320px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        background: "#000000",
                        color: "#ffffff",
                        padding: "3px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      {job.dept}
                    </span>
                    <span style={{ fontSize: "13px", color: "#777", display: "flex", alignItems: "center", gap: "4px" }}>
                      <IoLocationOutline /> {job.location}
                    </span>
                    <span style={{ fontSize: "13px", color: "#777", display: "flex", alignItems: "center", gap: "4px" }}>
                      <IoTimeOutline /> {job.type}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#111", marginBottom: "6px" }}>
                    {job.title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#666", marginBottom: "12px", lineHeight: "1.5" }}>
                    {job.desc}
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {job.tags.map((t, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: "12px",
                          background: "#f0f0f0",
                          color: "#333",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontWeight: "500",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: "right", minWidth: "160px" }}>
                  <div style={{ fontSize: "15px", fontWeight: "800", color: "#000", marginBottom: "10px" }}>
                    {job.salary}
                  </div>
                  <button
                    className="btn-solid-black"
                    onClick={() => {
                      setSelectedJob(job);
                      setApplySuccess(false);
                    }}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Application Modal */}
        {selectedJob && (
          <div className="info-modal-backdrop" onClick={() => setSelectedJob(null)}>
            <div className="info-modal-card" onClick={(e) => e.stopPropagation()}>
              <button className="info-modal-close" onClick={() => setSelectedJob(null)}>
                <IoCloseOutline size={20} />
              </button>

              {applySuccess ? (
                <div style={{ textAlign: "center", padding: "32px 16px" }}>
                  <IoCheckmarkCircleOutline size={64} color="#16a34a" style={{ margin: "0 auto 16px" }} />
                  <h3 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "8px" }}>
                    Application Received!
                  </h3>
                  <p style={{ fontSize: "14px", color: "#666", maxWidth: "400px", margin: "0 auto" }}>
                    Thank you for applying for <strong>{selectedJob.title}</strong>. Our recruiting team will review your profile and reach out within 3 business days.
                  </p>
                </div>
              ) : (
                <>
                  <span className="info-section-tag">Quick Application</span>
                  <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "4px" }}>
                    Apply for {selectedJob.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#777", marginBottom: "20px" }}>
                    {selectedJob.dept} • {selectedJob.location}
                  </p>

                  <form onSubmit={handleApplySubmit}>
                    <div className="info-form-group">
                      <label className="info-form-label">Full Name *</label>
                      <input
                        type="text"
                        className="info-form-input"
                        placeholder="John Doe"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="info-form-group">
                      <label className="info-form-label">Email Address *</label>
                      <input
                        type="email"
                        className="info-form-input"
                        placeholder="john@example.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="info-form-group">
                      <label className="info-form-label">Portfolio, GitHub, or LinkedIn URL *</label>
                      <input
                        type="url"
                        className="info-form-input"
                        placeholder="https://linkedin.com/in/..."
                        required
                        value={formData.portfolio}
                        onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                      />
                    </div>

                    <div className="info-form-group">
                      <label className="info-form-label">Relevant Years of Experience</label>
                      <select
                        className="info-form-select"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      >
                        <option value="1-2 years">1-2 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="5-8 years">5-8 years</option>
                        <option value="8+ years">8+ years</option>
                      </select>
                    </div>

                    <div className="info-form-group">
                      <label className="info-form-label">Cover Note / Why SHOP.CO?</label>
                      <textarea
                        rows={3}
                        className="info-form-textarea"
                        placeholder="Tell us what excites you about this role..."
                        value={formData.coverNote}
                        onChange={(e) => setFormData({ ...formData, coverNote: e.target.value })}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                      <button type="button" className="btn-outline" onClick={() => setSelectedJob(null)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn-solid-black">
                        Submit Application
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
