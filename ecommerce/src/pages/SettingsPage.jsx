import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IoEyeOutline,
  IoEyeOffOutline,
  IoCheckmarkOutline,
  IoLockClosedOutline,
  IoPersonOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoAddCircleOutline,
  IoShieldOutline,
  IoTrashOutline,
  IoWarningOutline,
  IoPencilOutline,
  IoBagCheckOutline,
} from "react-icons/io5";
import {
  changeCustomerPassword,
  deleteCustomerAccount,
  isSessionExpired,
  clearSession,
} from "../services/authService";
import "./ProfilePage.css";
import "./SettingsPage.css";

export default function SettingsPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Get user from localStorage
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isSessionExpired()) {
      clearSession("expired");
      navigate("/login?expired=1");
    }
  }, [navigate]);

  const validate = () => {
    const errs = {};
    if (!form.currentPassword)
      errs.currentPassword = "Current password is required";
    if (!form.newPassword) {
      errs.newPassword = "New password is required";
    } else if (form.newPassword.length < 6) {
      errs.newPassword = "New password must be at least 6 characters";
    } else if (form.newPassword === form.currentPassword) {
      errs.newPassword = "New password must be different from current password";
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = "Please confirm your new password";
    } else if (form.newPassword !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setServerError("");
    setSuccess(false);
    try {
      await changeCustomerPassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setServerError(
        err?.response?.data?.message || "Failed to change password. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession("logout");
    navigate("/login");
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

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Sidebar — same as ProfilePage */}
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
                <div className="profile-avatar-circle">
                  {getInitials(user?.name)}
                </div>
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
              <p className="profile-avatar-name">{user?.name || "User"}</p>
            </div>
          </div>

          <nav className="profile-nav">
            <Link to="/profile" className="profile-nav-item">
              <IoPersonOutline size={18} />
              My Profile
            </Link>
            <Link to="/orders" className="profile-nav-item">
              <IoBagCheckOutline size={18} />
              My Orders
            </Link>
            <Link
              to="/settings"
              className="profile-nav-item profile-nav-item--active"
            >
              <IoSettingsOutline size={18} />
              Settings
            </Link>
            <Link to="/add-address" className="profile-nav-item">
              <IoAddCircleOutline size={18} />
              Add Address
            </Link>
            <button
              className="profile-nav-item profile-nav-item--logout"
              onClick={handleLogout}
            >
              <IoLogOutOutline size={18} />
              Logout
            </button>
          </nav>
        </aside>

        {/* Main */}
        <main className="profile-main">
          <div className="profile-main-header">
            <div>
              <h1 className="profile-main-title">Settings</h1>
              <p className="profile-main-sub">
                Manage your account security and preferences
              </p>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h2 className="profile-card-title">
                <IoLockClosedOutline
                  size={18}
                  style={{ verticalAlign: "middle", marginRight: 8 }}
                />
                Change Password
              </h2>
            </div>

            {success && (
              <div
                className="profile-toast profile-toast--success"
                style={{ marginBottom: 20 }}
              >
                <IoCheckmarkOutline size={18} />
                Password changed successfully!
              </div>
            )}

            {serverError && (
              <div className="profile-form-error" style={{ marginBottom: 20 }}>
                {serverError}
              </div>
            )}

            <form className="settings-form" onSubmit={handleSubmit} noValidate>
              {/* Current Password */}
              <div className="profile-field">
                <label className="profile-field-label">Current Password</label>
                <div className="settings-input-wrap">
                  <input
                    type={showCurrent ? "text" : "password"}
                    name="currentPassword"
                    className={`profile-input ${errors.currentPassword ? "profile-input--error" : ""}`}
                    value={form.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="settings-eye-btn"
                    onClick={() => setShowCurrent((p) => !p)}
                    aria-label={showCurrent ? "Hide" : "Show"}
                  >
                    {showCurrent ? (
                      <IoEyeOffOutline size={18} />
                    ) : (
                      <IoEyeOutline size={18} />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <span className="profile-field-error">
                    {errors.currentPassword}
                  </span>
                )}
              </div>

              {/* New Password */}
              <div className="profile-field">
                <label className="profile-field-label">New Password</label>
                <div className="settings-input-wrap">
                  <input
                    type={showNew ? "text" : "password"}
                    name="newPassword"
                    className={`profile-input ${errors.newPassword ? "profile-input--error" : ""}`}
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="settings-eye-btn"
                    onClick={() => setShowNew((p) => !p)}
                    aria-label={showNew ? "Hide" : "Show"}
                  >
                    {showNew ? (
                      <IoEyeOffOutline size={18} />
                    ) : (
                      <IoEyeOutline size={18} />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <span className="profile-field-error">
                    {errors.newPassword}
                  </span>
                )}

                {/* Password strength indicator */}
                {form.newPassword && (
                  <div className="settings-strength">
                    {(() => {
                      const p = form.newPassword;
                      let score = 0;
                      if (p.length >= 6) score++;
                      if (p.length >= 10) score++;
                      if (/[A-Z]/.test(p)) score++;
                      if (/[0-9]/.test(p)) score++;
                      if (/[^A-Za-z0-9]/.test(p)) score++;
                      const label =
                        score <= 1 ? "Weak" : score <= 3 ? "Fair" : "Strong";
                      const cls =
                        score <= 1 ? "weak" : score <= 3 ? "fair" : "strong";
                      return (
                        <>
                          <div className="settings-strength-bars">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                className={`settings-strength-bar ${i <= score ? `settings-strength-bar--${cls}` : ""}`}
                              />
                            ))}
                          </div>
                          <span
                            className={`settings-strength-label settings-strength-label--${cls}`}
                          >
                            {label}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="profile-field">
                <label className="profile-field-label">
                  Confirm New Password
                </label>
                <div className="settings-input-wrap">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    className={`profile-input ${errors.confirmPassword ? "profile-input--error" : ""}`}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="settings-eye-btn"
                    onClick={() => setShowConfirm((p) => !p)}
                    aria-label={showConfirm ? "Hide" : "Show"}
                  >
                    {showConfirm ? (
                      <IoEyeOffOutline size={18} />
                    ) : (
                      <IoEyeOutline size={18} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="profile-field-error">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <div className="profile-edit-actions">
                <button
                  type="submit"
                  className="profile-save-btn"
                  disabled={loading}
                >
                  <IoLockClosedOutline size={16} />
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </div>
            </form>
          </div>

          {/* Account Security Info */}
          <div className="profile-card settings-security-card">
            <h2 className="profile-card-title">
              <IoShieldOutline
                size={18}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              Account Security
            </h2>
            <ul className="settings-tips">
              <li>
                Use a strong password with a mix of letters, numbers, and
                symbols.
              </li>
              <li>Never share your password with anyone.</li>
              <li>Change your password regularly to keep your account safe.</li>
              <li>
                Registered email: <strong>{user?.email || "—"}</strong>
              </li>
            </ul>
          </div>

          {/* Delete Account Card */}
          <div className="profile-card settings-danger-card">
            <h2 className="profile-card-title settings-danger-title">
              <IoTrashOutline
                size={18}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              Delete Account
            </h2>
            <p className="settings-danger-desc">
              Permanently delete your account and all associated data. This
              action <strong>cannot be undone</strong>.
            </p>
            <button
              className="settings-danger-btn"
              onClick={() => {
                setShowDeleteModal(true);
                setDeleteConfirmText("");
                setDeleteError("");
              }}
            >
              <IoTrashOutline size={16} />
              Delete My Account
            </button>
          </div>
        </main>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div
          className="delete-modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <IoWarningOutline size={36} />
            </div>
            <h2 className="delete-modal-title">Delete Account?</h2>
            <p className="delete-modal-desc">
              This will permanently remove your account, profile, and all order
              history.
              <br />
              <strong>This cannot be undone.</strong>
            </p>

            <div className="delete-modal-confirm-wrap">
              <label className="delete-modal-label">
                Type <strong>DELETE</strong> to confirm
              </label>
              <input
                type="text"
                className="delete-modal-input"
                value={deleteConfirmText}
                onChange={(e) => {
                  setDeleteConfirmText(e.target.value);
                  setDeleteError("");
                }}
                placeholder="Type DELETE here"
                autoComplete="off"
              />
              {deleteError && (
                <span className="profile-field-error">{deleteError}</span>
              )}
            </div>

            <div className="delete-modal-actions">
              <button
                className="delete-modal-cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="delete-modal-confirm"
                disabled={deleteLoading}
                onClick={async () => {
                  if (deleteConfirmText.trim() !== "DELETE") {
                    setDeleteError('Please type "DELETE" exactly to confirm.');
                    return;
                  }
                  setDeleteLoading(true);
                  setDeleteError("");
                  try {
                    await deleteCustomerAccount();
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/signup");
                  } catch (err) {
                    setDeleteError(
                      err?.response?.data?.message ||
                        "Failed to delete account. Try again.",
                    );
                    setDeleteLoading(false);
                  }
                }}
              >
                <IoTrashOutline size={15} />
                {deleteLoading ? "Deleting…" : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
