import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  IoCheckmark,
  IoCheckmarkCircle,
  IoChevronDown,
  IoChevronUp,
  IoEllipsisHorizontal,
} from "react-icons/io5";
import { LuSlidersHorizontal } from "react-icons/lu";
import Breadcrumb from "../components/ui/Breadcrumb";
import StarRating from "../components/ui/StarRating";
import QuantityStepper from "../components/ui/QuantityStepper";
import ProductCard from "../components/ui/ProductCard";
import NewsletterBanner from "../components/layout/NewsletterBanner";
import { getProductById, getRelatedProducts } from "../data/products";
import { fetchDbProducts } from "../services/productService";
import { useCart } from "../context/CartContext";
import "./ProductDetailPage.css";

const TABS = ["Product Details", "Rating & Reviews", "FAQs"];

const FAQS = [
  {
    q: "What material is this product made from?",
    a: "Our products are crafted from 100% premium cotton or a premium cotton blend, depending on the style. Each product page specifies the exact fabric composition.",
  },
  {
    q: "How do I care for this item?",
    a: "We recommend machine washing in cold water on a gentle cycle. Tumble dry on low heat or hang to dry. Do not bleach. Iron on low if needed.",
  },
  {
    q: "What is your return policy?",
    a: "We offer a 30-day hassle-free return policy. Items must be unworn, unwashed, and in original packaging with tags attached.",
  },
  {
    q: "How long does shipping take?",
    a: "Standard shipping takes 5-7 business days. Expedited shipping (2-3 business days) is available for an additional fee.",
  },
];

const mock_reviews = [
  {
    id: 1,
    name: "Samantha D.",
    verified: true,
    rating: 5,
    comment:
      "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite go-to shirt.",
    date: "August 14, 2023",
  },
  {
    id: 2,
    name: "Alex M.",
    verified: true,
    rating: 4,
    comment:
      "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I'm quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me.",
    date: "August 15, 2023",
  },
  {
    id: 3,
    name: "Ethan R.",
    verified: true,
    rating: 3.5,
    comment:
      "This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect. I can see the designer's touch in every aspect of this shirt.",
    date: "August 16, 2023",
  },
  {
    id: 4,
    name: "Olivia P.",
    verified: true,
    rating: 4,
    comment:
      "As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents those principles but also feels great to wear. It's evident that the designer poured their creativity into making this t-shirt stand out.",
    date: "August 17, 2023",
  },
  {
    id: 5,
    name: "Liam K.",
    verified: true,
    rating: 4,
    comment:
      "This t-shirt is a fusion of comfort and creativity. The fabric is soft, and the design speaks volumes about the designer's skill. It's like wearing a piece of art that reflects my passion for both design and fashion.",
    date: "August 18, 2023",
  },
  {
    id: 6,
    name: "Ava H.",
    verified: true,
    rating: 4.5,
    comment:
      "I'm not just wearing a t-shirt; I'm wearing a piece of design philosophy. The intricate details and thoughtful layout of the design make this shirt a conversation starter.",
    date: "August 19, 2023",
  },
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [productsVersion, setProductsVersion] = useState(0);

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

  const product = getProductById(id);
  const related = getRelatedProducts(id, 4);

  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const lastInitializedIdRef = useRef(null);
  const isAddingRef = useRef(false);

  useEffect(() => {
    if (product && lastInitializedIdRef.current !== String(id)) {
      lastInitializedIdRef.current = String(id);
      setActiveImg(0);
      setSelectedColor(null);
      setSelectedSize(null);
      window.scrollTo(0, 0);
    }
  }, [id, product]);

  if (!product) {
    return (
      <div className="product-not-found">
        <h1>Product Not Found</h1>
        <Link to="/" className="btn-primary">
          Go Home
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (addedToCart || isAddingRef.current) return; // prevent double-add
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("Please select a size.");
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert("Please select a color.");
      return;
    }
    isAddingRef.current = true;
    setAddedToCart(true);
    const chosenSize = selectedSize || (product.sizes && product.sizes[0]) || "Standard";
    const chosenColor = selectedColor || (product.colors && product.colors[0]) || "Default";
    const chosenQty = Math.min(99, Math.max(1, Number(quantity) || 1));
    addToCart(product, chosenSize, chosenColor, chosenQty);
    setTimeout(() => {
      isAddingRef.current = false;
    }, 1000);
  };

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : null;

  return (
    <>
      <div className="product-detail">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/category/casual" },
            { label: "Men", href: "/category/casual" },
            { label: "T-shirts" },
          ]}
        />
        <div className="product-detail__hero">
          <div className="product-gallery">
            <div className="product-gallery__thumbs">
              {(product.images || []).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`product-gallery__thumb${activeImg === i ? " product-gallery__thumb--active" : ""}`}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
            </div>

            <div className="product-gallery__main">
              <img
                src={product.images?.[activeImg] || product.images?.[0] || ""}
                alt={product.name}
              />
            </div>
          </div>
          <div className="product-info">
            <h1 className="product-info__title">{product.name}</h1>

            <div className="product-info__rating">
              <StarRating rating={Number(product.rating) || 0} size="md" />
              <span className="product-info__rating-text">
                {(Number(product.rating) || 0).toFixed(1)}/5
              </span>
            </div>

            <div className="product-info__price">
              <span className="product-info__price-current">
                ${product.price}
              </span>
              {product.originalPrice && (
                <>
                  <span className="product-info__price-original">
                    ${product.originalPrice}
                  </span>
                  <span className="product-info__price-badge">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            <p className="product-info__desc">{product.description}</p>

            {product.colors && product.colors.length > 0 && (
              <div className="product-info__section">
                <p className="product-info__label">Select Colors</p>
                <div className="product-info__colors">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setAddedToCart(false);
                      }}
                      className={`product-info__color-btn${selectedColor === color ? " product-info__color-btn--selected" : ""}${color === "#FFFFFF" ? " product-info__color-btn--white" : ""}`}
                      style={{ backgroundColor: color }}
                      aria-label={`Color ${color}`}
                      aria-pressed={selectedColor === color}
                    >
                      {selectedColor === color && (
                        <IoCheckmark
                          size={18}
                          color={color === "#FFFFFF" ? "#000000" : "#ffffff"}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="product-info__section">
                <p className="product-info__label">Choose Size</p>
                <div className="product-info__sizes">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize((prev) => (prev === size ? null : size));
                          setAddedToCart(false);
                        }}
                        className={`product-info__size-btn${isSelected ? " product-info__size-btn--selected" : ""}`}
                        aria-pressed={isSelected}
                      >
                        <span>{size}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="product-info__actions">
              <QuantityStepper
                quantity={quantity}
                onChange={setQuantity}
                min={1}
              />
              {addedToCart ? (
                <Link to="/cart" className="product-info__goto-btn">
                  Go to Cart
                </Link>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="product-info__add-btn"
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="product-tabs">
          <div className="product-tabs__nav">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`product-tabs__tab${activeTab === i ? " product-tabs__tab--active" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="product-tabs__content">
            {activeTab === 0 && (
              <div className="product-details-tab">
                <p>{product.description}</p>
                <ul>
                  <li>100% Premium Cotton</li>
                  <li>Machine washable at 30°C</li>
                  <li>Available in multiple colors and sizes</li>
                  <li>
                    Relaxed fit — we recommend sizing up for an oversized look
                  </li>
                  <li>Sustainably sourced materials</li>
                </ul>
              </div>
            )}

            {activeTab === 1 && (
              <div>
                <div className="reviews-header">
                  <h3 className="reviews-title">
                    All Reviews <span className="reviews-count">(451)</span>
                  </h3>
                  <div className="reviews-header__actions">
                    <button
                      className="reviews-filter-btn"
                      aria-label="Filter reviews"
                    >
                      <LuSlidersHorizontal size={18} />
                    </button>
                    <div className="reviews-sort-btn">
                      <span>Latest</span>
                      <IoChevronDown size={16} />
                    </div>
                    <button className="reviews-write-btn">
                      Write a Review
                    </button>
                  </div>
                </div>
                <div className="reviews-grid">
                  {mock_reviews.map((review) => (
                    <div key={review.id} className="review-card">
                      <div className="review-card__header">
                        <StarRating rating={review.rating} size="sm" />
                        <button
                          className="review-card__more-btn"
                          aria-label="Review options"
                        >
                          <IoEllipsisHorizontal size={20} />
                        </button>
                      </div>
                      <div className="review-card__author">
                        <span className="review-card__name">{review.name}</span>
                        {review.verified && (
                          <span className="review-card__verified">
                            <IoCheckmarkCircle size={18} />
                          </span>
                        )}
                      </div>
                      <p className="review-card__text">"{review.comment}"</p>
                      <p className="review-card__date">
                        Posted on {review.date}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="reviews-load-more">
                  <button className="reviews-load-more-btn">
                    Load More Reviews
                  </button>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="faq-list">
                {FAQS.map((faq, i) => (
                  <div key={i} className="faq-item">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="faq-item__toggle"
                    >
                      {faq.q}
                      <span className="faq-item__icon">
                        {openFaq === i ? (
                          <IoChevronUp size={16} />
                        ) : (
                          <IoChevronDown size={16} />
                        )}
                      </span>
                    </button>
                    {openFaq === i && (
                      <div className="faq-item__answer">{faq.a}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <section className="related-products">
          <h2 className="section-title related-products__title">
            You Might Also Like
          </h2>
          <div className="related-products__grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>

      <NewsletterBanner />
    </>
  );
}
