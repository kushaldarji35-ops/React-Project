import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  IoSchoolOutline,
  IoCodeSlashOutline,
  IoLayersOutline,
  IoColorPaletteOutline,
  IoConstructOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseOutline,
  IoArrowForwardOutline,
} from "react-icons/io5";
import Breadcrumb from "../../components/ui/Breadcrumb";
import "./InfoPages.css";

export default function DevTutorialPage() {
  const [activeLevel, setActiveLevel] = useState("All");
  const [selectedTutorial, setSelectedTutorial] = useState(null);

  const tutorials = [
    {
      id: "tut-1",
      title: "Understanding Fabric GSM & Streetwear Silhouette Structure",
      level: "Beginner",
      duration: "8 min read",
      category: "Textile Science",
      desc: "Why cheap 140 GSM shirts lose shape after 2 washes, and why 240+ GSM combed heavyweight cotton creates the coveted structured drape.",
      keyTakeaways: [
        "GSM stands for Grams per Square Meter",
        "Lightweight tees (120-150 GSM) vs Midweight (180-200 GSM) vs Heavyweight (240-320 GSM)",
        "Combed ring-spun cotton vs open-end carded yarns",
        "How rib collar density (1x1 vs 2x2) prevents sagging",
      ],
      fullContent: `When designing high-caliber modern garments, the fundamental starting point is fabric weight measured in Grams per Square Meter (GSM). 

Standard commercial fast-fashion tees typically range between 130 and 150 GSM. While inexpensive to manufacture, they cling to the body and warp rapidly after moisture exposure. 

At SHOP.CO, our signature heavyweight boxy silhouettes utilize custom-milled 240 GSM to 280 GSM combed organic cotton. This increased fiber density allows the garment to maintain a sculptural, architectural boxy drape that hangs independently from the torso, elevating an everyday casual look into an intentional statement piece.`,
    },
    {
      id: "tut-2",
      title: "Color Theory & Natural Dyeing: Reactive vs Pigment Wash",
      level: "Intermediate",
      duration: "12 min read",
      category: "Dyeing & Color",
      desc: "Learn the chemical differences between piece dyeing, reactive fiber bonding, and vintage enzyme mineral washes.",
      keyTakeaways: [
        "Reactive dyes create atomic covalent bonds with cellulose fibers",
        "Pigment washes selectively fade over raised seams for vintage depth",
        "Eco-friendly botanical tannin baths for earthy palettes",
      ],
      fullContent: `Garment dyeing involves assembling the raw, unbleached cotton apparel before submersion into high-temperature dye baths. 

Unlike piece dyeing (dyeing rolls of fabric before cutting), garment dyeing softens the cotton fibers, relieves pre-existing seam tensions, and imparts a luxurious, broken-in handfeel.

We employ low-impact reactive dyes that produce vibrant color depth with 40% less water usage compared to standard synthetic baths.`,
    },
    {
      id: "tut-3",
      title: "Pattern Drafting: Calculating Drop-Shoulder & Crop Proportions",
      level: "Masterclass",
      duration: "15 min read",
      category: "Pattern Making",
      desc: "The geometric math behind modern streetwear: balancing elongated shoulder seams with truncated torso lengths for a flattering aesthetic.",
      keyTakeaways: [
        "Dropping the shoulder seam 4 to 6 cm beyond the acromion bone",
        "Widening the chest pit-to-pit ratio while keeping hem length at hip line",
        "Armhole curve adjustments to eliminate sleeve armpit bunching",
      ],
      fullContent: `Modern streetwear silhouettes depart drastically from traditional slim-fit tailoring. The core objective is achieving volume without sloppiness. 

To accomplish this, pattern makers widen the armscye and drop the shoulder seam precisely 4 to 6 centimeters beyond the natural shoulder apex, while proportionately truncating the hem by 3 centimeters. 

This gives the illusion of broader shoulders and longer leg lines, creating a statuesque, balanced silhouette suitable for all body types.`,
    },
    {
      id: "tut-4",
      title: "Garment Quality Inspection: How to Spot Premium Craftsmanship",
      level: "Beginner",
      duration: "10 min read",
      category: "Quality Control",
      desc: "A hands-on checklist you can use on any piece of clothing to assess stitch density, thread tensile strength, and hardware longevity.",
      keyTakeaways: [
        "Stitch density: 10-12 stitches per inch (SPI) indicates high quality",
        "Flatlock vs overlock inner stitching durability",
        "Bar-tack reinforcement at pockets, zipper bases, and belt loops",
      ],
      fullContent: `Before adding any garment to your permanent rotation, examine the inner seam construction. 

Inspect the stitches per inch (SPI). Budget garments feature coarse 6-8 SPI, which breaks under stress. Master-tailored garments feature tightly spaced 10-12 SPI using bonded nylon or heavy-duty cotton core thread. 

Additionally, check that stress points—such as pocket corners and split hem vents—are reinforced with dense bar-tack stitching.`,
    },
  ];

  const filteredTutorials =
    activeLevel === "All" ? tutorials : tutorials.filter((t) => t.level === activeLevel);

  return (
    <div className="info-page">
      <div className="info-container">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Development Tutorials" }]} />

        {/* Hero */}
        <section className="info-hero">
          <span className="info-hero__badge">
            <IoSchoolOutline /> Garment Engineering
          </span>
          <h1 className="info-hero__title">
            Fashion Development & <br />
            Apparel Craft Masterclasses.
          </h1>
          <p className="info-hero__subtitle">
            Demystifying the engineering, fiber science, and pattern mechanics behind modern fashion.
            Learn how world-class ateliers design garments that stand the test of time.
          </p>
        </section>

        {/* Level Filter */}
        <section className="info-section">
          <div className="info-tabs-bar">
            {["All", "Beginner", "Intermediate", "Masterclass"].map((lvl) => (
              <button
                key={lvl}
                className={`info-tab-btn ${activeLevel === lvl ? "active" : ""}`}
                onClick={() => setActiveLevel(lvl)}
              >
                {lvl} {lvl === "All" ? `(${tutorials.length})` : `(${tutorials.filter((t) => t.level === lvl).length})`}
              </button>
            ))}
          </div>

          {/* Tutorials Grid */}
          <div className="info-grid-2">
            {filteredTutorials.map((tut) => (
              <div
                key={tut.id}
                className="info-card info-card--hover"
                style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        background: tut.level === "Beginner" ? "#dcfce7" : tut.level === "Intermediate" ? "#fef3c7" : "#ede9fe",
                        color: tut.level === "Beginner" ? "#15803d" : tut.level === "Intermediate" ? "#b45309" : "#6d28d9",
                        padding: "3px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      {tut.level}
                    </span>
                    <span style={{ fontSize: "12px", color: "#777", display: "flex", alignItems: "center", gap: "4px" }}>
                      <IoTimeOutline /> {tut.duration}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#111", marginBottom: "8px", lineHeight: "1.4" }}>
                    {tut.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.6", marginBottom: "18px" }}>
                    {tut.desc}
                  </p>

                  <div style={{ background: "#f8f8f8", padding: "14px", borderRadius: "12px", marginBottom: "20px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#888", marginBottom: "8px" }}>
                      Key Learnings
                    </div>
                    <ul style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {tut.keyTakeaways.slice(0, 3).map((item, i) => (
                        <li key={i} style={{ fontSize: "12px", color: "#333", display: "flex", alignItems: "center", gap: "6px" }}>
                          <IoCheckmarkCircleOutline color="#16a34a" size={14} /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  className="btn-solid-black"
                  onClick={() => setSelectedTutorial(tut)}
                >
                  Read Full Tutorial <IoArrowForwardOutline />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Tutorial Reader Modal */}
        {selectedTutorial && (
          <div className="info-modal-backdrop" onClick={() => setSelectedTutorial(null)}>
            <div className="info-modal-card" style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()}>
              <button className="info-modal-close" onClick={() => setSelectedTutorial(null)}>
                <IoCloseOutline size={20} />
              </button>

              <span className="info-section-tag">{selectedTutorial.category} • {selectedTutorial.level}</span>
              <h2 style={{ fontSize: "22px", fontWeight: "900", margin: "6px 0 16px", lineHeight: "1.3" }}>
                {selectedTutorial.title}
              </h2>

              <div style={{ background: "#f9f9f9", padding: "16px", borderRadius: "12px", marginBottom: "20px" }}>
                <h4 style={{ fontSize: "13px", fontWeight: "800", textTransform: "uppercase", marginBottom: "8px" }}>
                  Curriculum Takeaways
                </h4>
                <ul style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedTutorial.keyTakeaways.map((tk, idx) => (
                    <li key={idx} style={{ fontSize: "13px", color: "#444", display: "flex", alignItems: "center", gap: "8px" }}>
                      <IoCheckmarkCircleOutline color="#16a34a" size={16} /> {tk}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ fontSize: "15px", color: "#333", lineHeight: "1.8", whiteSpace: "pre-line", marginBottom: "28px" }}>
                {selectedTutorial.fullContent}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eee", paddingTop: "16px" }}>
                <span style={{ fontSize: "13px", color: "#777" }}>
                  Mastery estimated at {selectedTutorial.duration}
                </span>
                <button className="btn-solid-black" onClick={() => setSelectedTutorial(null)}>
                  Close Tutorial
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
