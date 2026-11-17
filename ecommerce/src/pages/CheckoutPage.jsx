import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  IoArrowBack,
  IoArrowForward,
  IoCheckmarkCircle,
  IoLocationOutline,
  IoCardOutline,
  IoShieldCheckmarkOutline,
  IoLockClosedOutline,
  IoCartOutline,
  IoCashOutline,
  IoPencilOutline,
  IoHomeOutline,
  IoBriefcaseOutline,
  IoTimeOutline,
  IoInformationCircleOutline,
  IoChevronDown,
  IoAddCircleOutline,
  IoTrashOutline,
} from "react-icons/io5";
import {
  MdPhoneAndroid,
  MdAccountBalance,
  MdLocationPin,
  MdPhone,
  MdEmail,
  MdApartment,
} from "react-icons/md";
import { useCart } from "../context/CartContext";
import {
  getAddresses,
  saveAddress,
  updateAddress,
  deleteAddress,
  isSessionExpired,
} from "../services/authService";
import { createOrder } from "../services/orderService";
import "./CheckoutPage.css";

/* ─── Step labels ─── */
const STEPS = ["Address", "Confirm", "Payment", "Success"];

/* ─── Indian states ─── */
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

/* ─── Delivery instructions / Address types ─── */
const DELIVERY_INSTRUCTIONS = [
  {
    id: "Home",
    label: "Home",
    icon: <IoHomeOutline size={20} />,
    timing: "6 AM - 11 PM Delivery",
    message:
      "Independent house, Villa or Builder floor (6 AM - 11 PM Delivery)",
  },
  {
    id: "Apartment",
    label: "Apartment",
    icon: <MdApartment size={20} />,
    timing: "6 AM - 11 PM Delivery",
    message: "Gated society, flats or Condominiums (6 AM - 11 PM Delivery)",
  },
  {
    id: "Business",
    label: "Business",
    icon: <IoBriefcaseOutline size={20} />,
    timing: "8 AM - 9 PM Delivery",
    message:
      "Office, retail store, hotel, hospital, malls (8 AM - 9 PM Delivery)",
  },
  {
    id: "Other",
    label: "Other",
    icon: <IoLocationOutline size={20} />,
    timing: "8 AM - 9 PM Delivery",
    message:
      "Other accommodations like hostel, PG, farmhouse, etc. (8 AM - 9 PM Delivery)",
  },
];

const COLOR_NAMES = {
  "#ffffff": "White",
  "#000000": "Black",
  "#8b0000": "Red",
  "#ff0000": "Red",
  "#000080": "Blue",
  "#0000ff": "Blue",
  "#4169e1": "Blue",
  "#708090": "Gray",
  "#808080": "Gray",
};
function formatColorName(c) {
  if (!c) return "";
  if (!c.startsWith("#")) return c.charAt(0).toUpperCase() + c.slice(1);
  return COLOR_NAMES[c.toLowerCase()] || c;
}

/* ─── Step indicator ─── */
function StepBar({ step }) {
  return (
    <div className="co-stepbar">
      {STEPS.map((label, i) => {
        const isLastStep = step === STEPS.length - 1;
        const isDone = isLastStep || i < step;
        const isActive = !isLastStep && i === step;
        return (
          <React.Fragment key={label}>
            <div
              className={`co-stepbar__step ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}
            >
              <div className="co-stepbar__circle">
                {isDone ? (
                  <IoCheckmarkCircle size={20} />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span className="co-stepbar__label">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`co-stepbar__line ${isDone ? "done" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── Order mini-summary (sidebar) ─── */
function OrderSidebar({
  cartItems,
  subtotal,
  discount,
  deliveryFee,
  finalTotal,
  appliedPromo,
  extraDiscount,
}) {
  return (
    <aside className="co-sidebar">
      <Link to="/" className="co-sidebar__brand">
        SHOP.CO
      </Link>
      <h3 className="co-sidebar__title">Order Summary</h3>
      <div className="co-sidebar__items">
        {cartItems.map((item) => (
          <div key={item.cartItemId} className="co-sidebar__item">
            <div className="co-sidebar__item-img">
              <img src={item.image} alt={item.name} />
              <span className="co-sidebar__item-qty">{item.quantity}</span>
            </div>
            <div className="co-sidebar__item-info">
              <p className="co-sidebar__item-name">{item.name}</p>
              <p className="co-sidebar__item-attr">
                {item.selectedSize} · {formatColorName(item.selectedColor)}
              </p>
            </div>
            <span className="co-sidebar__item-price">
              ${item.price * item.quantity}
            </span>
          </div>
        ))}
      </div>
      <div className="co-sidebar__divider" />
      <div className="co-sidebar__rows">
        <div className="co-sidebar__row">
          <span>Subtotal</span>
          <span>${subtotal}</span>
        </div>
        <div className="co-sidebar__row red">
          <span>Discount (20%)</span>
          <span>-${discount}</span>
        </div>
        {appliedPromo && (
          <div className="co-sidebar__row red">
            <span>Promo ({appliedPromo.code})</span>
            <span>-${extraDiscount}</span>
          </div>
        )}
        <div className="co-sidebar__row">
          <span>Delivery</span>
          <span>${deliveryFee}</span>
        </div>
      </div>
      <div className="co-sidebar__divider" />
      <div className="co-sidebar__total">
        <span>Total</span>
        <strong>${finalTotal}</strong>
      </div>
      <div className="co-sidebar__secure">
        <IoShieldCheckmarkOutline size={14} />
        <span>Secure &amp; encrypted checkout</span>
      </div>
    </aside>
  );
}

//Payment-only sidebar (Confirm step)
function PaymentSidebar({
  subtotal,
  discount,
  deliveryFee,
  finalTotal,
  appliedPromo,
  extraDiscount,
}) {
  return (
    <aside className="co-sidebar">
      <Link to="/" className="co-sidebar__brand">
        SHOP.CO
      </Link>
      <h3 className="co-sidebar__title">Payment Summary</h3>
      <div className="co-sidebar__rows">
        <div className="co-sidebar__row">
          <span>Subtotal</span>
          <span>${subtotal}</span>
        </div>
        <div className="co-sidebar__row red">
          <span>Discount (20%)</span>
          <span>-${discount}</span>
        </div>
        {appliedPromo && (
          <div className="co-sidebar__row red">
            <span>Promo ({appliedPromo.code})</span>
            <span>-${extraDiscount}</span>
          </div>
        )}
        <div className="co-sidebar__row">
          <span>Delivery</span>
          <span>${deliveryFee}</span>
        </div>
      </div>
      <div className="co-sidebar__divider" />
      <div className="co-sidebar__total">
        <span>Total</span>
        <strong>${finalTotal}</strong>
      </div>
      <div className="co-sidebar__secure">
        <IoShieldCheckmarkOutline size={14} />
        <span>Secure &amp; encrypted checkout</span>
      </div>
    </aside>
  );
}

//  STEP 1 — ADDRESS STEP (Saved Addresses or New Address Form)

const TYPE_ICONS = {
  home: <IoHomeOutline size={15} />,
  apartment: <MdApartment size={15} />,
  business: <IoBriefcaseOutline size={15} />,
  other: <IoLocationOutline size={15} />,
};

function AddressStep({ address, setAddress, onNext }) {
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Local form state
  const [formAddress, setFormAddress] = useState({
    fullName: address.fullName || "",
    mobile: address.mobile || "",
    email: address.email || "",
    line1: address.line1 || "",
    line2: address.line2 || "",
    line3: address.line3 || "",
    city: address.city || "",
    state: address.state || "",
    pincode: address.pincode || "",
    country: address.country || "India",
    deliveryType: address.deliveryType || "Home",
    deliveryNote: address.deliveryNote || "",
  });

  const [errors, setErrors] = useState({});
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  const initialAddressIdRef = useRef(address.id);

  // Sync DB address to parent state
  const applyDbAddressToParent = useCallback((addr, currentDeliveryNote = "") => {
    if (!addr) return;
    const typeCap = addr.address_type
      ? addr.address_type.charAt(0).toUpperCase() + addr.address_type.slice(1)
      : "Home";
    setAddress((prev) => ({
      ...prev,
      id: addr.id,
      fullName: addr.full_name || "",
      mobile: addr.mobile || "",
      email: addr.email || "",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      line3: addr.line3 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      country: addr.country || "India",
      deliveryType: typeCap,
      deliveryNote: currentDeliveryNote || prev.deliveryNote || "",
    }));
  }, [setAddress]);

  // Load saved addresses on mount
  useEffect(() => {
    let isMounted = true;
    const loadAddresses = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        if (isMounted) setLoadingSaved(false);
        return;
      }
      try {
        setLoadingSaved(true);
        const list = await getAddresses();
        if (isMounted && Array.isArray(list)) {
          setSavedAddresses(list);
          if (list.length > 0) {
            const currentSelected =
              list.find((a) => a.id === initialAddressIdRef.current) || list[0];
            setSelectedAddrId(currentSelected.id);
            applyDbAddressToParent(currentSelected);
          }
        }
      } catch (err) {
        console.error("Failed to load addresses:", err);
      } finally {
        if (isMounted) setLoadingSaved(false);
      }
    };
    loadAddresses();
    return () => {
      isMounted = false;
    };
  }, [applyDbAddressToParent]);

  const handleSelectAddress = (addr) => {
    setSelectedAddrId(addr.id);
    applyDbAddressToParent(addr);
  };

  const handleAddNewClick = () => {
    setEditingId(null);
    setFormAddress({
      fullName: "",
      mobile: "",
      email: "",
      line1: "",
      line2: "",
      line3: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      deliveryType: "Home",
      deliveryNote: address.deliveryNote || "",
    });
    setErrors({});
    setIsAddingNew(true);
  };

  const handleEditClick = (addr, e) => {
    e.stopPropagation();
    setEditingId(addr.id);
    const typeCap = addr.address_type
      ? addr.address_type.charAt(0).toUpperCase() + addr.address_type.slice(1)
      : "Home";
    setFormAddress({
      fullName: addr.full_name || "",
      mobile: addr.mobile || "",
      email: addr.email || "",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      line3: addr.line3 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      country: addr.country || "India",
      deliveryType: typeCap,
      deliveryNote: address.deliveryNote || "",
    });
    setErrors({});
    setIsAddingNew(true);
  };

  const handleDeleteClick = async (addrId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      setDeletingId(addrId);
      await deleteAddress(addrId);
      const remaining = savedAddresses.filter((a) => a.id !== addrId);
      setSavedAddresses(remaining);
      if (selectedAddrId === addrId) {
        if (remaining.length > 0) {
          setSelectedAddrId(remaining[0].id);
          applyDbAddressToParent(remaining[0]);
        } else {
          setSelectedAddrId(null);
          setIsAddingNew(true);
        }
      }
    } catch (err) {
      console.error("Failed to delete address:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelForm = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setErrors({});
    if (savedAddresses.length > 0) {
      const match =
        savedAddresses.find((a) => a.id === selectedAddrId) || savedAddresses[0];
      setSelectedAddrId(match.id);
      applyDbAddressToParent(match);
    }
  };

  const validateForm = () => {
    const e = {};
    if (!formAddress.fullName.trim()) e.fullName = "Please enter a full name";
    if (
      !formAddress.mobile.trim() ||
      !/^\d{10}$/.test(formAddress.mobile.replace(/\s/g, ""))
    )
      e.mobile = "Please enter a valid 10-digit mobile number";
    if (!formAddress.line1.trim()) e.line1 = "Please enter address line 1";
    if (!formAddress.city.trim()) e.city = "Please enter a city name";
    if (!formAddress.state) e.state = "Please select a state, region or province";
    if (!formAddress.pincode.trim() || !/^\d{6}$/.test(formAddress.pincode))
      e.pincode = "Please enter a 6-digit postal code";
    return e;
  };

  const FIELD_ORDER = [
    "fullName",
    "mobile",
    "line1",
    "line2",
    "city",
    "state",
    "pincode",
  ];

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstErrKey = FIELD_ORDER.find((k) => errs[k]);
      if (firstErrKey) {
        const el = document.getElementById(`field-${firstErrKey}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus();
        }
      }
      return;
    }

    const token = localStorage.getItem("token");
    setSaving(true);

    try {
      let activeAddrId = editingId;
      if (token) {
        const dbPayload = {
          full_name: formAddress.fullName,
          mobile: formAddress.mobile,
          line1: formAddress.line1,
          line2: formAddress.line2 || "",
          line3: formAddress.line3 || "",
          city: formAddress.city,
          state: formAddress.state,
          pincode: formAddress.pincode,
          country: formAddress.country || "India",
          address_type: (formAddress.deliveryType || "home").toLowerCase(),
        };

        if (editingId) {
          await updateAddress(editingId, dbPayload);
        } else {
          const res = await saveAddress(dbPayload);
          activeAddrId = res?.addressId || null;
        }

        // Refresh list
        const updatedList = await getAddresses();
        if (Array.isArray(updatedList)) {
          setSavedAddresses(updatedList);
        }
      }

      // Update parent checkout address
      setAddress({
        ...formAddress,
        id: activeAddrId,
      });

      onNext();
    } catch (err) {
      console.error("Error saving address during checkout:", err);
      // Still proceed with the checkout state
      setAddress({
        ...formAddress,
        id: editingId || null,
      });
      onNext();
    } finally {
      setSaving(false);
    }
  };

  const handleDeliverToSelected = () => {
    const selected = savedAddresses.find((a) => a.id === selectedAddrId);
    if (!selected && savedAddresses.length > 0) {
      handleSelectAddress(savedAddresses[0]);
    }
    onNext();
  };

  const selectedInstruction =
    DELIVERY_INSTRUCTIONS.find(
      (item) => item.id === (address.deliveryType || formAddress.deliveryType || "Home"),
    ) || DELIVERY_INSTRUCTIONS[0];

  const field = (
    key,
    label,
    placeholder,
    type = "text",
    maxLength,
    numericOnly,
  ) => (
    <div className="co-field">
      <label className="co-field__label">{label}</label>
      <input
        id={`field-${key}`}
        className={`co-field__input ${errors[key] ? "error" : ""}`}
        type={type}
        placeholder={placeholder}
        value={formAddress[key]}
        maxLength={maxLength}
        onKeyDown={
          numericOnly
            ? (e) => {
                if (
                  !/^\d$/.test(e.key) &&
                  ![
                    "Backspace",
                    "Delete",
                    "ArrowLeft",
                    "ArrowRight",
                    "Tab",
                  ].includes(e.key)
                ) {
                  e.preventDefault();
                }
              }
            : undefined
        }
        onChange={(e) => {
          const val = numericOnly
            ? e.target.value.replace(/\D/g, "")
            : e.target.value;
          setFormAddress((prev) => ({ ...prev, [key]: val }));
          setErrors((prev) => ({ ...prev, [key]: "" }));
        }}
      />
      {errors[key] && <p className="co-field__error">{errors[key]}</p>}
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // 1. SHOW SAVED ADDRESSES VIEW (If saved addresses exist & not adding/editing)
  // ─────────────────────────────────────────────────────────────
  if (!loadingSaved && savedAddresses.length > 0 && !isAddingNew) {
    return (
      <div className="co-saved-wrapper animate-fadeIn">
        {/* Header with Title & "+ Add New Address" Button */}
        <div className="co-saved-header">
          <div>
            <h2 className="co-saved-title">Saved Addresses</h2>
            <p className="co-saved-subtitle">Manage your delivery addresses</p>
          </div>
          <button
            type="button"
            className="co-btn-add-addr"
            onClick={handleAddNewClick}
          >
            <IoAddCircleOutline size={18} /> Add New Address
          </button>
        </div>

        {/* Saved Addresses Cards Grid */}
        <div className="co-saved-grid">
          {savedAddresses.map((addr) => {
            const isSelected = selectedAddrId === addr.id;
            const addrType = (addr.address_type || "home").toLowerCase();
            return (
              <div
                key={addr.id}
                className={`co-saved-card ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelectAddress(addr)}
              >
                {/* Badge & Radio */}
                <div className="co-saved-card__top">
                  <div className="co-saved-card__badge">
                    {TYPE_ICONS[addrType] || <IoHomeOutline size={15} />}
                    <span>
                      {addrType.charAt(0).toUpperCase() + addrType.slice(1)}
                    </span>
                  </div>
                  <div className="co-saved-card__radio">
                    <span className={`co-radio-circle ${isSelected ? "active" : ""}`}>
                      {isSelected && <span className="co-radio-circle__dot" />}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <h3 className="co-saved-card__name">{addr.full_name}</h3>
                <p className="co-saved-card__line">{addr.line1}</p>
                {addr.line2 && (
                  <p className="co-saved-card__line">{addr.line2}</p>
                )}
                {addr.line3 && (
                  <p className="co-saved-card__line">{addr.line3}</p>
                )}
                <p className="co-saved-card__line">
                  {addr.city}, {addr.state} — {addr.pincode}
                </p>
                <p className="co-saved-card__line">{addr.country || "India"}</p>

                {/* Phone */}
                <div className="co-saved-card__phone">
                  <MdPhone size={15} className="co-saved-card__phone-icon" />
                  <span>{addr.mobile}</span>
                </div>

                {/* Actions */}
                <div className="co-saved-card__actions">
                  <button
                    type="button"
                    className="co-saved-btn-edit"
                    onClick={(e) => handleEditClick(addr, e)}
                  >
                    <IoPencilOutline size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    className="co-saved-btn-delete"
                    disabled={deletingId === addr.id}
                    onClick={(e) => handleDeleteClick(addr.id, e)}
                  >
                    <IoTrashOutline size={14} />{" "}
                    {deletingId === addr.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="co-form__actions" style={{ marginTop: 24 }}>
          <Link to="/cart" className="co-btn co-btn--outline">
            <IoArrowBack size={16} /> Back to Cart
          </Link>
          <button
            type="button"
            className="co-btn co-btn--primary"
            onClick={handleDeliverToSelected}
          >
            Deliver to this Address <IoArrowForward size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. SHOW ADDRESS FORM (If no saved addresses OR adding/editing)
  // ─────────────────────────────────────────────────────────────
  return (
    <form className="co-form animate-fadeIn" onSubmit={handleFormSubmit} noValidate>
      <div className="co-form__header">
        <IoLocationOutline size={22} />
        <h2>
          {editingId
            ? "Edit Address"
            : savedAddresses.length > 0
              ? "Add New Delivery Address"
              : "Delivery Address"}
        </h2>
      </div>

      <div className="co-form__grid-2">
        {field("fullName", "Full Name", "Enter Your Full Name")}
        {field(
          "mobile",
          "Mobile Number",
          "Enter Your Mobile Number",
          "text",
          10,
          true,
        )}
      </div>

      {field("email", "Email Address (Optional)", "Enter Your Email Address")}
      {field(
        "line1",
        "Address Line 1",
        "Flat, House No., Building, Company, Apartment",
      )}
      {field("line2", "Address Line 2", "Area, Street, Sector, Village")}
      {field(
        "line3",
        "Address Line 3 (Optional)",
        "Landmark (E.g. near temple)",
      )}

      <div className="co-form__grid-3">
        {field("city", "Town/City", "City Name")}
        <div className="co-field">
          <label className="co-field__label">State</label>
          <select
            className={`co-field__input co-field__select ${errors.state ? "error" : ""}`}
            value={formAddress.state}
            onChange={(e) => {
              setFormAddress((prev) => ({ ...prev, state: e.target.value }));
              setErrors((prev) => ({ ...prev, state: "" }));
            }}
          >
            <option value="">Select</option>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.state && <p className="co-field__error">{errors.state}</p>}
        </div>
        {field("pincode", "Pincode", "6 digit pincode", "text", 6, true)}
      </div>

      {/* Delivery Instructions Dropdown */}
      <div
        className={`co-instructions-group ${isInstructionsOpen ? "is-open" : "is-closed"}`}
      >
        <button
          type="button"
          className="co-instructions-trigger"
          onClick={() => setIsInstructionsOpen((prev) => !prev)}
          aria-expanded={isInstructionsOpen}
        >
          <div className="co-instructions-trigger__left">
            <div className="co-instructions-trigger__icon">
              {selectedInstruction ? (
                selectedInstruction.icon
              ) : (
                <IoLocationOutline size={20} />
              )}
            </div>
            <div className="co-instructions-trigger__info">
              <span className="co-instructions-trigger__title">
                Update delivery instructions
              </span>
            </div>
          </div>
          <div className="co-instructions-trigger__right">
            <IoChevronDown
              className={`co-instructions-trigger__chevron ${isInstructionsOpen ? "rotate" : ""}`}
              size={18}
            />
          </div>
        </button>

        {isInstructionsOpen && (
          <div className="co-instructions-dropdown-body animate-fadeIn">
            <div className="co-instructions-grid">
              {DELIVERY_INSTRUCTIONS.map((item) => {
                const isSelected =
                  (formAddress.deliveryType || "Home") === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`co-instruction-card ${isSelected ? "active" : ""}`}
                    onClick={() => {
                      setFormAddress((prev) => ({
                        ...prev,
                        deliveryType: item.id,
                      }));
                    }}
                  >
                    <div className="co-instruction-card__top">
                      <span className="co-instruction-card__icon">
                        {item.icon}
                      </span>
                      <span className="co-instruction-card__radio">
                        {isSelected && (
                          <span className="co-instruction-card__radio-dot" />
                        )}
                      </span>
                    </div>
                    <div className="co-instruction-card__title">
                      {item.label}
                    </div>
                    <div className="co-instruction-card__timing">
                      {item.timing}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Message Box */}
            {selectedInstruction && (
              <div className="co-instruction-notice">
                <IoInformationCircleOutline
                  className="co-instruction-notice__icon"
                  size={20}
                />
                <div className="co-instruction-notice__content">
                  <div className="co-instruction-notice__header">
                    <strong>{selectedInstruction.label} Delivery</strong>
                    <span className="co-instruction-notice__timing-badge">
                      <IoTimeOutline size={13} /> {selectedInstruction.timing}
                    </span>
                  </div>
                  <p className="co-instruction-notice__message">
                    {selectedInstruction.message}
                  </p>
                </div>
              </div>
            )}

            {/* Optional delivery notes */}
            <div className="co-field co-instructions-notes">
              <label className="co-field__label">
                Additional Delivery Instructions (Optional)
              </label>
              <input
                className="co-field__input"
                type="text"
                placeholder="e.g. Leave with security guard, call before delivery, gate code"
                value={formAddress.deliveryNote || ""}
                onChange={(e) =>
                  setFormAddress((prev) => ({
                    ...prev,
                    deliveryNote: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        )}
      </div>

      <div className="co-form__actions">
        {savedAddresses.length > 0 ? (
          <button
            type="button"
            className="co-btn co-btn--outline"
            onClick={handleCancelForm}
          >
            Cancel
          </button>
        ) : (
          <Link to="/cart" className="co-btn co-btn--outline">
            <IoArrowBack size={16} /> Back to Cart
          </Link>
        )}
        <button
          type="submit"
          className="co-btn co-btn--primary"
          disabled={saving}
        >
          {saving
            ? "Saving…"
            : editingId
              ? "Update Address & Continue"
              : "Save Address & Continue"}{" "}
          <IoArrowForward size={16} />
        </button>
      </div>
    </form>
  );
}

//  STEP 2 — CONFIRM DETAILS

function ConfirmStep({ address, cartItems, finalTotal, onNext, onBack }) {
  return (
    <div className="co-confirm">
      <div className="co-form__header">
        <IoCheckmarkCircle size={22} />
        <h2>Confirm Your Order</h2>
      </div>

      <div className="co-confirm__card">
        <div className="co-confirm__card-head">
          <span className="co-confirm__card-title">
            <MdLocationPin
              size={16}
              style={{ verticalAlign: "middle", marginRight: 4 }}
            />{" "}
            Delivery Address
          </span>
          <button className="co-confirm__addr-edit-btn" onClick={onBack}>
            <IoPencilOutline size={13} /> Edit
          </button>
        </div>
        <div className="co-confirm__addr">
          <p className="co-confirm__addr-name">{address.fullName}</p>
          <p>
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}
          </p>
          <p>
            {address.city}, {address.state} — {address.pincode}
          </p>
          <p className="co-confirm__addr-phone">
            <MdPhone
              size={14}
              style={{ verticalAlign: "middle", marginRight: 4 }}
            />{" "}
            {address.mobile}
          </p>
          {address.email && (
            <p className="co-confirm__addr-email">
              <MdEmail
                size={14}
                style={{ verticalAlign: "middle", marginRight: 4 }}
              />{" "}
              {address.email}
            </p>
          )}
          {address.deliveryType && (
            <div className="co-confirm__instruction">
              <span className="co-confirm__instruction-badge">
                {address.deliveryType}
              </span>
              <span className="co-confirm__instruction-text">
                {
                  DELIVERY_INSTRUCTIONS.find(
                    (d) => d.id === address.deliveryType,
                  )?.message
                }
              </span>
            </div>
          )}
          {address.deliveryNote && (
            <p className="co-confirm__instruction-note">
              <strong>Instructions:</strong> {address.deliveryNote}
            </p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="co-confirm__card">
        <div className="co-confirm__card-head">
          <span className="co-confirm__card-title">
            🛍️ Items ({cartItems.length})
          </span>
        </div>
        {cartItems.map((item) => (
          <div key={item.cartItemId} className="co-confirm__item">
            <img
              src={item.image}
              alt={item.name}
              className="co-confirm__item-img"
            />
            <div className="co-confirm__item-info">
              <p className="co-confirm__item-name">{item.name}</p>
              <p className="co-confirm__item-attr">
                Size: {item.selectedSize} · Color:{" "}
                {formatColorName(item.selectedColor)} · Qty: {item.quantity}
              </p>
            </div>
            <span className="co-confirm__item-price">
              ${item.price * item.quantity}
            </span>
          </div>
        ))}
      </div>

      <div className="co-form__actions">
        <button className="co-btn co-btn--outline" onClick={onBack}>
          <IoArrowBack size={16} /> Back
        </button>
        <button className="co-btn co-btn--primary" onClick={onNext}>
          Proceed to Payment <IoArrowForward size={16} />
        </button>
      </div>
    </div>
  );
}

//  STEP 3 — PAYMENT
const PAYMENT_METHODS = [
  {
    id: "card",
    label: "Credit / Debit Card",
    icon: <IoCardOutline size={24} />,
  },
  { id: "upi", label: "UPI", icon: <MdPhoneAndroid size={24} /> },
  {
    id: "netbanking",
    label: "Net Banking",
    icon: <MdAccountBalance size={24} />,
  },
  { id: "cod", label: "Cash on Delivery", icon: <IoCashOutline size={24} /> },
];

function PaymentStep({
  address,
  cartItems,
  subtotal,
  discount,
  extraDiscount,
  deliveryFee,
  finalTotal,
  clearCart,
  onOrderSuccess,
  onBack,
}) {
  const navigate = useNavigate();
  const [method, setMethod] = useState("card");
  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [upi, setUpi] = useState("");
  const [bank, setBank] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState("");

  const fmtCard = (v) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  const fmtExpiry = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const validate = () => {
    const e = {};
    if (method === "card") {
      if (card.number.replace(/\s/g, "").length !== 16)
        e.number = "Enter a valid 16-digit card number";
      if (!card.name.trim()) e.name = "Cardholder name is required";
      if (!/^\d{2}\/\d{2}$/.test(card.expiry))
        e.expiry = "Enter expiry as MM/YY";
      if (card.cvv.length < 3) e.cvv = "Enter a valid CVV";
    }
    if (method === "upi" && !/^[\w.-]+@[\w]+$/.test(upi))
      e.upi = "Enter a valid UPI ID (e.g. name@upi)";
    if (method === "netbanking" && !bank) e.bank = "Select your bank";
    return e;
  };

  const handlePay = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token || isSessionExpired()) {
      sessionStorage.setItem(
        "appToastMessage",
        "Please log in or create an account to place your order.",
      );
      navigate("/login", { state: { returnUrl: "/checkout" } });
      return;
    }

    setLoading(true);
    setOrderError("");

    try {
      let activeAddrId = address?.id;
      // If address id is not available, ensure it's saved to the database
      if (!activeAddrId) {
        try {
          const addrRes = await saveAddress({
            full_name: address.fullName || "Customer",
            mobile: address.mobile || "0000000000",
            line1: address.line1 || "Street Address",
            line2: address.line2 || "",
            line3: address.line3 || "",
            city: address.city || "City",
            state: address.state || "State",
            pincode: address.pincode || "000000",
            country: address.country || "India",
            address_type: (address.deliveryType || "home").toLowerCase(),
          });
          activeAddrId = addrRes?.addressId || null;
        } catch (e) {
          console.warn("Could not auto-save address, proceeding with payload fallback:", e);
        }
      }

      const orderPayload = {
        address_id: activeAddrId,
        address: {
          full_name: address.fullName || "Customer",
          mobile: address.mobile || "0000000000",
          line1: address.line1 || "Street Address",
          line2: address.line2 || "",
          city: address.city || "City",
          state: address.state || "State",
          pincode: address.pincode || "000000",
          country: address.country || "India",
          address_type: (address.deliveryType || "home").toLowerCase(),
        },
        subtotal: Number(subtotal) || 0,
        discount: Number((discount || 0) + (extraDiscount || 0)),
        delivery_fee: Number(deliveryFee) || 0,
        total: Number(finalTotal) || 0,
        payment_method: method,
        payment_status: method === "cod" ? "pending" : "paid",
        order_status: "confirmed",
        items: (cartItems || []).map((it) => ({
          product_id: it.productId || it.id,
          name: it.name,
          size: it.selectedSize || "Standard",
          color: it.selectedColor || "",
          quantity: Number(it.quantity) || 1,
          price: Number(it.price || it.current_price || 0),
          total_price: Number(it.price || it.current_price || 0) * (Number(it.quantity) || 1),
          image: it.image || "",
        })),
      };

      const result = await createOrder(orderPayload);

      // Clear cart both locally and trigger events
      if (clearCart) clearCart();
      try {
        window.dispatchEvent(new Event("orderPlaced"));
        window.dispatchEvent(new Event("cartAuthChange"));
        window.dispatchEvent(new Event("storage"));
      } catch (e) {}

      onOrderSuccess({
        orderNumber: result?.orderNumber || `ORD-${Date.now().toString().slice(-6)}`,
        orderId: result?.orderId,
        address,
        finalTotal,
        paymentMethod: method,
      });
    } catch (err) {
      console.error("Order placement failed:", err);
      setOrderError(
        err?.response?.data?.message || "Failed to place order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="co-payment">
      <div className="co-form__header">
        <IoCardOutline size={22} />
        <h2>Payment</h2>
      </div>

      <div className="co-pay-methods">
        {PAYMENT_METHODS.map((m) => (
          <button
            key={m.id}
            className={`co-pay-method ${method === m.id ? "active" : ""}`}
            onClick={() => {
              setMethod(m.id);
              setErrors({});
            }}
          >
            <span className="co-pay-method__icon">{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {method === "card" && (
        <div className="co-pay-form animate-fadeIn">
          <div className="co-pay-card-preview">
            <div className="co-pay-card-preview__chip" />
            <p className="co-pay-card-preview__num">
              {card.number || "•••• •••• •••• ••••"}
            </p>
            <div className="co-pay-card-preview__row">
              <span>{card.name || "CARD HOLDER"}</span>
              <span>{card.expiry || "MM/YY"}</span>
            </div>
          </div>

          <div className="co-field">
            <label className="co-field__label">Card Number</label>
            <input
              className={`co-field__input ${errors.number ? "error" : ""}`}
              placeholder="1234 5678 9012 3456"
              value={card.number}
              onChange={(e) => {
                setCard((p) => ({ ...p, number: fmtCard(e.target.value) }));
                setErrors((p) => ({ ...p, number: "" }));
              }}
            />
            {errors.number && (
              <p className="co-field__error">{errors.number}</p>
            )}
          </div>
          <div className="co-field">
            <label className="co-field__label">Cardholder Name</label>
            <input
              className={`co-field__input ${errors.name ? "error" : ""}`}
              placeholder="John Doe"
              value={card.name}
              onChange={(e) => {
                setCard((p) => ({ ...p, name: e.target.value }));
                setErrors((p) => ({ ...p, name: "" }));
              }}
            />
            {errors.name && <p className="co-field__error">{errors.name}</p>}
          </div>
          <div className="co-form__grid-2">
            <div className="co-field">
              <label className="co-field__label">Expiry Date</label>
              <input
                className={`co-field__input ${errors.expiry ? "error" : ""}`}
                placeholder="MM/YY"
                value={card.expiry}
                onChange={(e) => {
                  setCard((p) => ({ ...p, expiry: fmtExpiry(e.target.value) }));
                  setErrors((p) => ({ ...p, expiry: "" }));
                }}
              />
              {errors.expiry && (
                <p className="co-field__error">{errors.expiry}</p>
              )}
            </div>
            <div className="co-field">
              <label className="co-field__label">CVV</label>
              <input
                className={`co-field__input ${errors.cvv ? "error" : ""}`}
                placeholder="•••"
                type="password"
                maxLength={4}
                value={card.cvv}
                onChange={(e) => {
                  setCard((p) => ({
                    ...p,
                    cvv: e.target.value.replace(/\D/g, ""),
                  }));
                  setErrors((p) => ({ ...p, cvv: "" }));
                }}
              />
              {errors.cvv && <p className="co-field__error">{errors.cvv}</p>}
            </div>
          </div>
        </div>
      )}

      {method === "upi" && (
        <div className="co-pay-form animate-fadeIn">
          <div className="co-field">
            <label className="co-field__label">UPI ID</label>
            <input
              className={`co-field__input ${errors.upi ? "error" : ""}`}
              placeholder="yourname@upi"
              value={upi}
              onChange={(e) => {
                setUpi(e.target.value);
                setErrors((p) => ({ ...p, upi: "" }));
              }}
            />
            {errors.upi && <p className="co-field__error">{errors.upi}</p>}
          </div>
          <p className="co-pay-hint">
            You will receive a payment request on your UPI app.
          </p>
        </div>
      )}

      {method === "netbanking" && (
        <div className="co-pay-form animate-fadeIn">
          <div className="co-field">
            <label className="co-field__label">Select Bank</label>
            <select
              className={`co-field__input co-field__select ${errors.bank ? "error" : ""}`}
              value={bank}
              onChange={(e) => {
                setBank(e.target.value);
                setErrors((p) => ({ ...p, bank: "" }));
              }}
            >
              <option value="">Choose your bank</option>
              {[
                "SBI",
                "HDFC Bank",
                "ICICI Bank",
                "Axis Bank",
                "Kotak Mahindra",
                "Punjab National Bank",
                "Bank of Baroda",
                "Canara Bank",
              ].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {errors.bank && <p className="co-field__error">{errors.bank}</p>}
          </div>
          <p className="co-pay-hint">
            You will be redirected to your bank's secure portal.
          </p>
        </div>
      )}

      {method === "cod" && (
        <div className="co-pay-form animate-fadeIn">
          <div className="co-cod-info">
            <IoCashOutline size={36} />
            <div>
              <p className="co-cod-info__title">Pay at your doorstep</p>
              <p className="co-cod-info__sub">
                Keep ${finalTotal} ready when your order arrives. Cash only.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="co-pay-secure">
        <IoLockClosedOutline size={14} />
        <span>Your payment info is encrypted and secure.</span>
      </div>

      {orderError && (
        <p
          className="co-field__error"
          style={{
            textAlign: "center",
            marginTop: "12px",
            fontSize: "14px",
            background: "#fef2f2",
            padding: "8px 12px",
            borderRadius: "8px",
          }}
        >
          {orderError}
        </p>
      )}

      <div className="co-form__actions">
        <button className="co-btn co-btn--outline" onClick={onBack} disabled={loading}>
          <IoArrowBack size={16} /> Back
        </button>
        <button
          className="co-btn co-btn--primary co-btn--pay"
          onClick={handlePay}
          disabled={loading}
        >
          {loading ? (
            <span className="co-spinner" />
          ) : (
            <>
              <IoLockClosedOutline size={16} /> Pay ${finalTotal}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

//  STEP 4 — SUCCESS
function SuccessStep({ placedOrder, address, finalTotal, clearCart }) {
  const navigate = useNavigate();
  const rawOrderNumber = placedOrder?.orderNumber || `ORD-${Date.now().toString().slice(-8)}`;
  const orderId = rawOrderNumber.replace(/^#/, "");
  const displayAddress = placedOrder?.address || address;
  const displayTotal = placedOrder?.finalTotal != null ? placedOrder.finalTotal : finalTotal;

  // Date formatting
  const fmt = (date) =>
    date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + 7);

  return (
    <div className="co-success animate-fadeIn">
      <div className="co-success__icon-wrap">
        <div className="co-success__ripple" />
        <div className="co-success__ripple co-success__ripple--2" />
        <IoCheckmarkCircle className="co-success__icon" size={72} />
      </div>

      <h2 className="co-success__title">Order Placed!</h2>
      <p className="co-success__sub">
        Thank you, <strong>{displayAddress.fullName}</strong>! Your order has been
        confirmed and saved to your account.
      </p>

      <div className="co-success__card">
        <div className="co-success__row">
          <span>Order Number</span>
          <strong style={{ color: "#0f172a" }}>#{orderId}</strong>
        </div>
        <div className="co-success__row">
          <span>Order Date</span>
          <strong>{fmt(today)}</strong>
        </div>
        <div className="co-success__row">
          <span>Delivery Date</span>
          <strong>{fmt(deliveryDate)}</strong>
        </div>
        <div className="co-success__row co-success__row--addr">
          <span>Delivery Address</span>
          <div className="co-success__addr-detail">
            <strong>{displayAddress.fullName}</strong>
            <span>
              {displayAddress.line1}
              {displayAddress.line2 ? `, ${displayAddress.line2}` : ""}
            </span>
            <span>
              {displayAddress.city}, {displayAddress.state} — {displayAddress.pincode}
            </span>
            <span>{displayAddress.mobile}</span>
            {displayAddress.deliveryType && (
              <span className="co-success__instruction-tag">
                Type: <strong>{displayAddress.deliveryType}</strong> (
                {
                  DELIVERY_INSTRUCTIONS.find(
                    (d) => d.id === displayAddress.deliveryType,
                  )?.timing
                }
                )
              </span>
            )}
            {displayAddress.deliveryNote && (
              <span className="co-success__instruction-note">
                Note: {displayAddress.deliveryNote}
              </span>
            )}
          </div>
        </div>
        <div className="co-success__row">
          <span>Amount Paid</span>
          <strong style={{ fontSize: "16px", color: "#16a34a" }}>${displayTotal}</strong>
        </div>
      </div>

      {displayAddress.email && (
        <p className="co-success__email-note">
          A confirmation email will be sent to <strong>{displayAddress.email}</strong>
        </p>
      )}

      <div className="co-success__actions">
        <button
          className="co-btn co-btn--outline"
          onClick={() => {
            if (clearCart) clearCart();
            navigate("/");
          }}
        >
          Continue Shopping
        </button>
        <button
          className="co-btn co-btn--primary"
          onClick={() => {
            if (clearCart) clearCart();
            navigate("/orders");
          }}
        >
          Track Order <IoArrowForward size={16} />
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function CheckoutPage() {
  const { cartItems, subtotal, discount, deliveryFee, total, clearCart } =
    useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(0);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Check login on checkout page mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isSessionExpired()) {
      sessionStorage.setItem(
        "appToastMessage",
        "Please log in or create an account to proceed with checkout.",
      );
      navigate("/login", { state: { returnUrl: "/checkout" }, replace: true });
    }
  }, [navigate]);

  // Scroll to top whenever the step changes or page first loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    email: "",
    line1: "",
    line2: "",
    line3: "",
    city: "",
    state: "",
    pincode: "",
    deliveryType: "Home",
    deliveryNote: "",
  });

  const appliedPromo = location.state?.appliedPromo || null;
  const extraDiscount = Number(location.state?.extraDiscount || 0);
  const finalTotal = Math.max(0, total - extraDiscount);

  if (cartItems.length === 0 && step < 3) {
    return (
      <div className="co-empty">
        <IoCartOutline size={64} className="co-empty__icon" />
        <h2>Your cart is empty</h2>
        <Link to="/" className="co-btn co-btn--primary">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="co-page">
      <div className="co-page__inner">
        <StepBar step={step} />

        <div
          className={`co-layout${step === 3 ? " co-layout--full" : ""}${step === 1 || step === 2 ? " co-layout--sidebar-top" : ""}`}
        >
          <div className="co-main">
            {step === 0 && (
              <AddressStep
                address={address}
                setAddress={setAddress}
                onNext={() => setStep(1)}
              />
            )}
            {step === 1 && (
              <ConfirmStep
                address={address}
                cartItems={cartItems}
                finalTotal={finalTotal}
                onNext={() => setStep(2)}
                onBack={() => setStep(0)}
              />
            )}
            {step === 2 && (
              <PaymentStep
                address={address}
                cartItems={cartItems}
                subtotal={subtotal}
                discount={discount}
                extraDiscount={extraDiscount}
                deliveryFee={deliveryFee}
                finalTotal={finalTotal}
                clearCart={clearCart}
                onOrderSuccess={(orderData) => {
                  setPlacedOrder(orderData);
                  setStep(3);
                }}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <SuccessStep
                placedOrder={placedOrder}
                address={address}
                finalTotal={finalTotal}
                clearCart={clearCart}
              />
            )}
          </div>

          {step === 0 && (
            <OrderSidebar
              cartItems={cartItems}
              subtotal={subtotal}
              discount={discount}
              deliveryFee={deliveryFee}
              finalTotal={finalTotal}
              appliedPromo={appliedPromo}
              extraDiscount={extraDiscount}
            />
          )}
          {(step === 1 || step === 2) && (
            <PaymentSidebar
              subtotal={subtotal}
              discount={discount}
              deliveryFee={deliveryFee}
              finalTotal={finalTotal}
              appliedPromo={appliedPromo}
              extraDiscount={extraDiscount}
            />
          )}
        </div>
      </div>
    </div>
  );
}
