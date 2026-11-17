import React, { useState } from "react";
import {
  IoLogoYoutube,
  IoPlayCircleOutline,
  IoHeartOutline,
  IoHeart,
  IoShareSocialOutline,
} from "react-icons/io5";
import Breadcrumb from "../../components/ui/Breadcrumb";
import "./InfoPages.css";

export default function YoutubePlaylistPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeVideo, setActiveVideo] = useState({
    id: "v1",
    title: "SHOP.CO Spring/Summer 2026 Collection Runway & Lookbook",
    duration: "14:20",
    views: "248K views",
    date: "1 week ago",
    embedId: "2g811Eo7K8U",
    desc: "Experience the official runway debut of our Spring/Summer 2026 collection in Paris. Featuring fluid draping, sustainable organic linen, and tailored streetwear silhouettes.",
    thumbnail: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80",
  });

  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const playlistVideos = [
    {
      id: "v1",
      title: "SHOP.CO Spring/Summer 2026 Collection Runway & Lookbook",
      duration: "14:20",
      views: "248K views",
      date: "1 week ago",
      embedId: "2g811Eo7K8U",
      desc: "Experience the official runway debut of our Spring/Summer 2026 collection in Paris. Featuring fluid draping, sustainable organic linen, and tailored streetwear silhouettes.",
      thumbnail: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "v2",
      title: "Inside The Atelier: How We Craft Our 280 GSM Heavyweight Tees",
      duration: "09:45",
      views: "182K views",
      date: "3 weeks ago",
      embedId: "q6h3tI7mPZ4",
      desc: "Step inside our spinning mills and sewing studios in Portugal. See why our fabric feels indestructible yet impossibly soft against the skin.",
      thumbnail: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "v3",
      title: "1 Garment, 5 Completely Different Looks (Styling Masterclass)",
      duration: "12:10",
      views: "310K views",
      date: "1 month ago",
      embedId: "5qap5aO4i9A",
      desc: "Our creative director takes our classic relaxed chore jacket and styles it for the office, date night, airport travel, and casual weekend errands.",
      thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "v4",
      title: "The Ultimate Denim Guide: Raw Selvedge vs Vintage Washed",
      duration: "16:05",
      views: "145K views",
      date: "1 month ago",
      embedId: "bOhyQpL_6xI",
      desc: "Everything you need to know about Japanese shuttle looms, breaking in rigid raw denim, and caring for washed indigo jeans.",
      thumbnail: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: "v5",
      title: "Capsule Wardrobe Essentials for Men & Women (2026 Edition)",
      duration: "18:30",
      views: "420K views",
      date: "2 months ago",
      embedId: "rC_J-zW32sA",
      desc: "Eliminate closet clutter once and for all. 10 essential pieces that mix and match into limitless high-aesthetic outfits.",
      thumbnail: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80",
    },
  ];

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  return (
    <div className="info-page">
      <div className="info-container">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "YouTube Playlists" }]} />

        {/* Hero */}
        <section className="info-hero">
          <span className="info-hero__badge" style={{ background: "rgba(239, 68, 68, 0.2)", borderColor: "rgba(239, 68, 68, 0.4)", color: "#fca5a5" }}>
            <IoLogoYoutube /> Official Video Studio
          </span>
          <h1 className="info-hero__title">
            SHOP.CO Studios & <br />
            Curated Style Playlists.
          </h1>
          <p className="info-hero__subtitle">
            Watch seasonal runway showcases, garment construction documentaries, styling tutorials,
            and creator hauls directly from our YouTube channel.
          </p>
        </section>

        {/* Main Video Theater & Playlist Grid */}
        <section className="info-section">
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "28px", alignItems: "start" }}>
            {/* Left: Active Video Stage */}
            <div className="info-card" style={{ padding: "0", overflow: "hidden" }}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  background: "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isPlaying ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${activeVideo.embedId}?autoplay=1&rel=0&modestbranding=1`}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    onClick={() => setIsPlaying(true)}
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundImage: `url(${activeVideo.thumbnail})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
                    <div
                      style={{
                        position: "relative",
                        zIndex: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <button
                        type="button"
                        aria-label="Play Video"
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          background: "#ef4444",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 10px 32px rgba(239,68,68,0.6)",
                          transition: "transform 0.2s ease",
                          cursor: "pointer",
                          border: "none",
                        }}
                      >
                        <IoPlayCircleOutline size={52} color="#fff" />
                      </button>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#ffffff",
                          background: "rgba(0,0,0,0.75)",
                          backdropFilter: "blur(6px)",
                          padding: "6px 16px",
                          borderRadius: "999px",
                          border: "1px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        Click to Play Video ({activeVideo.duration})
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Meta & Actions */}
              <div style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#111", marginBottom: "6px" }}>
                      {activeVideo.title}
                    </h2>
                    <div style={{ fontSize: "13px", color: "#777", display: "flex", gap: "12px", alignItems: "center" }}>
                      <span>{activeVideo.views}</span>
                      <span>•</span>
                      <span>{activeVideo.date}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                      className="btn-outline"
                      style={{ padding: "8px 14px", color: liked ? "#ef4444" : "#111" }}
                      onClick={() => setLiked(!liked)}
                    >
                      {liked ? <IoHeart size={18} /> : <IoHeartOutline size={18} />} {liked ? "Liked" : "Like"}
                    </button>
                    <button className="btn-outline" style={{ padding: "8px 14px" }} onClick={handleShare}>
                      <IoShareSocialOutline size={18} /> Share
                    </button>
                    <button
                      className="btn-solid-black"
                      style={{ padding: "8px 16px", background: subscribed ? "#333" : "#ef4444", borderColor: subscribed ? "#333" : "#ef4444" }}
                      onClick={() => setSubscribed(!subscribed)}
                    >
                      <IoLogoYoutube size={16} /> {subscribed ? "Subscribed ✓" : "Subscribe"}
                    </button>
                  </div>
                </div>

                {shareToast && (
                  <div style={{ fontSize: "12px", color: "#15803d", fontWeight: "700", marginBottom: "12px" }}>
                    ✓ Video link copied to clipboard!
                  </div>
                )}

                <p style={{ fontSize: "14px", color: "#555", lineHeight: "1.6" }}>
                  {activeVideo.desc}
                </p>
              </div>
            </div>

            {/* Right: Playlist Queue */}
            <div className="info-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800" }}>Featured Episodes</h3>
                <span style={{ fontSize: "12px", color: "#888", fontWeight: "600" }}>{playlistVideos.length} videos</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {playlistVideos.map((vid) => {
                  const isActive = activeVideo.id === vid.id;
                  return (
                    <div
                      key={vid.id}
                      onClick={() => {
                        setActiveVideo(vid);
                        setIsPlaying(true);
                        window.scrollTo({ top: 300, behavior: "smooth" });
                      }}
                      style={{
                        display: "flex",
                        gap: "12px",
                        padding: "10px",
                        borderRadius: "12px",
                        background: isActive ? "#f0f0f0" : "transparent",
                        cursor: "pointer",
                        border: isActive ? "1px solid #ddd" : "1px solid transparent",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          width: "110px",
                          height: "70px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          flexShrink: 0,
                          position: "relative",
                          background: "#000",
                        }}
                      >
                        <img src={vid.thumbnail} alt={vid.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <span
                          style={{
                            position: "absolute",
                            bottom: "4px",
                            right: "4px",
                            background: "rgba(0,0,0,0.8)",
                            color: "#fff",
                            fontSize: "10px",
                            fontWeight: "700",
                            padding: "1px 5px",
                            borderRadius: "4px",
                          }}
                        >
                          {vid.duration}
                        </span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            lineHeight: "1.3",
                            margin: "0 0 4px",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            color: isActive ? "#000000" : "#333333",
                          }}
                        >
                          {vid.title}
                        </h4>
                        <div style={{ fontSize: "11px", color: "#888" }}>
                          {vid.views} • {vid.date}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
