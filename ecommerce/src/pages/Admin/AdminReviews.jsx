import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

const API_BASE = "http://localhost:5000/api";

// Normalize a review row from the DB into the shape the UI uses
const normalizeReview = (r) => ({
  id: r.id,
  author: r.user_name || "Unknown",
  email: r.user_email || "",
  productName: r.product_name || "Unknown Product",
  rating: Number(r.rating) || 0,
  comment: r.comment || "",
  status: r.status
    ? r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase()
    : "Pending",
  date: r.created_at
    ? new Date(r.created_at).toISOString().split("T")[0]
    : "",
  verified: true, // all DB-submitted reviews are real buyers
});

export default function AdminReviews() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [reviewsList, setReviewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // Form State (edit only — status change)
  const [formStatus, setFormStatus] = useState("Pending");
  const [saving, setSaving] = useState(false);

  // ── Auth guard ──────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isSessionExpired()) {
      clearSession("expired");
      navigate("/login?expired=1");
    }
  }, [navigate]);

  // ── Helpers ─────────────────────────────────────────────────
  const showToast = (msg, isError = false) => {
    setToastMessage(msg);
    setToastError(isError);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ── Fetch reviews from API ───────────────────────────────────
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter.toLowerCase();

      const res = await axios.get(`${API_BASE}/reviews`, {
        params,
        headers: getAuthHeaders(),
      });

      const data = Array.isArray(res.data) ? res.data : [];
      setReviewsList(data.map(normalizeReview));
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Failed to load reviews";
      setFetchError(msg);
      showToast(msg, true);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Reset page on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // ── Approve / Reject (PUT /api/reviews/:id/status) ──────────
  const handleToggleStatus = async (review, newStatus) => {
    const lowerStatus = newStatus.toLowerCase();
    try {
      await axios.put(
        `${API_BASE}/reviews/${review.id}/status`,
        { status: lowerStatus },
        { headers: getAuthHeaders() }
      );
      setReviewsList((prev) =>
        prev.map((r) =>
          r.id === review.id
            ? { ...r, status: newStatus }
            : r
        )
      );
      showToast(`Review marked as ${newStatus}`);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to update review status";
      showToast(msg, true);
    }
  };

  // ── Edit (status change via modal) ──────────────────────────
  const handleOpenEdit = (review) => {
    setSelectedReview(review);
    setFormStatus(review.status.toLowerCase());
    setIsEditModalOpen(true);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!selectedReview) return;
    setSaving(true);
    try {
      await axios.put(
        `${API_BASE}/reviews/${selectedReview.id}/status`,
        { status: formStatus },
        { headers: getAuthHeaders() }
      );
      setReviewsList((prev) =>
        prev.map((r) =>
          r.id === selectedReview.id
            ? {
                ...r,
                status:
                  formStatus.charAt(0).toUpperCase() +
                  formStatus.slice(1),
              }
            : r
        )
      );
      setIsEditModalOpen(false);
      showToast("Review updated successfully!");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to update review";
      showToast(msg, true);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete (DELETE /api/reviews/:id) ────────────────────────
  const handleOpenDelete = (review) => {
    setSelectedReview(review);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteReview = async () => {
    if (!selectedReview) return;
    try {
      await axios.delete(`${API_BASE}/reviews/${selectedReview.id}`, {
        headers: getAuthHeaders(),
      });
      setReviewsList((prev) => prev.filter((r) => r.id !== selectedReview.id));
      setIsDeleteModalOpen(false);
      showToast("Review deleted successfully!");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to delete review";
      showToast(msg, true);
      setIsDeleteModalOpen(false);
    }
  };

  // ── Clear filters ────────────────────────────────────────────
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    showToast("Filters cleared");
  };

  // ── Filtered + paginated ─────────────────────────────────────
  const filteredReviews = reviewsList.filter((rev) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (rev.author || "").toLowerCase().includes(q) ||
      (rev.productName || "").toLowerCase().includes(q) ||
      (rev.comment || "").toLowerCase().includes(q) ||
      (rev.email || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" ||
      rev.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

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
      : "0.0";
  const fiveStarCount = reviewsList.filter((r) => r.rating === 5).length;
  const pendingCount = reviewsList.filter(
    (r) => r.status.toLowerCase() === "pending"
  ).length;

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
              background: toastError ? "#ef4444" : "#10b981",
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
            <h1 className="adm-title">Reviews &amp; Feedback</h1>
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
              onClick={() => fetchReviews()}
              title="Refresh"
            >
              <IoRefreshOutline size={16} />
              <span>Refresh</span>
            </button>

            <button
              className="adm-btn-refresh"
              onClick={handleClearFilters}
              title="Clear Filters"
              style={{ marginLeft: 4 }}
            >
              <IoCloseOutline size={16} />
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
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "48px 20px" }}>
                      <div className="adm-empty-state">
                        <IoRefreshOutline className="adm-empty-icon" style={{ animation: "spin 1s linear infinite" }} />
                        <div className="adm-empty-title">Loading reviews...</div>
                      </div>
                    </td>
                  </tr>
                ) : fetchError ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "48px 20px" }}>
                      <div className="adm-empty-state">
                        <IoAlertCircleOutline className="adm-empty-icon" style={{ color: "#ef4444" }} />
                        <div className="adm-empty-title" style={{ color: "#ef4444" }}>
                          Failed to load reviews
                        </div>
                        <p style={{ color: "var(--adm-text-secondary)", fontSize: 14 }}>
                          {fetchError}
                        </p>
                        <button
                          className="adm-btn-primary"
                          style={{ marginTop: 12 }}
                          onClick={() => fetchReviews()}
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredReviews.length > 0 ? (
                  paginatedReviews.map((rev) => (
                    <tr key={rev.id}>
                      {/* Customer */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                whiteSpace: "nowrap",
                              }}
                            >
                              <span>{rev.author}</span>
                              {rev.verified && (
                                <IoShieldCheckmarkOutline
                                  size={14}
                                  color="#10b981"
                                  style={{ flexShrink: 0 }}
                                  title="Verified Buyer"
                                />
                              )}
                            </div>
                            <span style={{ fontSize: 12, color: "var(--adm-text-muted)" }}>
                              {rev.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Product */}
                      <td>
                        <span style={{ fontWeight: 600, fontSize: 13, color: "#334155" }}>
                          {rev.productName}
                        </span>
                      </td>

                      {/* Rating */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                          {[...Array(5)].map((_, i) => (
                            <IoStar
                              key={i}
                              size={15}
                              color={i < rev.rating ? "#f59e0b" : "#e2e8f0"}
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

                      {/* Comment */}
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

                      {/* Status badge */}
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

                      {/* Date */}
                      <td style={{ fontSize: 13, color: "var(--adm-text-secondary)" }}>
                        {rev.date}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="adm-actions-cell" style={{ justifyContent: "flex-end" }}>
                          {rev.status !== "Approved" && (
                            <button
                              className="adm-action-btn"
                              style={{ background: "#ecfdf5", color: "#10b981" }}
                              onClick={() => handleToggleStatus(rev, "Approved")}
                              title="Approve Review"
                            >
                              <IoCheckmarkOutline size={16} />
                            </button>
                          )}
                          {rev.status === "Approved" && (
                            <button
                              className="adm-action-btn"
                              style={{ background: "#fffbeb", color: "#d97706" }}
                              onClick={() => handleToggleStatus(rev, "Pending")}
                              title="Set to Pending"
                            >
                              <IoCloseCircleOutline size={16} />
                            </button>
                          )}
                          <button
                            className="adm-action-btn adm-action-btn--edit"
                            onClick={() => handleOpenEdit(rev)}
                            title="Edit Review Status"
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
                    <td colSpan="7" style={{ textAlign: "center", padding: "48px 20px" }}>
                      <div className="adm-empty-state">
                        <IoAlertCircleOutline className="adm-empty-icon" />
                        <div className="adm-empty-title">No reviews found</div>
                        <p style={{ color: "var(--adm-text-secondary)", fontSize: 14 }}>
                          {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your search filters."
                            : "No reviews have been submitted yet."}
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

        {/* ── MODAL: Edit Review Status ── */}
        {isEditModalOpen && selectedReview && (
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
                  {/* Read-only info */}
                  <div className="adm-form-group">
                    <label className="adm-form-label">Customer</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      value={selectedReview.author}
                      disabled
                      style={{ background: "#f8fafc", cursor: "not-allowed" }}
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Product</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      value={selectedReview.productName}
                      disabled
                      style={{ background: "#f8fafc", cursor: "not-allowed" }}
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Rating</label>
                    <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 4 }}>
                      {[...Array(5)].map((_, i) => (
                        <IoStar
                          key={i}
                          size={22}
                          color={i < selectedReview.rating ? "#f59e0b" : "#e2e8f0"}
                        />
                      ))}
                      <span style={{ marginLeft: 8, fontWeight: 700, color: "#64748b" }}>
                        {selectedReview.rating} / 5
                      </span>
                    </div>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Comment</label>
                    <textarea
                      className="adm-form-textarea"
                      rows={3}
                      value={selectedReview.comment}
                      disabled
                      style={{ background: "#f8fafc", cursor: "not-allowed" }}
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Status</label>
                    <AdminSearchableSelect
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      options={[
                        { value: "approved", label: "Approved" },
                        { value: "pending", label: "Pending" },
                        { value: "rejected", label: "Rejected" },
                      ]}
                    />
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
                  <button
                    type="submit"
                    className="adm-btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
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
                  Are you sure you want to delete the review from{" "}
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
