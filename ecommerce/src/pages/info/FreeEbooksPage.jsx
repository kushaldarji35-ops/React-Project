import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  IoBookOutline,
  IoDownloadOutline,
  IoStar,
  IoCheckmarkCircleOutline,
  IoCloseOutline,
  IoSparklesOutline,
  IoDocumentTextOutline,
} from "react-icons/io5";
import Breadcrumb from "../../components/ui/Breadcrumb";
import "./InfoPages.css";

export default function FreeEbooksPage() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const ebooks = [
    {
      id: "eb-1",
      title: "The Minimalist Capsule Wardrobe Blueprint",
      author: "SHOP.CO Styling Collective",
      pages: "58 Pages (PDF)",
      rating: "4.9",
      coverColor: "#1e293b",
      tag: "Best Seller",
      desc: "Learn how to assemble 50+ versatile, runway-inspired outfits from just 14 essential high-quality foundation pieces.",
    },
    {
      id: "eb-2",
      title: "Streetwear Evolution: The 2026 Style Bible",
      author: "Marcus Chen, Creative Director",
      pages: "72 Pages (PDF)",
      rating: "4.8",
      coverColor: "#0f172a",
      tag: "Trending",
      desc: "Master the art of boxy silhouettes, layering heavyweight garments, drop shoulders, and color palette balance.",
    },
    {
      id: "eb-3",
      title: "Fabric Longevity, Care & Textile Preservation",
      author: "Dr. Elena Rostova, Textile Scientist",
      pages: "44 Pages (PDF)",
      rating: "5.0",
      coverColor: "#1c1917",
      tag: "Sustainability",
      desc: "How to wash raw cotton, steam delicate wools, avoid collar stretching, and keep colors radiant for 5+ years.",
    },
    {
      id: "eb-4",
      title: "Color Theory & Contrast for Everyday Outfits",
      author: "Sophie Laurent, Color Consultant",
      pages: "48 Pages (PDF)",
      rating: "4.9",
      coverColor: "#27272a",
      tag: "Visual Guide",
      desc: "Demystify monochromatic schemes, earthy undertones, complementary contrast, and accent piece placement.",
    },
    {
      id: "eb-5",
      title: "The Denim Encyclopedia: Fits, Washes & Selvedge",
      author: "SHOP.CO Denim Ateliers",
      pages: "64 Pages (PDF)",
      rating: "4.9",
      coverColor: "#172554",
      tag: "Craft Guide",
      desc: "Understanding denim weights from 11oz to 16oz, raw selvedge break-in secrets, and finding the perfect rise for your frame.",
    },
    {
      id: "eb-6",
      title: "Quiet Luxury & High-Impact Styling",
      author: "Julian Vance, Wardrobe Architect",
      pages: "52 Pages (PDF)",
      rating: "4.7",
      coverColor: "#312e81",
      tag: "Editorial",
      desc: "Achieve understated sophistication using immaculate textures, crisp tailoring, and clean minimalist silhouettes.",
    },
  ];

  const handleDownload = (e) => {
    e.preventDefault();
    if (!emailInput) return;
    setIsDownloading(true);

    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        setSelectedBook(null);
        setEmailInput("");
      }, 3000);
    }, 1500);
  };

  return (
    <div className="info-page">
      <div className="info-container">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Free eBooks" }]} />

        {/* Hero */}
        <section className="info-hero">
          <span className="info-hero__badge">
            <IoBookOutline /> Style Knowledge Base
          </span>
          <h1 className="info-hero__title">
            Curated Fashion eBooks & <br />
            Definitive Style Guides.
          </h1>
          <p className="info-hero__subtitle">
            Download our comprehensive, beautifully illustrated styling guides for free.
            Elevate your personal aesthetic with insider knowledge from world-class designers and textile experts.
          </p>
        </section>

        {/* eBooks Grid */}
        <section className="info-section">
          <div className="info-section-header">
            <div className="info-section-tag">Complimentary Downloads</div>
            <h2 className="info-section-title">Explore Our Digital Library</h2>
          </div>

          <div className="info-grid-3">
            {ebooks.map((book) => (
              <div
                key={book.id}
                className="info-card info-card--hover"
                style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div>
                  {/* Digital Book Cover Preview */}
                  <div
                    style={{
                      height: "180px",
                      background: book.coverColor,
                      color: "#fff",
                      borderRadius: "14px",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      marginBottom: "18px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          background: "rgba(255,255,255,0.2)",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          textTransform: "uppercase",
                        }}
                      >
                        {book.tag}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#facc15" }}>
                        <IoStar size={14} /> {book.rating}
                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontSize: "17px", fontWeight: "800", lineHeight: "1.3", margin: "0 0 6px" }}>
                        {book.title}
                      </h3>
                      <div style={{ fontSize: "12px", opacity: 0.8 }}>{book.author}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px", fontWeight: "600" }}>
                    {book.pages} • High-Resolution PDF
                  </div>
                  <p style={{ fontSize: "13px", color: "#555", lineHeight: "1.6", marginBottom: "20px" }}>
                    {book.desc}
                  </p>
                </div>

                <button
                  className="btn-solid-black"
                  style={{ width: "100%" }}
                  onClick={() => {
                    setSelectedBook(book);
                    setDownloadSuccess(false);
                  }}
                >
                  <IoDownloadOutline size={18} /> Download Free PDF
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Download Modal */}
        {selectedBook && (
          <div className="info-modal-backdrop" onClick={() => setSelectedBook(null)}>
            <div className="info-modal-card" onClick={(e) => e.stopPropagation()}>
              <button className="info-modal-close" onClick={() => setSelectedBook(null)}>
                <IoCloseOutline size={20} />
              </button>

              {downloadSuccess ? (
                <div style={{ textAlign: "center", padding: "32px 16px" }}>
                  <IoCheckmarkCircleOutline size={64} color="#16a34a" style={{ margin: "0 auto 16px" }} />
                  <h3 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "8px" }}>
                    Your Download Has Started!
                  </h3>
                  <p style={{ fontSize: "14px", color: "#666" }}>
                    We've sent a permanent download link to <strong>{emailInput}</strong> along with a 15% VIP discount code.
                  </p>
                </div>
              ) : (
                <>
                  <span className="info-section-tag">Instant Free Download</span>
                  <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "6px" }}>
                    {selectedBook.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
                    Enter your email address below to receive the free high-res PDF and future style drops directly in your inbox.
                  </p>

                  <form onSubmit={handleDownload}>
                    <div className="info-form-group">
                      <label className="info-form-label">Email Address *</label>
                      <input
                        type="email"
                        className="info-form-input"
                        placeholder="you@example.com"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                      <button type="button" className="btn-outline" onClick={() => setSelectedBook(null)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn-solid-black" disabled={isDownloading}>
                        {isDownloading ? "Generating PDF..." : "Download Now"}
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
