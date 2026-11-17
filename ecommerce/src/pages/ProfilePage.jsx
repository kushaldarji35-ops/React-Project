import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IoPencilOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoCalendarOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoAddCircleOutline,
  IoBagCheckOutline,
  IoTicketOutline,
  IoCopyOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import { 
  getCustomerProfile, 
  updateCustomerProfile,
  isSessionExpired,
  clearSession,
} from "../services/authService";
import "./ProfilePage.css";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Avatar photo
  const [avatarPhoto, setAvatarPhoto] = useState(() => localStorage.getItem("profile_avatar") || "");
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

  useEffect(() => {
    const handleAvatarUpdate = () => {
      setAvatarPhoto(localStorage.getItem("profile_avatar") || "");
    };
    window.addEventListener("profile_avatar_updated", handleAvatarUpdate);
    window.addEventListener("storage", handleAvatarUpdate);
    return () => {
      window.removeEventListener("profile_avatar_updated", handleAvatarUpdate);
      window.removeEventListener("storage", handleAvatarUpdate);
    };
  }, []);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editErrors, setEditErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Coupon history modal state
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponTab, setCouponTab] = useState("available"); // "available" | "used"
  const [copiedCode, setCopiedCode] = useState("");

  const availableCoupons = [
    {
      code: "WELCOME20",
      discount: "20% OFF",
      desc: "Special welcome discount on your entire order",
      minSpend: "$50 min spend",
      expires: "Valid till Dec 31, 2026",
      tag: "Popular",
    },
    {
      code: "SAVE10",
      discount: "10% OFF",
      desc: "All-store discount on casual wear & new arrivals",
      minSpend: "$30 min spend",
      expires: "Valid till Nov 30, 2026",
      tag: "Sitewide",
    },
    {
      code: "SHOPCO",
      discount: "15% OFF",
      desc: "Exclusive VIP club member voucher on all catalog items",
      minSpend: "No min spend",
      expires: "Valid till Dec 15, 2026",
      tag: "VIP Club",
    },
  ];

  const usedCoupons = [
    {
      code: "FASHION25",
      discount: "25% OFF",
      saved: "$36.50",
      orderId: "ORD-2026-9841",
      usedDate: "Oct 12, 2026",
      status: "Redeemed",
    },
    {
      code: "FIRSTBUY",
      discount: "$15.00 OFF",
      saved: "$15.00",
      orderId: "ORD-2026-8712",
      usedDate: "Sep 28, 2026",
      status: "Redeemed",
    },
    {
      code: "AUTUMN10",
      discount: "10% OFF",
      saved: "$0.00",
      orderId: "—",
      usedDate: "Sep 15, 2026",
      status: "Expired",
    },
  ];

  const handleCopyCode = (code) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2200);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isSessionExpired()) {
      clearSession("expired");
      navigate("/login?expired=1");
      return;
    }
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getCustomerProfile();
      setProfile(data);
      setEditName(data.name || "");
      setEditMobile(data.mobile || "");
    } catch (err) {
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateEdit = () => {
    const errs = {};
    if (!editName.trim()) errs.name = "Name is required";
    if (!editMobile.trim()) {
      errs.mobile = "Mobile is required";
    } else if (!/^[6-9]\d{9}$/.test(editMobile)) {
      errs.mobile = "Enter a valid 10-digit mobile number";
    }
    return errs;
  };

  const handleSave = async () => {
    const errs = validateEdit();
    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      await updateCustomerProfile({ name: editName, mobile: editMobile });
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        localStorage.setItem("user", JSON.stringify({ ...u, name: editName, mobile: editMobile }));
      }
      await fetchProfile();
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err?.response?.data?.message || "Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditName(profile?.name || "");
    setEditMobile(profile?.mobile || "");
    setEditErrors({});
    setSaveError("");
  };

  const handleLogout = () => {
    clearSession("logout");
    navigate("/login");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner" />
          <p>Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error-state">
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchProfile}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Floating Toast */}
      {saveSuccess && (
        <div className="profile-toast profile-toast--success">
          <IoCheckmarkOutline size={18} />
          Profile updated successfully!
        </div>
      )}
      <div className="profile-container">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-avatar-wrap">
            {/* Avatar with pencil edit overlay */}
            <div className="profile-avatar-container">
              {avatarPhoto ? (
                <img
                  src={avatarPhoto}
                  alt="Profile"
                  className="profile-avatar-photo"
                />
              ) : (
                <div className="profile-avatar-circle">{getInitials(profile?.name)}</div>
              )}
              {/* Pencil button */}
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
              <p className="profile-avatar-name">{profile?.name}</p>
            </div>
          </div>

          <nav className="profile-nav">
            <Link to="/profile" className="profile-nav-item profile-nav-item--active">
              <IoPersonOutline size={18} />
              My Profile
            </Link>
            <Link to="/orders" className="profile-nav-item">
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

        {/* Main */}
        <main className="profile-main">
          <div className="profile-main-header">
            <div>
              <h1 className="profile-main-title">My Profile</h1>
              <p className="profile-main-sub">Manage your personal information</p>
            </div>
            {!editing && (
              <button className="profile-edit-btn" onClick={() => setEditing(true)}>
                <IoPencilOutline size={16} />
                Edit Profile
              </button>
            )}
          </div>



          <div className="profile-card">
            <div className="profile-card-header">
              <h2 className="profile-card-title">Personal Information</h2>
            </div>

            {editing ? (
              <div className="profile-edit-form">
                {saveError && <div className="profile-form-error">{saveError}</div>}

                <div className="profile-field">
                  <label className="profile-field-label">
                    <IoPersonOutline size={15} /> Full Name
                  </label>
                  <input
                    type="text"
                    className={`profile-input ${editErrors.name ? "profile-input--error" : ""}`}
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      if (editErrors.name) setEditErrors((p) => ({ ...p, name: "" }));
                    }}
                    placeholder="Enter your full name"
                  />
                  {editErrors.name && <span className="profile-field-error">{editErrors.name}</span>}
                </div>

                <div className="profile-field">
                  <label className="profile-field-label">
                    <IoCallOutline size={15} /> Mobile Number
                  </label>
                  <input
                    type="tel"
                    className={`profile-input ${editErrors.mobile ? "profile-input--error" : ""}`}
                    value={editMobile}
                    onChange={(e) => {
                      setEditMobile(e.target.value);
                      if (editErrors.mobile) setEditErrors((p) => ({ ...p, mobile: "" }));
                    }}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    inputMode="numeric"
                  />
                  {editErrors.mobile && (
                    <span className="profile-field-error">{editErrors.mobile}</span>
                  )}
                </div>

                <div className="profile-edit-actions">
                  <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
                    <IoCheckmarkOutline size={16} />
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button className="profile-cancel-btn" onClick={handleCancelEdit} disabled={saving}>
                    <IoCloseOutline size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <span className="profile-info-icon">
                    <IoPersonOutline size={18} />
                  </span>
                  <div className="profile-info-content">
                    <p className="profile-info-label">Full Name</p>
                    <p className="profile-info-value">{profile?.name || "—"}</p>
                  </div>
                </div>

                <div className="profile-info-item">
                  <span className="profile-info-icon">
                    <IoMailOutline size={18} />
                  </span>
                  <div className="profile-info-content">
                    <p className="profile-info-label">Email Address</p>
                    <p className="profile-info-value">{profile?.email || "—"}</p>
                  </div>
                </div>

                <div className="profile-info-item">
                  <span className="profile-info-icon">
                    <IoCallOutline size={18} />
                  </span>
                  <div className="profile-info-content">
                    <p className="profile-info-label">Mobile Number</p>
                    <p className="profile-info-value">{profile?.mobile || "—"}</p>
                  </div>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-icon">
                    <IoCalendarOutline size={18} />
                  </span>
                  <div className="profile-info-content">
                    <p className="profile-info-label">Member Since</p>
                    <p className="profile-info-value">{formatDate(profile?.created_at)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="profile-card profile-quick-links">
            <h2 className="profile-card-title">Quick Actions</h2>
            <div className="profile-quick-grid">
              <Link to="/orders" className="profile-quick-item">
                <IoBagCheckOutline size={22} />
                <span>My Orders</span>
              </Link>
              <Link to="/add-address" className="profile-quick-item">
                <IoAddCircleOutline size={22} />
                <span>Add Address</span>
              </Link>
              <button
                type="button"
                className="profile-quick-item profile-quick-item--btn"
                onClick={() => setShowCouponModal(true)}
              >
                <IoTicketOutline size={22} />
                <span>Coupon History</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Coupon History Modal */}
      {showCouponModal && (
        <div className="coupon-modal-overlay" onClick={() => setShowCouponModal(false)}>
          <div className="coupon-modal" onClick={(e) => e.stopPropagation()}>
            <div className="coupon-modal-header">
              <div className="coupon-modal-title-group">
                <span className="coupon-modal-icon">
                  <IoTicketOutline size={22} />
                </span>
                <div>
                  <h2 className="coupon-modal-title">Coupon & Promo History</h2>
                  <p className="coupon-modal-sub">
                    View active vouchers, discounts, and past redemption records
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="coupon-modal-close"
                onClick={() => setShowCouponModal(false)}
                title="Close"
              >
                <IoCloseOutline size={22} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="coupon-modal-tabs">
              <button
                type="button"
                className={`coupon-tab-btn ${couponTab === "available" ? "active" : ""}`}
                onClick={() => setCouponTab("available")}
              >
                Active Coupons ({availableCoupons.length})
              </button>
              <button
                type="button"
                className={`coupon-tab-btn ${couponTab === "used" ? "active" : ""}`}
                onClick={() => setCouponTab("used")}
              >
                Redemption History ({usedCoupons.length})
              </button>
            </div>

            {/* Modal Body */}
            <div className="coupon-modal-body">
              {couponTab === "available" ? (
                <div className="coupon-list">
                  {availableCoupons.map((c) => (
                    <div key={c.code} className="coupon-card">
                      <div className="coupon-card-left">
                        <span className="coupon-card-tag">{c.tag}</span>
                        <div className="coupon-card-discount">{c.discount}</div>
                        <span className="coupon-card-min">{c.minSpend}</span>
                      </div>
                      <div className="coupon-card-divider">
                        <div className="coupon-card-notch top" />
                        <div className="coupon-card-line" />
                        <div className="coupon-card-notch bottom" />
                      </div>
                      <div className="coupon-card-right">
                        <div>
                          <div className="coupon-card-code-wrap">
                            <span className="coupon-card-code">{c.code}</span>
                            <button
                              type="button"
                              className={`coupon-copy-btn ${copiedCode === c.code ? "copied" : ""}`}
                              onClick={() => handleCopyCode(c.code)}
                            >
                              {copiedCode === c.code ? (
                                <>
                                  <IoCheckmarkCircleOutline size={15} /> Copied!
                                </>
                              ) : (
                                <>
                                  <IoCopyOutline size={14} /> Copy Code
                                </>
                              )}
                            </button>
                          </div>
                          <p className="coupon-card-desc">{c.desc}</p>
                        </div>
                        <div className="coupon-card-expires">{c.expires}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="coupon-history-list">
                  {usedCoupons.map((u, idx) => (
                    <div key={idx} className="coupon-history-item">
                      <div className="coupon-history-info">
                        <div className="coupon-history-code-row">
                          <span className="coupon-history-code">{u.code}</span>
                          <span className={`coupon-status-badge ${u.status.toLowerCase()}`}>
                            {u.status}
                          </span>
                        </div>
                        <div className="coupon-history-order">
                          Order: <strong>{u.orderId}</strong> • Date: {u.usedDate}
                        </div>
                      </div>
                      <div className="coupon-history-savings">
                        <span className="coupon-savings-label">Discount</span>
                        <span className="coupon-savings-val">
                          {u.status === "Redeemed" ? `Saved ${u.saved}` : u.discount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="coupon-modal-footer">
              <span className="coupon-footer-hint">
                💡 Tip: Copy any active code and paste it in the Cart page during checkout.
              </span>
              <button
                type="button"
                className="btn-primary coupon-footer-btn"
                onClick={() => {
                  setShowCouponModal(false);
                  navigate("/cart");
                }}
              >
                Go to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
