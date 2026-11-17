import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoSearchOutline,
  IoAddOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoPricetagOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoCloseCircleOutline,
  IoCloseOutline,
  IoRefreshOutline,
  IoCheckmarkOutline,
  IoTimeOutline,
} from "react-icons/io5";
import AdminSidebar from "./AdminSidebar";
import AdminPagination from "./AdminPagination";
import AdminSearchableSelect from "./AdminSearchableSelect";
import { isSessionExpired, clearSession } from "../../services/authService";
import {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../../services/couponService";
import "./AdminPages.css";

export default function AdminCoupons() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [couponsList, setCouponsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [toastMessage, setToastMessage] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    discount_percent: "",
    min_order_amount: "",
    max_discount_amount: "",
    expiry_date: "",
    status: "active",
  });
  const [formErrors, setFormErrors] = useState({});

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const loadCouponsFromDb = async () => {
    try {
      setLoading(true);
      const data = await fetchCoupons();
      if (Array.isArray(data)) {
        setCouponsList(data);
        localStorage.setItem("admin_coupons_data", JSON.stringify(data));
      }
    } catch (err) {
      console.error("Error loading coupons from DB:", err);
      const saved = localStorage.getItem("admin_coupons_data");
      if (saved) {
        try {
          setCouponsList(JSON.parse(saved));
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isSessionExpired()) {
      clearSession("expired");
      navigate("/login?expired=1");
    } else {
      loadCouponsFromDb();
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("admin_coupons_data", JSON.stringify(couponsList));
  }, [couponsList]);

  // Statistics
  const totalCoupons = couponsList.length;
  const activeCoupons = couponsList.filter((c) => {
    const isAct = (c.status || "active").toLowerCase() === "active";
    if (!isAct) return false;
    if (c.expiry_date) {
      return new Date(c.expiry_date) >= new Date(new Date().setHours(0, 0, 0, 0));
    }
    return true;
  }).length;

  const inactiveCoupons = totalCoupons - activeCoupons;
  const avgDiscount =
    totalCoupons > 0
      ? Math.round(
          couponsList.reduce(
            (acc, c) => acc + (Number(c.discount_percent) || 0),
            0
          ) / totalCoupons
        )
      : 0;

  // Filtered List
  const filteredCoupons = couponsList.filter((coupon) => {
    const codeMatch = (coupon.code || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const isAct = (coupon.status || "active").toLowerCase() === "active";
    const isExpired =
      coupon.expiry_date &&
      new Date(coupon.expiry_date) < new Date(new Date().setHours(0, 0, 0, 0));

    let statusMatch = true;
    if (statusFilter === "active") {
      statusMatch = isAct && !isExpired;
    } else if (statusFilter === "inactive") {
      statusMatch = !isAct || isExpired;
    }

    return codeMatch && statusMatch;
  });

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCoupons = filteredCoupons.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  // Clear Filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    showToast("Filters cleared");
  };

  // Add Coupon
  const handleOpenAdd = () => {
    setFormData({
      code: "",
      discount_percent: "",
      min_order_amount: "",
      max_discount_amount: "",
      expiry_date: "",
      status: "active",
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.code.trim()) errs.code = "Coupon code is required";
    if (
      !formData.discount_percent ||
      isNaN(formData.discount_percent) ||
      Number(formData.discount_percent) <= 0 ||
      Number(formData.discount_percent) > 100
    ) {
      errs.discount_percent = "Enter valid discount (1 - 100%)";
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    const payload = {
      code: formData.code.trim().toUpperCase(),
      discount_percent: Number(formData.discount_percent),
      min_order_amount: Number(formData.min_order_amount) || 0,
      max_discount_amount: formData.max_discount_amount
        ? Number(formData.max_discount_amount)
        : null,
      expiry_date: formData.expiry_date || null,
      status: formData.status || "active",
    };

    try {
      await createCoupon(payload);
      await loadCouponsFromDb();
      showToast(`Coupon ${payload.code} saved to database!`);
      setIsAddModalOpen(false);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to save coupon to database. Check database connection.";
      alert(msg);
      showToast(msg);
    }
  };

  // Edit Coupon
  const handleOpenEdit = (coupon) => {
    setSelectedCoupon(coupon);
    let expFormatted = "";
    const rawExp = coupon.expiry_date || coupon.expiryDate;
    if (rawExp) {
      expFormatted = new Date(rawExp).toISOString().split("T")[0];
    }

    setFormData({
      code: coupon.code || "",
      discount_percent: coupon.discount_percent ?? coupon.discountPercent ?? 10,
      min_order_amount: coupon.min_order_amount ?? coupon.minSpend ?? 0,
      max_discount_amount: coupon.max_discount_amount || "",
      expiry_date: expFormatted,
      status: coupon.status || (coupon.isActive ? "active" : "inactive"),
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      setFormErrors({ code: "Coupon code is required" });
      return;
    }

    const payload = {
      code: formData.code.trim().toUpperCase(),
      discount_percent: Number(formData.discount_percent),
      min_order_amount: Number(formData.min_order_amount) || 0,
      max_discount_amount: formData.max_discount_amount
        ? Number(formData.max_discount_amount)
        : null,
      expiry_date: formData.expiry_date || null,
      status: formData.status || "active",
    };

    try {
      if (selectedCoupon?.id) {
        await updateCoupon(selectedCoupon.id, payload);
        await loadCouponsFromDb();
      }
      showToast(`Coupon ${payload.code} updated in database!`);
      setIsEditModalOpen(false);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to update coupon in database.";
      alert(msg);
      showToast(msg);
    }
  };

  // Toggle status directly
  const handleToggleStatus = async (coupon) => {
    const isAct = (coupon.status || "active").toLowerCase() === "active" || coupon.isActive === 1;
    const newStatus = isAct ? "inactive" : "active";
    try {
      await updateCoupon(coupon.id, { ...coupon, status: newStatus, isActive: newStatus === "active" ? 1 : 0 });
      await loadCouponsFromDb();
      showToast(`Coupon ${coupon.code} is now ${newStatus}!`);
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to update status for ${coupon.code}`;
      showToast(msg);
    }
  };

  // Delete Coupon
  const handleDeleteConfirm = async () => {
    if (!selectedCoupon) return;
    try {
      await deleteCoupon(selectedCoupon.id);
      await loadCouponsFromDb();
      showToast("Coupon deleted from database!");
      setIsDeleteModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete coupon.";
      alert(msg);
      showToast(msg);
    }
  };

  return (
    <div className="adm-page">
      <AdminSidebar />

      <main className="adm-main">
        {/* Toast */}
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
            ✓ {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="adm-header">
          <div className="adm-header-left">
            <h1 className="adm-title">Coupons & Promo Codes</h1>
            <p className="adm-subtitle">
              Manage promotional discount codes, validity rules and cart savings
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
              <span className="adm-cardLabel">Total Coupons</span>
              <span className="adm-cardValue">{totalCoupons}</span>
              <span className="adm-cardSubtext">Registered promo codes</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoPricetagOutline />
            </div>
          </div>

          <div className="adm-card adm-card--green">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Active Coupons</span>
              <span className="adm-cardValue">{activeCoupons}</span>
              <span className="adm-cardSubtext">Ready for checkout</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoCheckmarkCircleOutline />
            </div>
          </div>

          <div className="adm-card adm-card--amber">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Inactive / Expired</span>
              <span className="adm-cardValue">{inactiveCoupons}</span>
              <span className="adm-cardSubtext">Disabled or past due</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoAlertCircleOutline />
            </div>
          </div>

          <div className="adm-card adm-card--purple">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Avg. Discount</span>
              <span className="adm-cardValue">{avgDiscount}%</span>
              <span className="adm-cardSubtext">Average customer savings</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoTimeOutline />
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
                placeholder="Search by coupon code (e.g. SAVE10)..."
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
                { value: "active", label: "Active Only" },
                { value: "inactive", label: "Inactive / Expired" },
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

          <button className="adm-btn-primary" onClick={handleOpenAdd}>
            <IoAddOutline size={18} />
            <span>Create Coupon</span>
          </button>
        </div>

        {/* Coupons Table */}
        <div className="adm-table-card">
          <div className="adm-table-responsive">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>COUPON CODE</th>
                  <th>DISCOUNT</th>
                  <th>MIN ORDER</th>
                  <th>MAX CAP</th>
                  <th>EXPIRY DATE</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: "48px 16px" }}
                    >
                      <div
                        style={{
                          display: "inline-block",
                          width: 32,
                          height: 32,
                          border: "3px solid #e2e8f0",
                          borderTopColor: "#0f172a",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      <p
                        style={{
                          marginTop: 12,
                          color: "#64748b",
                          fontSize: "14px",
                        }}
                      >
                        Loading coupons from database...
                      </p>
                    </td>
                  </tr>
                ) : filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="adm-empty">
                        <div className="adm-empty-icon">🏷️</div>
                        <h3 className="adm-empty-title">No coupons found</h3>
                        <p>No promo codes match your current query.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCoupons.map((coupon) => {
                    const isAct =
                      (coupon.status || "active").toLowerCase() === "active";
                    const isExpired =
                      coupon.expiry_date &&
                      new Date(coupon.expiry_date) <
                        new Date(new Date().setHours(0, 0, 0, 0));

                    return (
                      <tr key={coupon.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                              style={{
                                background: "#f1f5f9",
                                border: "1.5px dashed #94a3b8",
                                borderRadius: "6px",
                                padding: "4px 10px",
                                fontFamily: "monospace",
                                fontSize: "14px",
                                fontWeight: "800",
                                color: "#0f172a",
                                letterSpacing: "1px",
                              }}
                            >
                              {coupon.code}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              background: "#ecfdf5",
                              color: "#059669",
                              padding: "3px 9px",
                              borderRadius: "6px",
                              fontWeight: "700",
                              fontSize: "13px",
                            }}
                          >
                            {coupon.discount_percent}% OFF
                          </span>
                        </td>
                        <td style={{ color: "#475569", fontWeight: "600" }}>
                          {coupon.min_order_amount && Number(coupon.min_order_amount) > 0
                            ? `$${Number(coupon.min_order_amount).toFixed(2)}`
                            : "No Min"}
                        </td>
                        <td style={{ color: "#475569" }}>
                          {coupon.max_discount_amount && Number(coupon.max_discount_amount) > 0
                            ? `$${Number(coupon.max_discount_amount).toFixed(2)}`
                            : "Unlimited"}
                        </td>
                        <td style={{ color: "#475569", fontSize: "13px" }}>
                          {coupon.expiry_date ? (
                            <span
                              style={{
                                color: isExpired ? "#ef4444" : "#475569",
                                fontWeight: isExpired ? "700" : "500",
                              }}
                            >
                              {new Date(coupon.expiry_date).toLocaleDateString()}
                              {isExpired ? " (Expired)" : ""}
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>No Expiry</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleStatus(coupon)}
                            title="Click to toggle status"
                            style={{
                              cursor: "pointer",
                              border: "none",
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "700",
                              background:
                                !isAct || isExpired ? "#fef2f2" : "#ecfdf5",
                              color:
                                !isAct || isExpired ? "#ef4444" : "#10b981",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background:
                                  !isAct || isExpired ? "#ef4444" : "#10b981",
                              }}
                            />
                            {!isAct
                              ? "Inactive"
                              : isExpired
                              ? "Expired"
                              : "Active"}
                          </button>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div
                            className="adm-actions-cell"
                            style={{ justifyContent: "flex-end" }}
                          >
                            {isAct && !isExpired ? (
                              <button
                                className="adm-btn-action"
                                style={{
                                  background: "#fffbeb",
                                  color: "#d97706",
                                }}
                                onClick={() => handleToggleStatus(coupon)}
                                title="Deactivate Coupon"
                              >
                                <IoCloseCircleOutline size={16} />
                              </button>
                            ) : (
                              <button
                                className="adm-btn-action"
                                style={{
                                  background: "#ecfdf5",
                                  color: "#10b981",
                                }}
                                onClick={() => handleToggleStatus(coupon)}
                                title="Activate Coupon"
                              >
                                <IoCheckmarkOutline size={16} />
                              </button>
                            )}
                            <button
                              className="adm-btn-action adm-btn-action--edit"
                              title="Edit Coupon"
                              onClick={() => handleOpenEdit(coupon)}
                            >
                              <IoPencilOutline size={15} />
                            </button>
                            <button
                              className="adm-btn-action adm-btn-action--delete"
                              title="Delete Coupon"
                              onClick={() => {
                                setSelectedCoupon(coupon);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <IoTrashOutline size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <AdminPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredCoupons.length}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Add Modal */}
        {isAddModalOpen && (
          <div className="adm-modal-overlay">
            <div className="adm-modal">
              <div className="adm-modal-header">
                <h3 className="adm-modal-title">Create New Coupon</h3>
                <button
                  className="adm-modal-close"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  <IoCloseOutline />
                </button>
              </div>

              <form onSubmit={handleAddSubmit}>
                <div className="adm-modal-body">
                  <div className="adm-form-group">
                    <label className="adm-form-label">
                      Coupon Code <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="adm-form-input"
                      placeholder="e.g. SUMMER25"
                      style={{ textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700" }}
                      value={formData.code}
                      onChange={(e) => {
                        setFormData({ ...formData, code: e.target.value.toUpperCase() });
                        if (formErrors.code) setFormErrors({ ...formErrors, code: "" });
                      }}
                    />
                    {formErrors.code && (
                      <span style={{ color: "#ef4444", fontSize: 12 }}>{formErrors.code}</span>
                    )}
                  </div>

                  <div className="adm-form-row">
                    <div className="adm-form-group">
                      <label className="adm-form-label">
                        Discount (%) <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        className="adm-form-input"
                        placeholder="e.g. 20"
                        value={formData.discount_percent}
                        onChange={(e) => {
                          setFormData({ ...formData, discount_percent: e.target.value });
                          if (formErrors.discount_percent) setFormErrors({ ...formErrors, discount_percent: "" });
                        }}
                      />
                      {formErrors.discount_percent && (
                        <span style={{ color: "#ef4444", fontSize: 12 }}>
                          {formErrors.discount_percent}
                        </span>
                      )}
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-form-label">Min. Order ($)</label>
                      <input
                        type="number"
                        min="0"
                        className="adm-form-input"
                        placeholder="0 for no minimum"
                        value={formData.min_order_amount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            min_order_amount: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="adm-form-row">
                    <div className="adm-form-group">
                      <label className="adm-form-label">Max Discount ($)</label>
                      <input
                        type="number"
                        min="0"
                        className="adm-form-input"
                        placeholder="Optional max cap"
                        value={formData.max_discount_amount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            max_discount_amount: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-form-label">Expiry Date</label>
                      <input
                        type="date"
                        className="adm-form-input"
                        value={formData.expiry_date}
                        onChange={(e) =>
                          setFormData({ ...formData, expiry_date: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Status</label>
                    <AdminSearchableSelect
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      options={[
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                      ]}
                    />
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
                    Create Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="adm-modal-overlay">
            <div className="adm-modal">
              <div className="adm-modal-header">
                <h3 className="adm-modal-title">Edit Coupon</h3>
                <button
                  className="adm-modal-close"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <IoCloseOutline />
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="adm-modal-body">
                  <div className="adm-form-group">
                    <label className="adm-form-label">
                      Coupon Code <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="adm-form-input"
                      style={{ textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700" }}
                      value={formData.code}
                      onChange={(e) => {
                        setFormData({ ...formData, code: e.target.value.toUpperCase() });
                        if (formErrors.code) setFormErrors({ ...formErrors, code: "" });
                      }}
                    />
                    {formErrors.code && (
                      <span style={{ color: "#ef4444", fontSize: 12 }}>{formErrors.code}</span>
                    )}
                  </div>

                  <div className="adm-form-row">
                    <div className="adm-form-group">
                      <label className="adm-form-label">
                        Discount (%) <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        className="adm-form-input"
                        value={formData.discount_percent}
                        onChange={(e) =>
                          setFormData({ ...formData, discount_percent: e.target.value })
                        }
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-form-label">Min. Order ($)</label>
                      <input
                        type="number"
                        min="0"
                        className="adm-form-input"
                        value={formData.min_order_amount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            min_order_amount: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="adm-form-row">
                    <div className="adm-form-group">
                      <label className="adm-form-label">Max Discount ($)</label>
                      <input
                        type="number"
                        min="0"
                        className="adm-form-input"
                        placeholder="Optional max cap"
                        value={formData.max_discount_amount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            max_discount_amount: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-form-label">Expiry Date</label>
                      <input
                        type="date"
                        className="adm-form-input"
                        value={formData.expiry_date}
                        onChange={(e) =>
                          setFormData({ ...formData, expiry_date: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-form-label">Status</label>
                    <AdminSearchableSelect
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      options={[
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
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
                  <button type="submit" className="adm-btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="adm-modal-overlay">
            <div className="adm-modal" style={{ maxWidth: 450 }}>
              <div className="adm-modal-header">
                <h3 className="adm-modal-title" style={{ color: "#ef4444" }}>
                  Delete Coupon
                </h3>
                <button
                  className="adm-modal-close"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  <IoCloseOutline />
                </button>
              </div>

              <div className="adm-modal-body">
                <p style={{ color: "var(--adm-text-primary)", fontSize: 15, marginBottom: 8 }}>
                  Are you sure you want to delete coupon{" "}
                  <strong>"{selectedCoupon?.code}"</strong>?
                </p>
                <p style={{ color: "var(--adm-text-secondary)", fontSize: 13, margin: 0 }}>
                  Customers will no longer be able to use this promo code at checkout. This action cannot be undone.
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
                  className="adm-btn-danger"
                  onClick={handleDeleteConfirm}
                >
                  Delete Coupon
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

