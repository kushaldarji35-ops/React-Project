import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoCalendarOutline,
  IoPencilOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoKeyOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoLockClosedOutline,
} from "react-icons/io5";
import AdminSidebar from "./AdminSidebar";
import {
  getCustomerProfile,
  updateCustomerProfile,
  changeCustomerPassword,
  isSessionExpired,
  clearSession,
} from "../../services/authService";
import "./AdminPages.css";

export default function AdminProfile() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  const [profile, setProfile] = useState(null);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editErrors, setEditErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
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
      const data = await getCustomerProfile();
      if (data) {
        setProfile(data);
        setEditName(data.name || "");
        setEditMobile(data.mobile || "");
        setCurrentUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      }
    } catch {
      // Fallback to localStorage data
      const saved = JSON.parse(localStorage.getItem("user") || "{}");
      setProfile(saved);
      setEditName(saved.name || "");
      setEditMobile(saved.mobile || "");
    }
  };

  const getInitials = (name) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "March 2024";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!editName.trim()) errors.name = "Full name is required";
    if (!editMobile.trim()) {
      errors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(editMobile.trim())) {
      errors.mobile = "Enter a valid 10-digit mobile number";
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setSavingProfile(true);
    setEditErrors({});

    try {
      await updateCustomerProfile({
        name: editName.trim(),
        mobile: editMobile.trim(),
      });

      const updated = {
        ...currentUser,
        name: editName.trim(),
        mobile: editMobile.trim(),
      };
      localStorage.setItem("user", JSON.stringify(updated));
      setCurrentUser(updated);
      setProfile((prev) => ({ ...prev, ...updated }));
      setIsEditing(false);
      showToast("Admin profile updated successfully!");
    } catch (err) {
      setEditErrors({
        form: err?.response?.data?.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(profile?.name || currentUser?.name || "");
    setEditMobile(profile?.mobile || currentUser?.mobile || "");
    setEditErrors({});
  };

  // Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!currentPassword) errors.current = "Current password is required";
    if (!newPassword) {
      errors.new = "New password is required";
    } else if (newPassword.length < 6) {
      errors.new = "Password must be at least 6 characters";
    }
    if (newPassword !== confirmPassword) {
      errors.confirm = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setSavingPassword(true);
    setPasswordErrors({});

    try {
      await changeCustomerPassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password updated successfully!");
    } catch (err) {
      setPasswordErrors({
        form: err?.response?.data?.message || "Incorrect current password. Please try again.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const displayName = profile?.name || currentUser?.name || "Admin User";
  const displayEmail = profile?.email || currentUser?.email || "admin@shop.co";
  const displayMobile = profile?.mobile || currentUser?.mobile || "—";
  const displayRole = (profile?.role || currentUser?.role || "admin").toUpperCase();

  return (
    <div className="adm-page">
      <AdminSidebar />

      <main className="adm-main" style={{ padding: "20px 32px" }}>
        {/* Floating Toast */}
        {toastMessage && (
          <div
            style={{
              position: "fixed",
              top: 20,
              right: 24,
              background: "#10b981",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "13.5px",
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
        <div className="adm-header" style={{ marginBottom: 18 }}>
          <div className="adm-header-left">
            <h1 className="adm-title" style={{ fontSize: 22 }}>Admin Profile</h1>
            <p className="adm-subtitle" style={{ fontSize: 13 }}>
              Manage your administrator credentials and security settings
            </p>
          </div>
          <div className="adm-header-right">
            <div className="adm-user-chip" style={{ padding: "4px 12px 4px 6px" }}>
              <div className="adm-user-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>
                {getInitials(displayName)}
              </div>
              <div className="adm-user-info">
                <span className="adm-user-name" style={{ fontSize: 13 }}>{displayName}</span>
                <span className="adm-user-role" style={{ fontSize: 11 }}>Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Card: Displays administrator avatar initials, system role (ADMINISTRATOR badge), name, and email */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "var(--adm-radius)",
            border: "1px solid var(--adm-border)",
            boxShadow: "var(--adm-shadow-sm)",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
            marginBottom: 16,
            maxWidth: 1200,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#0f172a",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 800,
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.15)",
                flexShrink: 0,
              }}
            >
              {getInitials(displayName)}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 800, color: "var(--adm-text-primary)" }}>
                  {displayName}
                </h2>
                <span
                  style={{
                    background: "#6366f1",
                    color: "#ffffff",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 5,
                    letterSpacing: "0.5px",
                  }}
                >
                  ADMIN
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--adm-text-secondary)" }}>
                {displayEmail}
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              className="adm-btn-primary"
              onClick={() => setIsEditing(true)}
            >
              <IoPencilOutline size={16} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Side-by-Side Grid: Left = Personal Information, Right = Change Password */}
        <div className="adm-profile-grid">
          {/* Left Side: Personal Information Card */}
          <div className="adm-profile-panel" style={{ height: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                borderBottom: "1px solid var(--adm-border)",
                paddingBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <IoPersonOutline size={18} color="#6366f1" />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
                  Personal Information
                </h3>
              </div>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)}>
                  
                </button>
              )}
            </div>

            {editErrors.form && (
              <div
                style={{
                  background: "#fef2f2",
                  color: "#ef4444",
                  padding: "8px 12px",
                  borderRadius: 6,
                  fontSize: 12.5,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                {editErrors.form}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSaveProfile}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <div className="adm-form-group" style={{ marginBottom: 0 }}>
                    <label className="adm-form-label" style={{ fontSize: 12 }}>Full Name *</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      style={{ padding: "8px 12px", fontSize: 13 }}
                      value={editName}
                      onChange={(e) => {
                        setEditName(e.target.value);
                        if (editErrors.name) setEditErrors((p) => ({ ...p, name: "" }));
                      }}
                      placeholder="Enter administrator full name"
                    />
                    {editErrors.name && (
                      <span style={{ color: "#ef4444", fontSize: 11.5 }}>{editErrors.name}</span>
                    )}
                  </div>

                  <div className="adm-form-group" style={{ marginBottom: 0 }}>
                    <label className="adm-form-label" style={{ fontSize: 12 }}>Mobile Number *</label>
                    <input
                      type="tel"
                      className="adm-form-input"
                      style={{ padding: "8px 12px", fontSize: 13 }}
                      value={editMobile}
                      maxLength={10}
                      onChange={(e) => {
                        setEditMobile(e.target.value);
                        if (editErrors.mobile) setEditErrors((p) => ({ ...p, mobile: "" }));
                      }}
                      placeholder="10-digit mobile number"
                    />
                    {editErrors.mobile && (
                      <span style={{ color: "#ef4444", fontSize: 11.5 }}>{editErrors.mobile}</span>
                    )}
                  </div>

                  <div className="adm-form-group" style={{ marginBottom: 0 }}>
                    <label className="adm-form-label" style={{ fontSize: 12 }}>Email (Read-only)</label>
                    <input
                      type="email"
                      className="adm-form-input"
                      value={displayEmail}
                      disabled
                      style={{
                        padding: "8px 12px",
                        fontSize: 13,
                        background: "#f1f5f9",
                        cursor: "not-allowed",
                        color: "#64748b",
                      }}
                    />
                  </div>

                  <div className="adm-form-group" style={{ marginBottom: 0 }}>
                    <label className="adm-form-label" style={{ fontSize: 12 }}>System Role</label>
                    <input
                      type="text"
                      className="adm-form-input"
                      value={displayRole}
                      disabled
                      style={{
                        padding: "8px 12px",
                        fontSize: 13,
                        background: "#f1f5f9",
                        cursor: "not-allowed",
                        color: "#64748b",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="adm-btn-secondary"
                    onClick={handleCancelEdit}
                    disabled={savingProfile}
                  >
                    <IoCloseOutline size={16} />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    className="adm-btn-primary"
                    disabled={savingProfile}
                  >
                    <IoCheckmarkOutline size={16} />
                    <span>{savingProfile ? "Saving…" : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "18px 20px",
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#475569",
                      flexShrink: 0,
                    }}
                  >
                    <IoPersonOutline size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 11.5, color: "var(--adm-text-muted)", fontWeight: 600 }}>
                      Full Name
                    </span>
                    <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: "var(--adm-text-primary)" }}>
                      {displayName}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#475569",
                      flexShrink: 0,
                    }}
                  >
                    <IoMailOutline size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 11.5, color: "var(--adm-text-muted)", fontWeight: 600 }}>
                      Email Address
                    </span>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--adm-text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={displayEmail}
                    >
                      {displayEmail}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#475569",
                      flexShrink: 0,
                    }}
                  >
                    <IoCallOutline size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 11.5, color: "var(--adm-text-muted)", fontWeight: 600 }}>
                      Mobile Number
                    </span>
                    <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: "var(--adm-text-primary)" }}>
                      {displayMobile}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#475569",
                      flexShrink: 0,
                    }}
                  >
                    <IoCalendarOutline size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 11.5, color: "var(--adm-text-muted)", fontWeight: 600 }}>
                      Member Since
                    </span>
                    <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: "var(--adm-text-primary)" }}>
                      {formatDate(profile?.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Change Password Card */}
          <div className="adm-profile-panel" style={{ height: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                borderBottom: "1px solid var(--adm-border)",
                paddingBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <IoLockClosedOutline size={18} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
                  Change Password
                </h3>
              </div>
            </div>

            {passwordErrors.form && (
              <div
                style={{
                  background: "#fef2f2",
                  color: "#ef4444",
                  padding: "8px 12px",
                  borderRadius: 6,
                  fontSize: 12.5,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                {passwordErrors.form}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div className="adm-form-group" style={{ marginBottom: 0 }}>
                  <label className="adm-form-label" style={{ fontSize: 12 }}>Current Password *</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className="adm-form-input"
                      style={{ width: "100%", padding: "8px 36px 8px 12px", fontSize: 13 }}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        if (passwordErrors.current) {
                          setPasswordErrors((p) => ({ ...p, current: "" }));
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((p) => !p)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                      }}
                    >
                      {showCurrentPassword ? <IoEyeOffOutline size={16} /> : <IoEyeOutline size={16} />}
                    </button>
                  </div>
                  {passwordErrors.current && (
                    <span style={{ color: "#ef4444", fontSize: 11.5 }}>
                      {passwordErrors.current}
                    </span>
                  )}
                </div>

                <div className="adm-form-group" style={{ marginBottom: 0 }}>
                  <label className="adm-form-label" style={{ fontSize: 12 }}>New Password *</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="adm-form-input"
                      style={{ width: "100%", padding: "8px 36px 8px 12px", fontSize: 13 }}
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (passwordErrors.new) setPasswordErrors((p) => ({ ...p, new: "" }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((p) => !p)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                      }}
                    >
                      {showNewPassword ? <IoEyeOffOutline size={16} /> : <IoEyeOutline size={16} />}
                    </button>
                  </div>
                  {passwordErrors.new && (
                    <span style={{ color: "#ef4444", fontSize: 11.5 }}>{passwordErrors.new}</span>
                  )}
                </div>

                <div className="adm-form-group" style={{ marginBottom: 0 }}>
                  <label className="adm-form-label" style={{ fontSize: 12 }}>Confirm New Password *</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="adm-form-input"
                      style={{ width: "100%", padding: "8px 36px 8px 12px", fontSize: 13 }}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passwordErrors.confirm) {
                          setPasswordErrors((p) => ({ ...p, confirm: "" }));
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                      }}
                    >
                      {showConfirmPassword ? <IoEyeOffOutline size={16} /> : <IoEyeOutline size={16} />}
                    </button>
                  </div>
                  {passwordErrors.confirm && (
                    <span style={{ color: "#ef4444", fontSize: 11.5 }}>
                      {passwordErrors.confirm}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="adm-btn-primary"
                  disabled={savingPassword}
                >
                  <IoKeyOutline size={16} />
                  <span>{savingPassword ? "Updating…" : "Update Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
