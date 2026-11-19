import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiTruck } from "react-icons/fi";
import {
  IoBagCheckOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoReceiptOutline,
  IoCloseOutline,
  IoPrintOutline,
  IoPersonOutline,
  IoSettingsOutline,
  IoAddCircleOutline,
  IoLogOutOutline,
  IoPencilOutline,
  IoStar,
  IoStarOutline,
} from "react-icons/io5";
import { clearSession } from "../../services/authService";
import Breadcrumb from "../../components/ui/Breadcrumb";
import "../ProfilePage.css";
import "./InfoPages.css";

const STATUS_OPTIONS = ["On the way", "Delivered", "Cancelled", "Returned"];

const TIME_OPTIONS = [
  { label: "Any time", value: "all" },
  { label: "Last 30 days", value: "last30" },
  { label: "2024", value: "2024" },
  { label: "2023", value: "2023" },
  { label: "Older", value: "older" },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  const [avatarPhoto, setAvatarPhoto] = useState(
    () => localStorage.getItem("profile_avatar") || ""
  );
  const avatarInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPhoto(ev.target.result);
      localStorage.setItem("profile_avatar", ev.target.result);
      window.dispatchEvent(new Event("profile_avatar_updated"));
    };
    reader.readAsDataURL(file);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleLogout = () => {
    clearSession("logout");
    navigate("/login");
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedTime, setSelectedTime] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewVideo, setReviewVideo] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewToast, setReviewToast] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [userReviews, setUserReviews] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user_product_reviews") || "{}");
    } catch {
      return {};
    }
  });

  const RATING_LABELS = {
    0: "Select a rating",
    1: "1 - Poor",
    2: "2 - Fair",
    3: "3 - Good",
    4: "4 - Very Good",
    5: "5 - Excellent!",
  };

  const openReviewModal = (item, order) => {
    if (!item) return;
    const key = item.productId || item.name;
    const existing = userReviews[key];
    setReviewItem({
      ...item,
      orderNumber: order?.id || order?.orderNumber || "Order",
      orderDate: order?.date || "",
    });
    setReviewRating(existing ? existing.rating : 0);
    setHoverRating(0);
    setReviewComment(existing ? existing.comment : "");
    setReviewImages([]);
    setReviewVideo(null);
    setReviewError("");
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setReviewItem(null);
    setReviewComment("");
    setReviewImages([]);
    setReviewVideo(null);
    setReviewError("");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewItem) return;
    if (!reviewRating || reviewRating < 1) {
      setReviewError("Please choose a star rating (1 to 5).");
      return;
    }
    if (!reviewItem.productId) {
      setReviewError("This order is not linked to a product, so it cannot be reviewed.");
      return;
    }

    setIsSubmittingReview(true);
    setReviewError("");
    const key = reviewItem.productId;
    const payload = new FormData();
    payload.append("product_id", reviewItem.productId);
    if (reviewItem.orderId) payload.append("order_id", reviewItem.orderId);
    payload.append("rating", String(Number(reviewRating)));
    payload.append("comment", reviewComment.trim());
    reviewImages.forEach((file) => payload.append("reviewImages", file));
    if (reviewVideo) payload.append("reviewVideo", reviewVideo);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please sign in to submit a review.");
      const response = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || "Unable to submit your review.");
      }

      const updated = {
        ...userReviews,
        [key]: {
          rating: Number(reviewRating),
          comment: reviewComment.trim(),
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        },
      };
      setUserReviews(updated);
      localStorage.setItem("user_product_reviews", JSON.stringify(updated));

      setReviewToast(`Review for "${reviewItem.name}" submitted successfully!`);
      setTimeout(() => setReviewToast(""), 4500);
      closeReviewModal();
    } catch (err) {
      setReviewError(err.message || "Unable to submit your review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchOrders = () => {
      const token = localStorage.getItem("token");
      if (token) {
        fetch("http://localhost:5000/api/orders/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && Array.isArray(data) && data.length > 0) {
              const formatted = data.map((d) => {
                const dateObj = new Date(d.created_at || d.date || Date.now());
                const dateStr = dateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const rawStatus = String(d.order_status || "").toLowerCase();
                let statusStr = "On the way";
                if (rawStatus === "delivered") {
                  statusStr = "Delivered";
                } else if (rawStatus === "cancelled") {
                  statusStr = "Cancelled";
                } else if (rawStatus === "returned") {
                  statusStr = "Returned";
                } else {
                  statusStr = "On the way";
                }

                return {
                  id: d.order_number || String(d.id),
                  date: dateStr,
                  rawDate: dateObj,
                  status: statusStr,
                  total: Number(d.total) || 0,
                  trackingId: d.tracking_number || `TRK-${d.id}`,
                  shippingAddress:
                    [d.line1, d.line2, d.city, d.state, d.pincode]
                      .filter(Boolean)
                      .join(", ") || "Saved Delivery Address",
                  paymentMethod: String(d.payment_method || "cod").toUpperCase(),
                  items: (d.items || []).map((it) => ({
                    id: it.id,
                    productId: it.product_id || it.productId || null,
                    orderId: d.id,
                    orderNumber: d.order_number || String(d.id),
                    name: it.product_name || it.name || "Product",
                    size: it.size || "Standard",
                    color: it.color || "",
                    qty: Number(it.quantity || it.qty) || 1,
                    price: Number(it.price) || 0,
                    image:
                      it.product_image ||
                      it.image ||
                      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80",
                  })),
                };
              });
              setOrders(formatted);
            } else {
              setOrders([]);
            }
            setLoading(false);
          })
          .catch(() => {
            setOrders([]);
            setLoading(false);
          });
      } else {
        setOrders([]);
        setLoading(false);
      }
    };

    fetchOrders();
    window.addEventListener("orderPlaced", fetchOrders);
    return () => window.removeEventListener("orderPlaced", fetchOrders);
  }, []);

  const getOrderDate = (ord) => {
    if (ord.rawDate instanceof Date && !isNaN(ord.rawDate)) {
      return ord.rawDate;
    }
    if (ord.created_at) {
      const d = new Date(ord.created_at);
      if (!isNaN(d)) return d;
    }
    if (ord.date) {
      const d = new Date(ord.date);
      if (!isNaN(d)) return d;
    }
    return new Date();
  };

  const matchesSearch = (o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const idMatch = o.id && o.id.toLowerCase().includes(q);
    const trackMatch = o.trackingId && o.trackingId.toLowerCase().includes(q);
    const itemMatch = (o.items || []).some(
      (it) => it.name && it.name.toLowerCase().includes(q)
    );
    return Boolean(idMatch || trackMatch || itemMatch);
  };

  const matchesStatus = (o) => {
    if (selectedStatuses.length === 0) return true;
    return selectedStatuses.includes(o.status);
  };

  const matchesTime = (o) => {
    if (!selectedTime || selectedTime === "all") return true;
    const d = getOrderDate(o);
    const year = d.getFullYear();
    if (selectedTime === "last30") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return d >= thirtyDaysAgo;
    }
    if (selectedTime === "2024") {
      return year === 2024;
    }
    if (selectedTime === "2023") {
      return year === 2023;
    }
    if (selectedTime === "older") {
      return year < 2023;
    }
    return true;
  };

  const filteredOrders = orders.filter(
    (o) => matchesSearch(o) && matchesStatus(o) && matchesTime(o)
  );

  const toggleStatus = (status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleResetFilters = () => {
    setSelectedStatuses([]);
    setSelectedTime("all");
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedStatuses.length > 0 || selectedTime !== "all" || searchQuery.trim().length > 0;

  const activeFilterCount =
    selectedStatuses.length + (selectedTime !== "all" ? 1 : 0);

  const getStatusCount = (status) => {
    return orders.filter((o) => o.status === status).length;
  };

  const getTimeCount = (timeValue) => {
    if (timeValue === "all") return orders.length;
    return orders.filter((o) => {
      const d = getOrderDate(o);
      const year = d.getFullYear();
      if (timeValue === "last30") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return d >= thirtyDaysAgo;
      }
      if (timeValue === "2024") return year === 2024;
      if (timeValue === "2023") return year === 2023;
      if (timeValue === "older") return year < 2023;
      return true;
    }).length;
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Delivered":
        return { background: "#dcfce7", color: "#15803d" };
      case "Cancelled":
        return { background: "#fee2e2", color: "#b91c1c" };
      case "Returned":
        return { background: "#f3e8ff", color: "#7e22ce" };
      case "On the way":
      default:
        return { background: "#dbeafe", color: "#1d4ed8" };
    }
  };

  const ordersContent = (
    <>
      {reviewToast && (
        <div role="status" style={{ marginBottom: "16px", padding: "12px 16px", borderRadius: "10px", background: "#ecfdf5", color: "#047857" }}>
          {reviewToast}
        </div>
      )}
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "My Orders" }]} />

      <h1 className="visually-hidden">My Orders</h1>

      {/* Search Bar & Filter Button Toolbar */}
      <div className="orders-top-toolbar">
        <div className="orders-search-box">
          <IoSearchOutline size={20} color="#666" />
          <input
            type="text"
            placeholder="Search by Order, Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="orders-search-clear-btn"
              onClick={() => setSearchQuery("")}
              title="Clear search"
            >
              <IoCloseOutline size={18} />
            </button>
          )}
        </div>

        <button
          type="button"
          className={`orders-filter-trigger-btn ${activeFilterCount > 0 ? "has-filters" : ""}`}
          onClick={() => setIsFilterOpen(true)}
        >
          <IoFilterOutline size={18} />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="orders-filter-count-badge">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Orders Section */}
      <section className="info-section">
        {/* Bar Row: Results Count & Clear Link */}
        <div className="orders-bar-row">
          <div className="orders-results-count">
            Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="orders-clear-all-link"
              onClick={handleResetFilters}
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="orders-active-filters-bar">
            {selectedStatuses.map((st) => (
              <span key={st} className="orders-filter-chip">
                Status: <strong>{st}</strong>
                <button type="button" onClick={() => toggleStatus(st)} title={`Remove ${st}`}>
                  <IoCloseOutline size={14} />
                </button>
              </span>
            ))}

            {selectedTime && selectedTime !== "all" && (
              <span className="orders-filter-chip">
                Time:{" "}
                <strong>
                  {TIME_OPTIONS.find((t) => t.value === selectedTime)?.label || selectedTime}
                </strong>
                <button
                  type="button"
                  onClick={() => setSelectedTime("all")}
                  title="Remove time filter"
                >
                  <IoCloseOutline size={14} />
                </button>
              </span>
            )}

            {searchQuery.trim() && (
              <span className="orders-filter-chip">
                Search: <strong>"{searchQuery}"</strong>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                >
                  <IoCloseOutline size={14} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Orders Listing */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {loading ? (
            <div className="info-card" role="status" style={{ textAlign: "center", padding: "48px 20px" }}>
              Loading orders...
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((ord) => (
              <div key={ord.id} className="info-card" style={{ padding: "28px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "14px",
                    paddingBottom: "18px",
                    borderBottom: "1px solid #f0f0f0",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "18px", fontWeight: "900", color: "#111" }}>
                        #{ord.id}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          ...getStatusBadgeStyle(ord.status),
                          padding: "3px 12px",
                          borderRadius: "999px",
                        }}
                      >
                        ● {ord.status}
                      </span>
                    </div>
                    <span style={{ fontSize: "13px", color: "#777" }}>Placed on {ord.date}</span>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "12px", color: "#888", display: "block" }}>Total Amount</span>
                    <span style={{ fontSize: "20px", fontWeight: "900", color: "#000" }}>
                      ${ord.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
                  {ord.items &&
                    ord.items.map((item, idx) => {
                      return (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "16px",
                            flexWrap: "wrap",
                            padding: "8px 0",
                            borderBottom: idx < ord.items.length - 1 ? "1px dashed #f1f5f9" : "none",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "220px" }}>
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                                borderRadius: "10px",
                                background: "#f0f0f0",
                                flexShrink: 0,
                              }}
                            />
                            <div>
                              <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#111", margin: 0 }}>
                                {item.name}
                              </h4>
                              <div style={{ fontSize: "13px", color: "#666", marginTop: "3px" }}>
                                Size: <strong>{item.size}</strong> • Color: <strong>{item.color || "Standard"}</strong> • Qty: <strong>{item.qty}</strong>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                            <div style={{ fontSize: "15px", fontWeight: "700" }}>
                              ${(item.price * item.qty).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Card Bottom Actions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    paddingTop: "16px",
                    borderTop: "1px solid #f0f0f0",
                  }}
                >
                  <div style={{ fontSize: "13px", color: "#666" }}>
                    Tracking: <strong>{ord.trackingId || "SHP-PENDING"}</strong>
                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {ord.items && ord.items.length > 0 && (
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => openReviewModal(ord.items[0], ord)}
                      >
                        <IoStarOutline size={16} /> Write Review
                      </button>
                    )}
                    <button className="btn-outline" onClick={() => setSelectedOrder(ord)}>
                      <IoReceiptOutline size={16} /> View Details & Invoice
                    </button>
                    <Link
                      to={`/manage-deliveries?tracking=${encodeURIComponent(ord.trackingId || ord.id)}`}
                      state={{ order: ord }}
                      className="btn-solid-black"
                    >
                      <FiTruck size={16} /> Track Shipment
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="info-card" style={{ textAlign: "center", padding: "48px 20px" }}>
              <IoBagCheckOutline size={48} color="#999" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "6px" }}>No Orders Found</h3>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
                Looks like you don't have any orders matching the selected filter.
              </p>
              {hasActiveFilters ? (
                <button className="btn-solid-black" onClick={handleResetFilters}>
                  Clear Filters & Search
                </button>
              ) : (
                <Link to="/category/all" className="btn-solid-black">
                  Start Shopping
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );

  const modals = (
    <>
      {/* Write Review Modal */}
      {reviewModalOpen && reviewItem && (
        <div className="info-modal-backdrop" onClick={closeReviewModal}>
          <div className="info-modal-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="info-modal-close" onClick={closeReviewModal} aria-label="Close review form">
              <IoCloseOutline size={20} />
            </button>
            <h2 style={{ margin: "0 44px 6px 0", fontSize: "22px", fontWeight: "900" }}>Write a Review</h2>
            <p style={{ margin: "0 0 20px", color: "#666", fontSize: "14px" }}>
              {reviewItem.name} · Order #{reviewItem.orderNumber}
            </p>

            <form onSubmit={handleSubmitReview}>
              <label style={{ display: "block", fontWeight: "700", marginBottom: "8px" }}>Your rating</label>
              <div style={{ display: "flex", gap: "6px", marginBottom: "18px" }} role="group" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
                    onMouseEnter={() => setHoverRating(rating)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setReviewRating(rating)}
                    style={{ border: 0, background: "transparent", cursor: "pointer", padding: "2px", color: rating <= (hoverRating || reviewRating) ? "#f59e0b" : "#cbd5e1" }}
                  >
                    <IoStar size={28} />
                  </button>
                ))}
                <span style={{ alignSelf: "center", marginLeft: "6px", color: "#555", fontSize: "14px" }}>
                  {RATING_LABELS[hoverRating || reviewRating]}
                </span>
              </div>

              <label htmlFor="review-comment" style={{ display: "block", fontWeight: "700", marginBottom: "8px" }}>Your review</label>
              <textarea
                id="review-comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                maxLength={2000}
                rows={1}
                placeholder="Share your experience with this product"
                style={{ width: "100%", height: "58px", minHeight: "58px", boxSizing: "border-box", padding: "12px", border: "1px solid #d1d5db", borderRadius: "10px", resize: "vertical", font: "inherit", marginBottom: "16px" }}
              />

              <label htmlFor="review-images" style={{ display: "block", fontWeight: "700", marginBottom: "6px" }}>Product photos</label>
              <input
                id="review-images"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 5) {
                    setReviewError("Choose up to 5 photos.");
                    e.target.value = "";
                    return;
                  }
                  if (files.some((file) => file.size > 5 * 1024 * 1024)) {
                    setReviewError("Each photo must be 5 MB or smaller.");
                    e.target.value = "";
                    return;
                  }
                  setReviewImages(files);
                  setReviewError("");
                }}
                style={{ display: "block", width: "100%", marginBottom: "6px" }}
              />
              <small style={{ display: "block", color: "#777", marginBottom: "16px" }}>
                Up to 5 photos, 5 MB each{reviewImages.length ? ` · ${reviewImages.length} selected` : ""}
              </small>

              <label htmlFor="review-video" style={{ display: "block", fontWeight: "700", marginBottom: "6px" }}>Product video</label>
              <input
                id="review-video"
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && file.size > 50 * 1024 * 1024) {
                    setReviewError("The video must be 50 MB or smaller.");
                    e.target.value = "";
                    return;
                  }
                  setReviewVideo(file);
                  setReviewError("");
                }}
                style={{ display: "block", width: "100%", marginBottom: "6px" }}
              />
              <small style={{ display: "block", color: "#777", marginBottom: "18px" }}>
                MP4, WebM, or MOV up to 50 MB{reviewVideo ? ` · ${reviewVideo.name}` : ""}
              </small>

              {reviewError && (
                <p role="alert" style={{ color: "#b91c1c", fontSize: "14px", margin: "0 0 14px" }}>{reviewError}</p>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn-outline" onClick={closeReviewModal} disabled={isSubmittingReview}>Cancel</button>
                <button type="submit" className="btn-solid-black" disabled={isSubmittingReview}>
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="info-modal-backdrop" onClick={() => setIsFilterOpen(false)}>
          <div className="orders-filter-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="orders-filter-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <IoFilterOutline size={22} />
                <h3 style={{ fontSize: "20px", fontWeight: "900", margin: 0 }}>Filter Orders</h3>
              </div>
              <button
                type="button"
                className="info-modal-close"
                style={{ position: "static" }}
                onClick={() => setIsFilterOpen(false)}
              >
                <IoCloseOutline size={22} />
              </button>
            </div>

            <div className="orders-filter-modal-body">
              {/* Order Status */}
              <div className="orders-filter-group">
                <span className="orders-filter-group-title">ORDER STATUS</span>
                <div className="orders-filter-options-grid">
                  {STATUS_OPTIONS.map((status) => {
                    const isChecked = selectedStatuses.includes(status);
                    const count = getStatusCount(status);
                    return (
                      <label
                        key={status}
                        className={`orders-filter-option ${isChecked ? "checked" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleStatus(status)}
                        />
                        <span className="orders-filter-option-label">{status}</span>
                        <span className="orders-filter-option-count">({count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Order Time */}
              <div className="orders-filter-group" style={{ marginTop: "24px" }}>
                <span className="orders-filter-group-title">ORDER TIME</span>
                <div className="orders-filter-options-grid">
                  {TIME_OPTIONS.map((timeOpt) => {
                    const isSelected = selectedTime === timeOpt.value;
                    const count = getTimeCount(timeOpt.value);
                    return (
                      <label
                        key={timeOpt.value}
                        className={`orders-filter-option ${isSelected ? "checked" : ""}`}
                      >
                        <input
                          type="radio"
                          name="orderTime"
                          value={timeOpt.value}
                          checked={isSelected}
                          onChange={() => setSelectedTime(timeOpt.value)}
                        />
                        <span className="orders-filter-option-label">{timeOpt.label}</span>
                        <span className="orders-filter-option-count">({count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="orders-filter-modal-footer">
              <button
                type="button"
                className="btn-outline"
                onClick={handleResetFilters}
                style={{ padding: "10px 18px", fontSize: "14px" }}
              >
                Reset All
              </button>
              <button
                type="button"
                className="btn-solid-black"
                onClick={() => setIsFilterOpen(false)}
                style={{ padding: "10px 24px", fontSize: "14px" }}
              >
                Apply Filters ({filteredOrders.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice & Order Details Modal */}
      {selectedOrder && (
        <div className="info-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="info-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="info-modal-close" onClick={() => setSelectedOrder(null)}>
              <IoCloseOutline size={20} />
            </button>

            <div style={{ textAlign: "center", paddingBottom: "20px", borderBottom: "1px dashed #ccc", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "900", letterSpacing: "-0.03em" }}>SHOP.CO</h2>
              <p style={{ fontSize: "12px", color: "#666" }}>Official Order Receipt & Tax Invoice</p>
              <div style={{ fontSize: "14px", fontWeight: "800", marginTop: "8px" }}>
                Order #{selectedOrder.id}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "13px", marginBottom: "20px" }}>
              <div>
                <span style={{ color: "#777", display: "block" }}>Order Date</span>
                <strong>{selectedOrder.date}</strong>
              </div>
              <div>
                <span style={{ color: "#777", display: "block" }}>Payment Tender</span>
                <strong>{selectedOrder.paymentMethod}</strong>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ color: "#777", display: "block" }}>Delivered To</span>
                <strong>{selectedOrder.shippingAddress}</strong>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #eee", paddingTop: "14px", marginBottom: "20px" }}>
              <h4 style={{ fontSize: "13px", fontWeight: "800", textTransform: "uppercase", color: "#888", marginBottom: "10px" }}>
                Items Purchased
              </h4>
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
                  <span>
                    {it.qty}x {it.name} ({it.size})
                  </span>
                  <strong>${(it.price * it.qty).toFixed(2)}</strong>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "2px solid #000", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "900", marginBottom: "24px" }}>
              <span>Total Billed</span>
              <span>${selectedOrder.total.toFixed(2)}</span>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <Link
                to={`/manage-deliveries?tracking=${encodeURIComponent(selectedOrder.trackingId || selectedOrder.id)}`}
                state={{ order: selectedOrder }}
                className="btn-solid-black"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <FiTruck size={16} /> Track Shipment
              </Link>
              <button className="btn-outline" onClick={() => window.print()}>
                <IoPrintOutline size={16} /> Print Receipt
              </button>
              <button className="btn-outline" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (token) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          {/* Profile Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar-container">
                {avatarPhoto ? (
                  <img
                    src={avatarPhoto}
                    alt="Profile"
                    className="profile-avatar-photo"
                  />
                ) : (
                  <div className="profile-avatar-circle">{getInitials(user?.name)}</div>
                )}
                <button
                  type="button"
                  className="profile-avatar-edit-btn"
                  title="Change photo"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <IoPencilOutline size={14} />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="profile-avatar-info">
                <p className="profile-avatar-name">{user?.name || "User"}</p>
              </div>
            </div>

            <nav className="profile-nav">
              <Link to="/profile" className="profile-nav-item">
                <IoPersonOutline size={18} />
                My Profile
              </Link>
              <Link to="/orders" className="profile-nav-item profile-nav-item--active">
                <IoBagCheckOutline size={18} />
                My Orders
              </Link>
              <Link to="/settings" className="profile-nav-item">
                <IoSettingsOutline size={18} />
                Settings
              </Link>
              <Link to="/add-address" className="profile-nav-item">
                <IoAddCircleOutline size={18} />
                Add Address
              </Link>
              <button className="profile-nav-item profile-nav-item--logout" onClick={handleLogout}>
                <IoLogOutOutline size={18} />
                Logout
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="profile-main" style={{ width: "100%", minWidth: 0 }}>
            {ordersContent}
          </main>
        </div>

        {modals}
      </div>
    );
  }

  return (
    <div className="info-page">
      <div className="info-container">
        {ordersContent}
      </div>
      {modals}
    </div>
  );
}
