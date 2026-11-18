import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";
import { IoCheckmarkCircle } from "react-icons/io5";
import ProductCard from "../components/ui/ProductCard";
import StarRating from "../components/ui/StarRating";
import NewsletterBanner from "../components/layout/NewsletterBanner";
import { getNewArrivals, getTopSelling } from "../data/products";
import { fetchDbProducts } from "../services/productService";
import { SiGooglegemini } from "react-icons/si";
import coverPageImg from "../assets/cover page.png";
import casualImg from "../assets/BDS/p1.jpg";
import formalImg from "../assets/BDS/p2.jpg";
import partyImg from "../assets/BDS/p3.jpg";
import gymImg from "../assets/BDS/p4.jpg";
import "./Home.css";

const stats = [
  { value: "200+", label: "International Brands" },
  { value: "2,000+", label: "High-Quality Products" },
  { value: "30,000+", label: "Happy Customers" },
];
const dressStyles = [
  {
    label: "Casual",
    slug: "casual",
    image: casualImg,
  },
  {
    label: "Formal",
    slug: "formal",
    image: formalImg,
  },
  {
    label: "Party",
    slug: "party",
    image: partyImg,
  },
  {
    label: "Gym",
    slug: "gym",
    image: gymImg,
  },
];

export default function Home() {
  const [showAllNewArrivals, setShowAllNewArrivals] = useState(false);
  const [showAllTopSelling, setShowAllTopSelling] = useState(false);
  const [, setProductsVersion] = useState(0);

  // DB reviews state
  const [dbReviews, setDbReviews] = useState([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    fetchDbProducts().catch(() => {});
    const handleUpdate = () => setProductsVersion((v) => v + 1);
    window.addEventListener("products_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("products_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Fetch approved reviews from DB
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/reviews?status=approved")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setDbReviews(
          data.map((r) => ({
            id: r.id,
            name: r.user_name || "Customer",
            rating: Number(r.rating) || 5,
            comment: r.comment || "",
            date: r.created_at
              ? new Date(r.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "",
            verified: true,
          }))
        );
      })
      .catch(() => {});
  }, []);

  const testimonials = dbReviews.length > 0 ? dbReviews : [];
  const totalTestimonials = testimonials.length;

  const allNewArrivals = getNewArrivals(true);
  const allTopSelling = getTopSelling(true);
  const newArrivals = showAllNewArrivals ? allNewArrivals : allNewArrivals.slice(0, 4);
  const topSelling = showAllTopSelling ? allTopSelling : allTopSelling.slice(0, 4);

  // Marquee: dynamically clone the single brand set to fill any screen size
  const brandsTrackRef = useRef(null);
  useEffect(() => {
    const track = brandsTrackRef.current;
    if (!track) return;
    const originalSet = track.firstElementChild;
    if (!originalSet) return;

    const fill = () => {
      track
        .querySelectorAll('[aria-hidden="true"]')
        .forEach((el) => el.remove());
      const setWidth = originalSet.offsetWidth;
      if (!setWidth) return;
      const copies = Math.ceil((window.innerWidth * 2) / setWidth) + 2;
      for (let i = 0; i < copies; i++) {
        const clone = originalSet.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      }
      track.style.setProperty("--marquee-width", `${setWidth}px`);
    };

    fill();
    window.addEventListener("resize", fill);
    return () => window.removeEventListener("resize", fill);
  }, []);

  const handlePrevTestimonial = () => {
    setActiveTestimonial(
      (prev) => (prev - 1 + totalTestimonials) % totalTestimonials
    );
  };

  const handleNextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % totalTestimonials);
  };

  // visible cards: show up to 3 centered cards + 2 blurred peek cards
  const getCard = (offset) =>
    totalTestimonials > 0
      ? testimonials[(activeTestimonial + offset + totalTestimonials * 10) % totalTestimonials]
      : null;

  return (
    <>
      <section className="hero">
        <div className="hero__inner">
          <div className="hero__text">
            <h1 className="hero__title">
              Find Clothes
              <br />
              That Matches
              <br />
              Your Style
            </h1>
            <p className="hero__desc">
              Browse through our diverse range of meticulously crafted garments,
              designed to bring out your individuality and cater to your sense
              of style.
            </p>
            <Link to="/category/casual" className="btn-primary hero__cta">
              Shop Now
            </Link>
            <div className="hero__stats">
              {stats.map((s, i) => (
                <div key={i} className="hero__stat-item">
                  <p className="hero__stat-value">{s.value}</p>
                  <p className="hero__stat-label">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hero__image">
            <div className="hero__image-frame">
              <img src={coverPageImg} alt="Fashion models" />
            </div>

            <SiGooglegemini className="hero__gemini hero__gemini--top-right" />
            <SiGooglegemini className="hero__gemini hero__gemini--mid-left" />
          </div>
        </div>
      </section>

      <section className="brands-strip">
        <div className="brands-strip__track" ref={brandsTrackRef}>
          {/* Single source set — JS clones it to fill any screen */}
          <div className="brands-strip__inner">
            <span className="brand-item brand-item--versace">VERSACE</span>
            <span className="brand-item brand-item--zara" aria-label="ZARA">
              <svg viewBox="0 6.8 24 10" fill="currentColor">
                <path d="M8.562 7l.002.006 2.794 7.621v-7.23h-1.15v-.07h3.96c1.903 0 3.231.976 3.231 2.375 0 1.02-.91 1.868-2.263 2.109l-.249.031.25.026c.821.094 1.473.346 1.935.75l.003.003L19.141 7h.07l.002.006 3.556 9.698H24v.07h-3.918v-.07h1.154l-1.17-3.189h-2.373v.002l.013.037c.094.281.142.576.139.873v1.196c0 .615.271 1.238.79 1.238.304 0 .547-.107.837-.372l.041.038c-.314.332-.695.473-1.266.473-.43 0-.8-.104-1.096-.308l-.056-.04c-.39-.296-.644-.778-.753-1.435l-.018-.106-.018-.16-.002-.028-.654 1.78h.928v.07h-1.942v-.07h.938l.718-1.954v-.005a6.35 6.35 0 01-.013-.346v-.854c0-1.049-.78-1.65-2.14-1.65h-1.337v4.81h1.158v.07H9.433v-.07h1.154l-1.17-3.189H6.172l-1.158 3.154.048-.008c1.521-.262 2.22-1.423 2.23-2.645h.07v2.758H0l5.465-9.377H3.268c-1.822 0-2.646 1.407-2.659 2.81H.54v-2.88h6.634l-.04.07-5.425 9.307h2.854c.071 0 .141-.003.212-.009l.072-.006.09-.01L8.491 7h.07zm9.883 2.095l-1.313 3.576.007.007.067.066.452.684.007.017h2.375l-1.595-4.35zm-10.648 0l-1.599 4.35h3.194l-1.595-4.35zm6.026-1.698h-1.02v4.427h1.336c1.353 0 1.767-.493 1.767-2.107 0-1.517-.72-2.32-2.083-2.32z" />
              </svg>
            </span>
            <span className="brand-item brand-item--gucci">GUCCI</span>
            <span className="brand-item brand-item--prada">PRADA</span>
            <span className="brand-item brand-item--calvin">Calvin Klein</span>
          </div>
        </div>
      </section>

      <section className="products-section">
        <div className="products-section__header">
          <h2 className="section-title">New Arrivals</h2>
        </div>
        {newArrivals.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b", margin: "36px 0", fontSize: "14px" }}>
            No new arrivals yet. Add products from the Admin panel to show them here.
          </p>
        ) : (
          <>
            <div className="products-grid">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {allNewArrivals.length > 4 && (
              <div className="products-section__cta">
                <button
                  type="button"
                  onClick={() => setShowAllNewArrivals((prev) => !prev)}
                  className="btn-secondary"
                  id="show-more-new-arrivals-btn"
                  aria-expanded={showAllNewArrivals}
                >
                  {showAllNewArrivals ? "Show less" : "Show more"}
                </button>
              </div>
            )}
          </>
        )}
      </section>
      <div className="section-divider">
        <hr />
      </div>
      <section className="products-section">
        <div className="products-section__header">
          <h2 className="section-title">Top Selling</h2>
        </div>
        {topSelling.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b", margin: "36px 0", fontSize: "14px" }}>
            No top selling products yet.
          </p>
        ) : (
          <>
            <div className="products-grid">
              {topSelling.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {allTopSelling.length > 4 && (
              <div className="products-section__cta">
                <button
                  type="button"
                  onClick={() => setShowAllTopSelling((prev) => !prev)}
                  className="btn-secondary"
                  id="show-more-top-selling-btn"
                  aria-expanded={showAllTopSelling}
                >
                  {showAllTopSelling ? "Show less" : "Show more"}
                </button>
              </div>
            )}
          </>
        )}
      </section>
      <section className="dress-styles">
        <h2 className="section-title dress-styles__title">
          Browse by Dress Style
        </h2>
        <div className="dress-styles__container">
          <div className="dress-styles__grid">
            {dressStyles.map((style) => (
              <Link
                key={style.slug}
                to={`/category/${style.slug}`}
                className="dress-style-card"
              >
                <img
                  src={style.image}
                  alt={style.label}
                  className="dress-style-card__img"
                />
                <span className="dress-style-card__label">{style.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="testimonials__header">
          <h2 className="section-title">Our Happy Customers</h2>
          {totalTestimonials > 1 && (
            <div className="testimonials__nav">
              <button
                onClick={handlePrevTestimonial}
                className="testimonials__nav-btn"
                aria-label="Previous"
              >
                <GoArrowLeft size={24} />
              </button>
              <button
                onClick={handleNextTestimonial}
                className="testimonials__nav-btn"
                aria-label="Next"
              >
                <GoArrowRight size={24} />
              </button>
            </div>
          )}
        </div>

        {totalTestimonials === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b", margin: "36px 0", fontSize: "14px" }}>
            No reviews yet. Be the first to leave a review!
          </p>
        ) : (
          <div className="testimonials__carousel">
            <div className="testimonials__track">
              {/* Blurred peek left */}
              {totalTestimonials > 3 && getCard(-1) && (
                <div className="testimonial-card testimonial-card--blurred testimonial-card--peek">
                  <StarRating rating={getCard(-1).rating} size="sm" />
                  <div className="testimonial-card__author">
                    <span className="testimonial-card__name">{getCard(-1).name}</span>
                    {getCard(-1).verified && (
                      <span className="testimonial-card__verified">
                        <IoCheckmarkCircle size={16} />
                      </span>
                    )}
                  </div>
                  <p className="testimonial-card__text">"{getCard(-1).comment}"</p>
                </div>
              )}

              {/* Card 1 */}
              {getCard(0) && (
                <div className="testimonial-card">
                  <StarRating rating={getCard(0).rating} size="sm" />
                  <div className="testimonial-card__author">
                    <span className="testimonial-card__name">{getCard(0).name}</span>
                    {getCard(0).verified && (
                      <span className="testimonial-card__verified">
                        <IoCheckmarkCircle size={16} />
                      </span>
                    )}
                  </div>
                  <p className="testimonial-card__text">"{getCard(0).comment}"</p>
                </div>
              )}

              {/* Card 2 */}
              {totalTestimonials > 1 && getCard(1) && (
                <div className="testimonial-card testimonial-card--hide-mobile">
                  <StarRating rating={getCard(1).rating} size="sm" />
                  <div className="testimonial-card__author">
                    <span className="testimonial-card__name">{getCard(1).name}</span>
                    {getCard(1).verified && (
                      <span className="testimonial-card__verified">
                        <IoCheckmarkCircle size={16} />
                      </span>
                    )}
                  </div>
                  <p className="testimonial-card__text">"{getCard(1).comment}"</p>
                </div>
              )}

              {/* Card 3 */}
              {totalTestimonials > 2 && getCard(2) && (
                <div className="testimonial-card testimonial-card--hide-tablet">
                  <StarRating rating={getCard(2).rating} size="sm" />
                  <div className="testimonial-card__author">
                    <span className="testimonial-card__name">{getCard(2).name}</span>
                    {getCard(2).verified && (
                      <span className="testimonial-card__verified">
                        <IoCheckmarkCircle size={16} />
                      </span>
                    )}
                  </div>
                  <p className="testimonial-card__text">"{getCard(2).comment}"</p>
                </div>
              )}

              {/* Blurred peek right */}
              {totalTestimonials > 3 && getCard(3) && (
                <div className="testimonial-card testimonial-card--blurred testimonial-card--peek">
                  <StarRating rating={getCard(3).rating} size="sm" />
                  <div className="testimonial-card__author">
                    <span className="testimonial-card__name">{getCard(3).name}</span>
                    {getCard(3).verified && (
                      <span className="testimonial-card__verified">
                        <IoCheckmarkCircle size={16} />
                      </span>
                    )}
                  </div>
                  <p className="testimonial-card__text">"{getCard(3).comment}"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <NewsletterBanner />
    </>
  );
}
