import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IoPersonOutline,
  IoSettingsOutline,
  IoAddCircleOutline,
  IoLogOutOutline,
  IoLocationOutline,
  IoTrashOutline,
  IoPencilOutline,
  IoCheckmarkCircle,
  IoHomeOutline,
  IoBriefcaseOutline,
  IoBusinessOutline,
  IoEllipsisHorizontalOutline,
  IoBagCheckOutline,
} from "react-icons/io5";
import {
  getAddresses,
  saveAddress,
  updateAddress,
  deleteAddress,
  isSessionExpired,
  clearSession,
} from "../services/authService";
import "./ProfilePage.css";
import "./AddressPage.css";

const TYPE_ICONS = {
  home: <IoHomeOutline size={16} />,
  apartment: <IoBusinessOutline size={16} />,
  business: <IoBriefcaseOutline size={16} />,
  other: <IoEllipsisHorizontalOutline size={16} />,
};

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
];

const EMPTY_FORM = {
  full_name: "",
  mobile: "",
  email: "",
  line1: "",
  line2: "",
  line3: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  address_type: "home",
};

export default function AddressPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteId, setDeleteId] = useState(null);

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

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const storedName = storedUser?.name || "User";

  const fetchAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(data);
    } catch {
      setError("Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isSessionExpired()) {
      clearSession("expired");
      navigate("/login?expired=1");
      return;
    }
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleLogout = () => {
    clearSession("logout");
    navigate("/login");
  };

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEdit = (addr) => {
    setEditId(addr.id);
    setForm({
      full_name: addr.full_name || "",
      mobile: addr.mobile || "",
      email: addr.email || "",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      line3: addr.line3 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      country: addr.country || "India",
      address_type: addr.address_type || "home",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const required = [
      "full_name",
      "mobile",
      "line1",
      "city",
      "state",
      "pincode",
    ];
    for (const f of required) {
      if (!form[f] || !form[f].trim()) {
        setError("Please fill all required fields.");
        return;
      }
    }
    if (form.mobile.trim().length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (form.pincode.trim().length !== 6) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name,
        mobile: form.mobile,
        email: form.email,
        line1: form.line1,
        line2: form.line2,
        line3: form.line3,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: form.country || "India",
        address_type: form.address_type || "home",
      };
      if (editId) {
        await updateAddress(editId, payload);
        setSuccess("Address updated successfully!");
      } else {
        await saveAddress(payload);
        setSuccess("Address saved successfully!");
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      fetchAddresses();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setSuccess("Address deleted.");
    } catch {
      setError("Failed to delete address.");
    } finally {
      setDeleteId(null);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* ── Sidebar ── */}
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
                  {getInitials(storedName)}
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
              <p className="profile-avatar-name">{storedName}</p>
            </div>
          </div>
          <nav className="profile-nav">
            <Link to="/profile" className="profile-nav-item">
              <IoPersonOutline size={18} /> My Profile
            </Link>
            <Link to="/orders" className="profile-nav-item">
              <IoBagCheckOutline size={18} /> My Orders
            </Link>
            <Link to="/settings" className="profile-nav-item">
              <IoSettingsOutline size={18} /> Settings
            </Link>
            <Link
              to="/add-address"
              className="profile-nav-item profile-nav-item--active"
            >
              <IoAddCircleOutline size={18} /> Add Address
            </Link>
            <button
              className="profile-nav-item profile-nav-item--logout"
              onClick={handleLogout}
            >
              <IoLogOutOutline size={18} /> Logout
            </button>
          </nav>
        </aside>

        {/* ── Main ── */}
        <main className="address-main">
          {/* Header */}
          <div className="address-header">
            <div>
              <h2 className="address-title">Saved Addresses</h2>
              <p className="address-subtitle">Manage your delivery addresses</p>
            </div>
            {!showForm && (
              <button className="btn-add-address" onClick={openAdd}>
                <IoAddCircleOutline size={18} /> Add Address
              </button>
            )}
          </div>

          {/* Global messages */}
          {success && (
            <div className="addr-alert addr-alert--success">
              <IoCheckmarkCircle size={18} /> {success}
            </div>
          )}
          {error && <div className="addr-alert addr-alert--error">{error}</div>}

          {/* ── Form ── */}
          {showForm && (
            <div className="addr-form-card">
              <h3 className="addr-form-title">
                {editId ? "Edit Address" : "Add New Address"}
              </h3>

              {/* Address type selector */}
              <div className="addr-type-row">
                {["home", "apartment", "business", "other"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`addr-type-btn${form.address_type === t ? " addr-type-btn--active" : ""}`}
                    onClick={() => setForm({ ...form, address_type: t })}
                  >
                    {TYPE_ICONS[t]}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="addr-form" noValidate>
                <div className="addr-form-row">
                  <div className="addr-field">
                    <label>FULL NAME</label>
                    <input
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      placeholder="Enter Your Full Name"
                    />
                  </div>
                  <div className="addr-field">
                    <label>MOBILE NUMBER</label>
                    <input
                      name="mobile"
                      value={form.mobile}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      placeholder="Enter Your Mobile Number"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="addr-field">
                  <label>EMAIL ADDRESS (OPTIONAL)</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter Your Email Address"
                  />
                </div>

                <div className="addr-field">
                  <label>ADDRESS LINE 1</label>
                  <input
                    name="line1"
                    value={form.line1}
                    onChange={handleChange}
                    placeholder="Flat, House No., Building, Company, Apartment"
                  />
                </div>

                <div className="addr-field">
                  <label>ADDRESS LINE 2</label>
                  <input
                    name="line2"
                    value={form.line2}
                    onChange={handleChange}
                    placeholder="Area, Street, Sector, Village"
                  />
                </div>

                <div className="addr-field">
                  <label>ADDRESS LINE 3 (OPTIONAL)</label>
                  <input
                    name="line3"
                    value={form.line3}
                    onChange={handleChange}
                    placeholder="Landmark (E.g. near temple)"
                  />
                </div>

                <div className="addr-form-row addr-form-row--3">
                  <div className="addr-field">
                    <label>TOWN/CITY</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City Name"
                    />
                  </div>
                  <div className="addr-field">
                    <label>STATE</label>
                    <select
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className="addr-select"
                    >
                      <option value="">Select</option>
                      {STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="addr-field">
                    <label>PINCODE</label>
                    <input
                      name="pincode"
                      value={form.pincode}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                        })
                      }
                      placeholder="6 digit pincode"
                      maxLength={6}
                    />
                  </div>
                </div>

                {error && <p className="addr-form-error">{error}</p>}

                <div className="addr-form-actions">
                  <button
                    type="button"
                    className="btn-cancel-addr"
                    onClick={cancelForm}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-save-addr"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving…"
                      : editId
                        ? "Update Address"
                        : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Address cards list ── */}
          {loading ? (
            <div className="addr-loading">
              <div className="profile-spinner" />
              <p>Loading addresses…</p>
            </div>
          ) : addresses.length === 0 && !showForm ? (
            <div className="addr-empty">
              <IoLocationOutline size={56} />
              <h3>No saved addresses</h3>
              <p>Add a delivery address to make checkout faster.</p>
              <button className="btn-add-address" onClick={openAdd}>
                <IoAddCircleOutline size={18} /> Add Address
              </button>
            </div>
          ) : (
            <div className="addr-grid">
              {addresses.map((addr) => (
                <div className="addr-card" key={addr.id}>
                  <div className="addr-card-badge">
                    {TYPE_ICONS[addr.address_type]}
                    <span>
                      {addr.address_type.charAt(0).toUpperCase() +
                        addr.address_type.slice(1)}
                    </span>
                  </div>
                  <p className="addr-card-name">{addr.full_name}</p>
                  <p className="addr-card-line">{addr.line1}</p>
                  {addr.line2 && <p className="addr-card-line">{addr.line2}</p>}
                  <p className="addr-card-line">
                    {addr.city}, {addr.state} – {addr.pincode}
                  </p>
                  <p className="addr-card-line">{addr.country}</p>
                  <p className="addr-card-mobile">📞 {addr.mobile}</p>

                  <div className="addr-card-actions">
                    <button
                      className="addr-btn-edit"
                      onClick={() => openEdit(addr)}
                    >
                      <IoPencilOutline size={15} /> Edit
                    </button>
                    <button
                      className="addr-btn-delete"
                      onClick={() => handleDelete(addr.id)}
                      disabled={deleteId === addr.id}
                    >
                      <IoTrashOutline size={15} />
                      {deleteId === addr.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
