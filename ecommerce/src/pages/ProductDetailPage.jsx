import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  IoCheckmark,
  IoCheckmarkCircle,
  IoChevronDown,
  IoChevronUp,
  IoClose,
  IoEllipsisHorizontal,
  IoStar,
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

const API_BASE = "http://localhost:5000/api";
const REVIEWS_PAGE_SIZE = 6;
const REVIEW_SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "rating-high", label: "Highest Rating" },
  { value: "rating-low", label: "Lowest Rating" },
];

const formatReviewDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [, setProductsVersion] = useState(0);
  const [productReviews, setProductReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [visibleReviewCount, setVisibleReviewCount] = useState(REVIEWS_PAGE_SIZE);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [reviewSort, setReviewSort] = useState("latest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFormError, setReviewFormError] = useState("");
  const [reviewNotice, setReviewNotice] = useState("");

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

  useEffect(() => {
    const controller = new AbortController();
    setProductReviews([]);
    setReviewsError("");
    setReviewsLoading(true);
    setVisibleReviewCount(REVIEWS_PAGE_SIZE);
    setRatingFilter("all");
    setReviewSort("latest");
    setIsFilterOpen(false);
    setIsSortOpen(false);
    setReviewNotice("");

    axios
      .get(`${API_BASE}/reviews/product/${id}`, { signal: controller.signal })
      .then((response) => {
        setProductReviews(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          setReviewsError(
            error.response?.data?.message || "Unable to load reviews for this product.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setReviewsLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  const product = getProductById(id);
  const related = getRelatedProducts(id, 4);
  const selectedSort = REVIEW_SORT_OPTIONS.find(
    (option) => option.value === reviewSort,
  );
  const displayedReviews = productReviews
    .filter(
      (review) =>
        ratingFilter === "all" || Number(review.rating) === Number(ratingFilter),
    )
    .sort((a, b) => {
      if (reviewSort === "rating-high") {
        return Number(b.rating) - Number(a.rating);
      }
      if (reviewSort === "rating-low") {
        return Number(a.rating) - Number(b.rating);
      }
      const timeA = new Date(a.created_at).getTime() || Number(a.id) || 0;
      const timeB = new Date(b.created_at).getTime() || Number(b.id) || 0;
      return reviewSort === "oldest" ? timeA - timeB : timeB - timeA;
    });

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

  const handleOpenReview = () => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { state: { returnUrl: location.pathname } });
      return;
    }
    setReviewFormError("");
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!reviewRating) {
      setReviewFormError("Please select a star rating.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { returnUrl: location.pathname } });
      return;
    }

    setReviewSubmitting(true);
    setReviewFormError("");
    try {
      await axios.post(
        `${API_BASE}/reviews`,
        {
          product_id: id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setIsReviewModalOpen(false);
      setReviewRating(0);
      setReviewComment("");
      setReviewNotice("Review submitted. It will appear after admin approval.");
    } catch (error) {
      setReviewFormError(
        error.response?.data?.message || "Unable to submit your review.",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : null;
  const categorySlug = product.category_slug || product.category || "all";
  const categoryName = product.category_name || product.category || "Category";
  const categoryLabel =
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  return (
    <>
      <div className="product-detail">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/category/all" },
            {
              label: categoryLabel,
              href: `/category/${categorySlug}`,
            },
            { label: product.name },
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
                    All Reviews{" "}
                    <span className="reviews-count">({productReviews.length})</span>
                  </h3>
                  <div className="reviews-header__actions">
                    <div className="reviews-control-wrap">
                      <button
                        className={`reviews-filter-btn${ratingFilter !== "all" ? " reviews-filter-btn--active" : ""}`}
                        aria-label="Filter reviews by rating"
                        aria-expanded={isFilterOpen}
                        onClick={() => {
                          setIsFilterOpen((open) => !open);
                          setIsSortOpen(false);
                        }}
                      >
                        <LuSlidersHorizontal size={18} />
                      </button>
                      {isFilterOpen && (
                        <div className="reviews-dropdown" role="menu">
                          {["all", 5, 4, 3, 2, 1].map((rating) => (
                            <button
                              key={rating}
                              className={`reviews-dropdown__item${ratingFilter === String(rating) ? " reviews-dropdown__item--selected" : ""}`}
                              role="menuitemradio"
                              aria-checked={ratingFilter === String(rating)}
                              onClick={() => {
                                setRatingFilter(String(rating));
                                setVisibleReviewCount(REVIEWS_PAGE_SIZE);
                                setIsFilterOpen(false);
                              }}
                            >
                              {rating === "all" ? "All ratings" : `${rating} stars`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="reviews-control-wrap">
                      <button
                        className="reviews-sort-btn"
                        aria-expanded={isSortOpen}
                        onClick={() => {
                          setIsSortOpen((open) => !open);
                          setIsFilterOpen(false);
                        }}
                      >
                        <span>{selectedSort?.label || "Latest"}</span>
                        <IoChevronDown size={16} />
                      </button>
                      {isSortOpen && (
                        <div className="reviews-dropdown" role="menu">
                          {REVIEW_SORT_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              className={`reviews-dropdown__item${reviewSort === option.value ? " reviews-dropdown__item--selected" : ""}`}
                              role="menuitemradio"
                              aria-checked={reviewSort === option.value}
                              onClick={() => {
                                setReviewSort(option.value);
                                setIsSortOpen(false);
                              }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      className="reviews-write-btn"
                      onClick={handleOpenReview}
                    >
                      Write a Review
                    </button>
                  </div>
                </div>
                {reviewNotice && (
                  <p className="review-submit-notice" role="status">
                    {reviewNotice}
                  </p>
                )}
                <div className="reviews-grid">
                  {reviewsLoading ? (
                    <p className="reviews-empty">Loading reviews...</p>
                  ) : reviewsError ? (
                    <p className="reviews-empty reviews-empty--error">
                      {reviewsError}
                    </p>
                  ) : productReviews.length === 0 ? (
                    <p className="reviews-empty">
                      No approved reviews for this product yet.
                    </p>
                  ) : displayedReviews.length === 0 ? (
                    <p className="reviews-empty">
                      No reviews match this rating filter.
                    </p>
                  ) : (
                    displayedReviews.slice(0, visibleReviewCount).map((review) => (
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
                          <span className="review-card__name">
                            {review.user_name || "Customer"}
                          </span>
                          {review.order_id && (
                            <span className="review-card__verified">
                              <IoCheckmarkCircle size={18} />
                            </span>
                          )}
                        </div>
                        <p className="review-card__text">"{review.comment}"</p>
                        <p className="review-card__date">
                          Posted on {formatReviewDate(review.created_at)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                {!reviewsLoading &&
                  !reviewsError &&
                  visibleReviewCount < displayedReviews.length && (
                    <div className="reviews-load-more">
                      <button
                        className="reviews-load-more-btn"
                        onClick={() =>
                          setVisibleReviewCount((count) => count + REVIEWS_PAGE_SIZE)
                        }
                      >
                        Load More Reviews
                      </button>
                    </div>
                  )}
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

      {isReviewModalOpen && (
        <div
          className="review-modal-overlay"
          onClick={() => setIsReviewModalOpen(false)}
        >
          <div
            className="review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="review-modal__header">
              <h2 id="review-modal-title">Write a Review</h2>
              <button
                type="button"
                className="review-modal__close"
                aria-label="Close review form"
                onClick={() => setIsReviewModalOpen(false)}
              >
                <IoClose size={22} />
              </button>
            </div>
            <p className="review-modal__product">{product.name}</p>
            <form onSubmit={handleSubmitReview}>
              <fieldset className="review-form__rating">
                <legend>Your rating</legend>
                <div className="review-form__stars">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className={`review-form__star${rating <= reviewRating ? " review-form__star--selected" : ""}`}
                      aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
                      aria-pressed={reviewRating === rating}
                      onClick={() => setReviewRating(rating)}
                    >
                      <IoStar size={26} />
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="review-form__label" htmlFor="review-comment">
                Your review
              </label>
              <textarea
                id="review-comment"
                className="review-form__comment"
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                maxLength={2000}
                placeholder="Share your experience with this product"
              />
              {reviewFormError && (
                <p className="review-form__error" role="alert">
                  {reviewFormError}
                </p>
              )}
              <button
                type="submit"
                className="reviews-write-btn review-form__submit"
                disabled={reviewSubmitting}
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      )}

      <NewsletterBanner />
    </>
  );
}
