import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoSearchOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoStar,
  IoStarOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoCloseOutline,
  IoRefreshOutline,
  IoCheckmarkOutline,
  IoCloseCircleOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import AdminSidebar from "./AdminSidebar";
import AdminPagination from "./AdminPagination";
import AdminSearchableSelect from "./AdminSearchableSelect";
import { isSessionExpired, clearSession } from "../../services/authService";

import "./AdminPages.css";

const initialReviews = [
  {
    id: 1,
    author: "Sarah M.",
    email: "sarah.m@example.com",
    productName: "T-shirt with Tape Details",
    rating: 5,
    status: "Approved",
    comment:
      "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations.",
    date: "2024-03-12",
    verified: true,
  },
  {
    id: 2,
    author: "Alex K.",
    email: "alex.k@example.com",
    productName: "Skinny Fit Jeans",
    rating: 5,
    status: "Approved",
    comment:
      "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.",
    date: "2024-03-10",
    verified: true,
  },
  {
    id: 3,
    author: "James L.",
    email: "james.l@example.com",
    productName: "Checkered Shirt",
    rating: 4,
    status: "Approved",
    comment:
      "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends.",
    date: "2024-03-08",
    verified: true,
  },
  {
    id: 4,
    author: "Samantha D.",
    email: "samantha.d@example.com",
    productName: "Sleeve Striped T-shirt",
    rating: 5,
    status: "Approved",
    comment:
      "I absolutely love the modern vibe and effortless style of the pieces from Shop.co. Everything from casual tees to formal wear fits like a glove and feels ultra-luxurious.",
    date: "2024-03-05",
    verified: true,
  },
  {
    id: 5,
    author: "Michael B.",
    email: "michael.b@example.com",
    productName: "Vertical Striped Shirt",
    rating: 4,
    status: "Pending",
    comment:
      "Great quality cotton material, delivery took a couple days longer than expected but very happy with the shirt overall.",
    date: "2024-03-02",
    verified: false,
  },
  {
    id: 6,
    author: "Ethan R.",
    email: "ethan.r@example.com",
    productName: "Courage O-Neck T-Shirt",
    rating: 2,
    status: "Pending",
    comment:
      "The sizing runs a bit small compared to the size chart. Fabric is decent though.",
    date: "2024-02-28",
    verified: true,
  },
];

export default function AdminReviews() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [reviewsList, setReviewsList] = useState(() => {
    const saved = localStorage.getItem("admin_reviews_data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialReviews;
      }
    }
    return initialReviews;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [toastMessage, setToastMessage] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    author: "",
    email: "",
    productName: "",
    rating: 5,
    comment: "",
    status: "Approved",
    verified: true,
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isSessionExpired()) {
      clearSession("expired");
      navigate("/login?expired=1");
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("admin_reviews_data", JSON.stringify(reviewsList));
  }, [reviewsList]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    showToast("Filters cleared");
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.author.trim()) errors.author = "Customer name is required";
    if (!formData.productName.trim())
      errors.productName = "Product name is required";
    if (!formData.comment.trim()) errors.comment = "Review comment is required";
    return errors;
  };

  const handleOpenEdit = (review) => {
    setSelectedReview(review);
    setFormData({
      author: review.author,
      email: review.email || "",
      productName: review.productName || "General Store",
      rating: review.rating || 5,
      comment: review.comment || "",
      status: review.status || "Approved",
      verified: !!review.verified,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (review) => {
    setSelectedReview(review);
    setIsDeleteModalOpen(true);
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    const newReview = {
      id: Date.now(),
      author: formData.author.trim(),
      email:
        formData.email.trim() ||
        `${formData.author.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      productName: formData.productName.trim(),
      rating: Number(formData.rating) || 5,
      comment: formData.comment.trim(),
      status: formData.status,
      verified: formData.verified,
      date: new Date().toISOString().split("T")[0],
    };

    setReviewsList([newReview, ...reviewsList]);
    setIsAddModalOpen(false);
    showToast(`Review from "${newReview.author}" created!`);
  };

  const handleUpdateReview = (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setReviewsList(
      reviewsList.map((r) =>
        r.id === selectedReview.id
          ? {
              ...r,
              author: formData.author.trim(),
              email: formData.email.trim(),
              productName: formData.productName.trim(),
              rating: Number(formData.rating),
              comment: formData.comment.trim(),
              status: formData.status,
              verified: formData.verified,
            }
          : r,
      ),
    );
    setIsEditModalOpen(false);
    showToast("Review updated successfully!");
  };

  const handleDeleteReview = () => {
    if (!selectedReview) return;
    setReviewsList(reviewsList.filter((r) => r.id !== selectedReview.id));
    setIsDeleteModalOpen(false);
    showToast("Review deleted successfully!");
  };

  const handleToggleStatus = (review, newStatus) => {
    setReviewsList(
      reviewsList.map((r) =>
        r.id === review.id ? { ...r, status: newStatus } : r,
      ),
    );
    showToast(`Review is now marked as ${newStatus}`);
  };

  // Filtered reviews
  const filteredReviews = reviewsList.filter((rev) => {
    const matchesSearch =
      rev.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rev.productName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (rev.comment || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rev.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      rev.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedReviews = filteredReviews.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const totalReviews = reviewsList.length;
  const avgRating =
    totalReviews > 0
      ? (
          reviewsList.reduce((acc, r) => acc + (r.rating || 0), 0) /
          totalReviews
        ).toFixed(1)
      : "5.0";
  const fiveStarCount = reviewsList.filter((r) => r.rating === 5).length;
  const pendingCount = reviewsList.filter((r) => r.status === "Pending").length;

  return (
    <div className="adm-page">
      <AdminSidebar />

      <main className="adm-main">
        {/* Floating Toast */}
        {toastMessage && (
          <div
            style={{
              position: "fixed",
              top: 24,
              right: 24,
              background: "#10b981",
              color: "#fff",
              padding: "12px 20px",
              borderRadius: "8px",
              fontWeight: "600",
              zIndex: 9999,
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <IoCheckmarkOutline size={18} />
            {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="adm-header">
          <div className="adm-header-left">
            <h1 className="adm-title">Reviews & Feedback</h1>
            <p className="adm-subtitle">
              Monitor customer ratings, moderate feedback, and manage storefront
              testimonials
            </p>
          </div>
          <div className="adm-header-right">
            <div className="adm-user-chip">
              <div className="adm-user-avatar">
                {(currentUser.name || "A").charAt(0).toUpperCase()}
              </div>
              <div className="adm-user-info">
                <span className="adm-user-name">
                  {currentUser.name || "Admin"}
                </span>
                <span className="adm-user-role">Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="adm-cardGrid">
          <div className="adm-card adm-card--indigo">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Total Reviews</span>
              <span className="adm-cardValue">{totalReviews}</span>
              <span className="adm-cardSubtext">Received feedback</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoStarOutline />
            </div>
          </div>

          <div className="adm-card adm-card--amber">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Average Rating</span>
              <span className="adm-cardValue">{avgRating} / 5</span>
              <span className="adm-cardSubtext">Overall satisfaction</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoStar />
            </div>
          </div>

          <div className="adm-card adm-card--green">
            <div className="adm-card-content">
              <span className="adm-cardLabel">5-Star Reviews</span>
              <span className="adm-cardValue">{fiveStarCount}</span>
              <span className="adm-cardSubtext">Top rated experiences</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoCheckmarkCircleOutline />
            </div>
          </div>

          <div className="adm-card adm-card--purple">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Pending Moderation</span>
              <span className="adm-cardValue">{pendingCount}</span>
              <span className="adm-cardSubtext">Awaiting review</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoAlertCircleOutline />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="adm-toolbar">
          <div className="adm-toolbar-left">
            <div className="adm-searchBox">
              <IoSearchOutline size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Search reviews by customer, product, comment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>


            <AdminSearchableSelect
              className="adm-selectFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="All Statuses"
              options={[
                { value: "all", label: "All Statuses" },
                { value: "approved", label: "Approved" },
                { value: "pending", label: "Pending" },
                { value: "rejected", label: "Rejected" },
              ]}
            />

            <button
              className="adm-btn-refresh"
              onClick={handleClearFilters}
              title="Clear Filters"
            >
              <IoRefreshOutline size={16} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="adm-table-card">
          <div className="adm-table-responsive">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Rating</th>
                  <th>Review Comment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.length > 0 ? (
                  paginatedReviews.map((rev) => (
                    <tr key={rev.id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: "#0f172a",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 13,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {(rev.author || "C").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                color: "var(--adm-text-primary)",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              {rev.author}
                              {rev.verified && (
                                <IoShieldCheckmarkOutline
                                  size={14}
                                  color="#10b981"
                                  title="Verified Buyer"
                                />
                              )}
                            </div>
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--adm-text-muted)",
                              }}
                            >
                              {rev.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            color: "#334155",
                          }}
                        >
                          {rev.productName || "General Store"}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          {[...Array(5)].map((_, i) => (
                            <IoStar
                              key={i}
                              size={15}
                              color={
                                i < (rev.rating || 0) ? "#f59e0b" : "#e2e8f0"
                              }
                            />
                          ))}
                          <span
                            style={{
                              marginLeft: 4,
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#64748b",
                            }}
                          >
                            {rev.rating}.0
                          </span>
                        </div>
                      </td>
                      <td style={{ maxWidth: 320 }}>
                        <span
                          style={{
                            fontSize: 13,
                            color: "var(--adm-text-secondary)",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.45,
                          }}
                        >
                          "{rev.comment}"
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 700,
                            background:
                              rev.status === "Approved"
                                ? "#ecfdf5"
                                : rev.status === "Pending"
                                  ? "#fffbeb"
                                  : "#fef2f2",
                            color:
                              rev.status === "Approved"
                                ? "#10b981"
                                : rev.status === "Pending"
                                  ? "#d97706"
                                  : "#ef4444",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background:
                                rev.status === "Approved"
                                  ? "#10b981"
                                  : rev.status === "Pending"
                                    ? "#d97706"
                                    : "#ef4444",
                            }}
                          />
                          {rev.status}
                        </span>
                      </td>
                      <td
                        style={{
                          fontSize: 13,
                          color: "var(--adm-text-secondary)",
                        }}
                      >
                        {rev.date}
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 6,
                          }}
                        >
                          {rev.status !== "Approved" && (
                            <button
                              className="adm-action-btn"
                              style={{
                                background: "#ecfdf5",
                                color: "#10b981",
                              }}
                              onClick={() =>
                                handleToggleStatus(rev, "Approved")
                              }
                              title="Approve Review"
                            >
                              <IoCheckmarkOutline size={16} />
                            </button>
                          )}
                          {rev.status === "Approved" && (
                            <button
                              className="adm-action-btn"
                              style={{
                                background: "#fffbeb",
                                color: "#d97706",
                              }}
                              onClick={() => handleToggleStatus(rev, "Pending")}
                              title="Set to Pending"
                            >
                              <IoCloseCircleOutline size={16} />
                            </button>
                          )}
                          <button
                            className="adm-action-btn adm-action-btn--edit"
                            onClick={() => handleOpenEdit(rev)}
                            title="Edit Review"
                          >
                            <IoPencilOutline size={16} />
                          </button>
                          <button
                            className="adm-action-btn adm-action-btn--delete"
                            onClick={() => handleOpenDelete(rev)}
                            title="Delete Review"
                          >
                            <IoTrashOutline size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: "48px 20px" }}
                    >
                      <div className="adm-empty-state">
                        <IoAlertCircleOutline className="adm-empty-icon" />
                        <div className="adm-empty-title">No reviews found</div>
                        <p
                          style={{
                            color: "var(--adm-text-secondary)",
                            fontSize: 14,
                          }}
                        >
                          Try adjusting your search filters or add a new
                          testimonial.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <AdminPagination
            currentPage={safeCurrentPage}
            totalItems={filteredReviews.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>

        {/* ── MODAL: Add Review ── */}
        {isAddModalOpen && (
          <div className="adm-modal-overlay">
            <div className="adm-modal">
              <div className="adm-modal-header">
                <h3 className="adm-modal-title">Add Customer Testimonial</h3>
                <button
                  className="adm-modal-close"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <IoCloseOutline />
                </button>
              </div>
              <form onSubmit={handleAddReview}>
                <div className="adm-modal-body">
                  <div className="adm-form-group">
                    <label className="adm-form-label">Customer Name *</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      placeholder="e.g. Emily Watson"
                      value={formData.author}
                      onChange={(e) => {
                        setFormData({ ...formData, author: e.target.value });
                        if (formErrors.author)
                          setFormErrors({ ...formErrors, author: "" });
                      }}
                    />
                    {formErrors.author && (
                      <span style={{ color: "#ef4444", fontSize: 12 }}>
                        {formErrors.author}
                      </span>
                    )}
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Customer Email</label>
                    <input
                      type="email"
                      className="adm-form-input"
                      placeholder="e.g. emily@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Product Name *</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      placeholder="e.g. T-shirt with Tape Details"
                      value={formData.productName}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          productName: e.target.value,
                        });
                        if (formErrors.productName)
                          setFormErrors({ ...formErrors, productName: "" });
                      }}
                    />
                    {formErrors.productName && (
                      <span style={{ color: "#ef4444", fontSize: 12 }}>
                        {formErrors.productName}
                      </span>
                    )}
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Rating</label>
                    <div
                      style={{ display: "flex", gap: 10, alignItems: "center" }}
                    >
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, rating: val })
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          <IoStar
                            size={26}
                            color={
                              val <= formData.rating ? "#f59e0b" : "#cbd5e1"
                            }
                          />
                        </button>
                      ))}
                      <span style={{ fontWeight: 700, marginLeft: 8 }}>
                        {formData.rating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Review Comment *</label>
                    <textarea
                      className="adm-form-textarea"
                      rows={4}
                      placeholder="Customer's feedback comment..."
                      value={formData.comment}
                      onChange={(e) => {
                        setFormData({ ...formData, comment: e.target.value });
                        if (formErrors.comment)
                          setFormErrors({ ...formErrors, comment: "" });
                      }}
                    />
                    {formErrors.comment && (
                      <span style={{ color: "#ef4444", fontSize: 12 }}>
                        {formErrors.comment}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div className="adm-form-group">
                      <label className="adm-form-label">Status</label>
                      <AdminSearchableSelect
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        options={[
                          { value: "Approved", label: "Approved" },
                          { value: "Pending", label: "Pending" },
                          { value: "Rejected", label: "Rejected" },
                        ]}
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-form-label">Verified Buyer</label>
                      <AdminSearchableSelect
                        value={formData.verified ? "yes" : "no"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            verified: e.target.value === "yes",
                          })
                        }
                        options={[
                          { value: "yes", label: "Verified" },
                          { value: "no", label: "Unverified" },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                <div className="adm-modal-footer">
                  <button
                    type="button"
                    className="adm-btn-secondary"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="adm-btn-primary">
                    Create Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: Edit Review ── */}
        {isEditModalOpen && (
          <div className="adm-modal-overlay">
            <div className="adm-modal">
              <div className="adm-modal-header">
                <h3 className="adm-modal-title">Edit Review</h3>
                <button
                  className="adm-modal-close"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <IoCloseOutline />
                </button>
              </div>
              <form onSubmit={handleUpdateReview}>
                <div className="adm-modal-body">
                  <div className="adm-form-group">
                    <label className="adm-form-label">Customer Name *</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      value={formData.author}
                      onChange={(e) => {
                        setFormData({ ...formData, author: e.target.value });
                        if (formErrors.author)
                          setFormErrors({ ...formErrors, author: "" });
                      }}
                    />
                    {formErrors.author && (
                      <span style={{ color: "#ef4444", fontSize: 12 }}>
                        {formErrors.author}
                      </span>
                    )}
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Product Name *</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      value={formData.productName}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          productName: e.target.value,
                        });
                        if (formErrors.productName)
                          setFormErrors({ ...formErrors, productName: "" });
                      }}
                    />
                    {formErrors.productName && (
                      <span style={{ color: "#ef4444", fontSize: 12 }}>
                        {formErrors.productName}
                      </span>
                    )}
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Rating</label>
                    <div
                      style={{ display: "flex", gap: 10, alignItems: "center" }}
                    >
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, rating: val })
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          <IoStar
                            size={26}
                            color={
                              val <= formData.rating ? "#f59e0b" : "#cbd5e1"
                            }
                          />
                        </button>
                      ))}
                      <span style={{ fontWeight: 700, marginLeft: 8 }}>
                        {formData.rating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Review Comment *</label>
                    <textarea
                      className="adm-form-textarea"
                      rows={4}
                      value={formData.comment}
                      onChange={(e) => {
                        setFormData({ ...formData, comment: e.target.value });
                        if (formErrors.comment)
                          setFormErrors({ ...formErrors, comment: "" });
                      }}
                    />
                    {formErrors.comment && (
                      <span style={{ color: "#ef4444", fontSize: 12 }}>
                        {formErrors.comment}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div className="adm-form-group">
                      <label className="adm-form-label">Status</label>
                      <AdminSearchableSelect
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        options={[
                          { value: "Approved", label: "Approved" },
                          { value: "Pending", label: "Pending" },
                          { value: "Rejected", label: "Rejected" },
                        ]}
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-form-label">Verified Buyer</label>
                      <AdminSearchableSelect
                        value={formData.verified ? "yes" : "no"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            verified: e.target.value === "yes",
                          })
                        }
                        options={[
                          { value: "yes", label: "Verified" },
                          { value: "no", label: "Unverified" },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                <div className="adm-modal-footer">
                  <button
                    type="button"
                    className="adm-btn-secondary"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="adm-btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: Delete Review ── */}
        {isDeleteModalOpen && selectedReview && (
          <div className="adm-modal-overlay">
            <div className="adm-modal">
              <div className="adm-modal-header">
                <h3 className="adm-modal-title" style={{ color: "#ef4444" }}>
                  Delete Review
                </h3>
                <button
                  className="adm-modal-close"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  <IoCloseOutline />
                </button>
              </div>
              <div className="adm-modal-body">
                <p
                  style={{
                    color: "var(--adm-text-primary)",
                    fontSize: 15,
                    marginBottom: 12,
                  }}
                >
                  Are you sure you want to delete review from{" "}
                  <strong>"{selectedReview.author}"</strong>?
                </p>
                <p style={{ color: "var(--adm-text-secondary)", fontSize: 13 }}>
                  "{selectedReview.comment}"
                </p>
              </div>
              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
