import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  IoNewspaperOutline,
  IoSearchOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoArrowForwardOutline,
  IoCloseOutline,
  IoChatbubbleEllipsesOutline,
  IoBookmarkOutline,
  IoShareSocialOutline,
} from "react-icons/io5";
import Breadcrumb from "../../components/ui/Breadcrumb";
import "./InfoPages.css";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [readingArticle, setReadingArticle] = useState(null);

  const articles = [
    {
      id: "art-1",
      title: "How to Style Oversized Boxy Silhouettes Without Looking Disproportional",
      category: "Style How-To",
      author: "Marcus Chen",
      date: "Oct 10, 2026",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
      excerpt: "Boxy cuts are a modern wardrobe staple, but balancing proportions is crucial. Here is the golden 70/30 rule to wear relaxed streetwear with sharp intent.",
      content: `The boxy silhouette has transformed from an avant-garde subculture look into the defining proportion of modern fashion. However, simply buying garments two sizes up is a recipe for messy proportions.

The secret to mastering oversized wear lies in the 'Tension of Contrasts':

1. The Ankle Anchor: When wearing wide-leg trousers or oversized cargo pants, pair them with a sneaker or loafer that has a defined sole unit. This grounds the silhouette.

2. The 70/30 Golden Ratio: If your top is loose and drops past your hip, tuck the front hem subtly or select pants that maintain clean vertical seams down the legs.

3. Fabric Weight is Everything: Flimsy fabric draped loosely will look sloppy. Heavyweight cotton (240+ GSM) holds crisp geometric angles, creating structural architecture rather than drooping fabric.`,
    },
    {
      id: "art-2",
      title: "The Sneaker Harmonization Guide: Pairing High-Tops with Wide-Leg Pants",
      category: "Footwear & Accessories",
      author: "Elena Rostova",
      date: "Oct 6, 2026",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop&q=80",
      excerpt: "The eternal trouser hem dilemma solved: how wide should your leg opening be to break perfectly over retro basketball silhouettes?",
      content: `A flawless break between your trousers and your kicks can make or break an outfit. 

When styling retro high-tops, aim for a trouser hem circumference of at least 18-20 inches. This allows the cuff to cascade gently over the tongue without crumpling or swallowing the silhouette entirely. For low-top terrace sneakers, a slightly cropped hem showing 1 inch of rib-knit sock adds vintage depth.`,
    },
    {
      id: "art-3",
      title: "Caring for Heavyweight French Terry & Raw Fleece: The Zero-Pilling Routine",
      category: "Care & Longevity",
      author: "Julian Vance",
      date: "Sep 29, 2026",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
      excerpt: "Avoid ruined hoodies and worn-out cuffs with this simple cold-wash, air-dry routine designed by luxury textile scientists.",
      content: `French Terry is knitted with unbrushed interior loops that absorb moisture and insulate heat. The primary enemy of premium cotton fleece is intense tumble-dryer heat, which causes synthetic fiber breakage and surface pilling.

Always wash your luxury hoodies inside out on cold (30°C / 85°F). Never use fabric softeners, as silicone coatings weaken cotton fibers over time. Lay flat on a drying rack to keep the collar and cuffs pristine.`,
    },
    {
      id: "art-4",
      title: "5 Timeless Jackets Every Wardrobe Needs to Bridge Autumn to Winter",
      category: "Trend Forecast",
      author: "Sophie Laurent",
      date: "Sep 22, 2026",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
      excerpt: "From tailored chore coats to heavyweight wool overshirts, these transitional layers deliver endless pairing versatility.",
      content: `Transitional weather calls for functional outerwear that layers effortlessly over tees and under heavy overcoats.

Our top 5 investments this season:
1. The Heavy Wool Chore Coat
2. The Waxed Cotton Field Jacket
3. The Relaxed Double-Breasted Trench
4. The Quilted Liner Jacket with snap closures
5. The Vintage Suede Trucker`,
    },
    {
      id: "art-5",
      title: "The Art of Monochrome: Mixing Rib, Denim, and Suede for Visual Depth",
      category: "Style How-To",
      author: "Marcus Chen",
      date: "Sep 15, 2026",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80",
      excerpt: "Wearing all-black or all-cream does not have to be boring. Learn how texture friction transforms single-tone outfits into editorial statements.",
      content: `Monochromatic dressing fails only when every garment shares the exact same smooth surface texture. 

To create visual intrigue, employ texture friction: pair matte raw denim with a ribbed cotton tee, layered beneath a brushed wool overshirt, and finished with suede Chelsea boots. The light reflects differently on each material, providing nuanced dimension.`,
    },
    {
      id: "art-6",
      title: "Capsule Wardrobe Mistakes Most People Make (And How to Fix Them)",
      category: "Style How-To",
      author: "Elena Rostova",
      date: "Sep 08, 2026",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80",
      excerpt: "Why buying 10 plain white t-shirts isn't a capsule wardrobe, and how intentional variety in silhouettes creates true versatility.",
      content: `The biggest trap in minimalist styling is hyper-homogenization. A true capsule wardrobe doesn't require robotic monotony. 

Instead of five identical crew necks, curate one heavyweight boxy tee, one relaxed waffle long-sleeve, one lightweight mercerized cotton tee, and one knit polo. You retain a minimalist closet while drastically multiplying outfit permutations.`,
    },
  ];

  const categories = ["All", "Style How-To", "Footwear & Accessories", "Care & Longevity", "Trend Forecast"];

  const filteredArticles = articles.filter((art) => {
    if (selectedCategory !== "All" && art.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      return (
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="info-page">
      <div className="info-container">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog & How-To Guides" }]} />

        {/* Hero */}
        <section className="info-hero">
          <span className="info-hero__badge">
            <IoNewspaperOutline /> Editorial & How-To
          </span>
          <h1 className="info-hero__title">
            The SHOP.CO Style Journal & <br />
            Modern Wardrobe How-To.
          </h1>
          <p className="info-hero__subtitle">
            Your insider guide to silhouette architecture, seasonal lookbooks, garment care tutorials,
            and daily styling inspiration curated by our creative studio.
          </p>

          <div style={{ marginTop: "24px" }}>
            <div className="info-search-box">
              <IoSearchOutline size={20} color="#666" />
              <input
                type="text"
                placeholder="Search articles, guides, styling advice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Category Filter Tabs */}
        <section className="info-section">
          <div className="info-tabs-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`info-tab-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="info-grid-3">
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                className="info-card info-card--hover"
                style={{ padding: "0", overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                <div style={{ height: "200px", overflow: "hidden", position: "relative" }}>
                  <img
                    src={art.image}
                    alt={art.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "12px",
                      background: "rgba(0,0,0,0.75)",
                      backdropFilter: "blur(6px)",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      textTransform: "uppercase",
                    }}
                  >
                    {art.category}
                  </span>
                </div>

                <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "#888", marginBottom: "8px" }}>
                      <span>{art.date}</span>
                      <span>•</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <IoTimeOutline /> {art.readTime}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#111", marginBottom: "10px", lineHeight: "1.35" }}>
                      {art.title}
                    </h3>
                    <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.6", marginBottom: "18px" }}>
                      {art.excerpt}
                    </p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f0f0f0", paddingTop: "14px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#444" }}>By {art.author}</span>
                    <button
                      className="btn-solid-black"
                      style={{ padding: "8px 16px", fontSize: "13px" }}
                      onClick={() => setReadingArticle(art)}
                    >
                      Read Guide <IoArrowForwardOutline size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Article Reader Modal */}
        {readingArticle && (
          <div className="info-modal-backdrop" onClick={() => setReadingArticle(null)}>
            <div className="info-modal-card" style={{ maxWidth: "720px" }} onClick={(e) => e.stopPropagation()}>
              <button className="info-modal-close" onClick={() => setReadingArticle(null)}>
                <IoCloseOutline size={20} />
              </button>

              <span className="info-section-tag">{readingArticle.category}</span>
              <h1 style={{ fontSize: "26px", fontWeight: "900", margin: "6px 0 12px", lineHeight: "1.25" }}>
                {readingArticle.title}
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "13px", color: "#777", marginBottom: "20px" }}>
                <span>Written by <strong>{readingArticle.author}</strong></span>
                <span>•</span>
                <span>Published {readingArticle.date}</span>
                <span>•</span>
                <span>{readingArticle.readTime}</span>
              </div>

              <img
                src={readingArticle.image}
                alt={readingArticle.title}
                style={{ width: "100%", height: "260px", objectFit: "cover", borderRadius: "16px", marginBottom: "24px" }}
              />

              <div style={{ fontSize: "15px", color: "#333", lineHeight: "1.8", whiteSpace: "pre-line", marginBottom: "32px" }}>
                {readingArticle.content}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eee", paddingTop: "16px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="btn-outline" style={{ padding: "8px 14px" }}>
                    <IoBookmarkOutline size={16} /> Save Article
                  </button>
                  <button className="btn-outline" style={{ padding: "8px 14px" }}>
                    <IoShareSocialOutline size={16} /> Share
                  </button>
                </div>

                <button className="btn-solid-black" onClick={() => setReadingArticle(null)}>
                  Close Article
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
