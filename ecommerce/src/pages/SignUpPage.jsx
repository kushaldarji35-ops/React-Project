import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IoEyeOutline,
  IoEyeOffOutline,
  IoClose,
} from "react-icons/io5";
import "./AuthPages.css";
import { registerUser } from "../services/authService";

export default function SignUpPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  // const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsModalTab, setTermsModalTab] = useState("terms");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Full Name
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    // Mobile Number
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms & Conditions
    if (!formData.agree) {
      newErrors.agree = "You must accept the Terms & Conditions";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      await registerUser({
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      // Mark as first-time user so welcome modal shows only once after first login
      localStorage.setItem("firstTimeUser", "true");

      // Set toast message for login page
      sessionStorage.setItem("appToastMessage", "Registration successfully!");
      navigate("/login", { state: { toastMessage: "Registration successfully!" }, replace: true });
    } catch (err) {
      setApiError(
        err?.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fadeIn">
        <div className="auth-header">
          <Link to="/" className="auth-brand-logo">
            SHOP.CO
          </Link>

          <h1 className="auth-title">Create Account</h1>

          <p className="auth-subtitle">
            Sign up now and get 20% off your first order.
          </p>
        </div>


        {apiError && (
          <div className="auth-alert auth-alert--error">
            <span>{apiError}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="auth-field">
            <label htmlFor="name">Full Name</label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              className="auth-input"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
            />

            {errors.name && (
              <span className="auth-error-msg">{errors.name}</span>
            )}
          </div>

          {/* Mobile Number */}
          <div className="auth-field">
            <label htmlFor="mobile">Mobile Number</label>

            <input
              id="mobile"
              name="mobile"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              className="auth-input"
              value={formData.mobile}
              onChange={handleChange}
              maxLength={10}
              inputMode="numeric"
              autoComplete="tel"
            />

            {errors.mobile && (
              <span className="auth-error-msg">{errors.mobile}</span>
            )}
          </div>

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              className="auth-input"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />

            {errors.email && (
              <span className="auth-error-msg">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="password">Password</label>

            <div className="auth-input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                className="auth-input"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="auth-input-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <IoEyeOffOutline size={18} />
                ) : (
                  <IoEyeOutline size={18} />
                )}
              </button>
            </div>

            {errors.password && (
              <span className="auth-error-msg">{errors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm Password</label>

            <div className="auth-input-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                className="auth-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="auth-input-toggle"
                onClick={() => setShowConfirm((prev) => !prev)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <IoEyeOffOutline size={18} />
                ) : (
                  <IoEyeOutline size={18} />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <span className="auth-error-msg">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="auth-field">
            <div className="auth-checkbox-wrapper">
              <input
                type="checkbox"
                name="agree"
                checked={formData.agree}
                onChange={handleChange}
              />

              <span className="auth-checkbox-text">
                I agree to the{" "}
                <button
                  type="button"
                  className="auth-inline-link"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTermsModalTab("terms");
                    setShowTermsModal(true);
                  }}
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="auth-inline-link"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTermsModalTab("privacy");
                    setShowTermsModal(true);
                  }}
                >
                  Privacy Policy
                </button>
              </span>
            </div>

            {errors.agree && (
              <span className="auth-error-msg">{errors.agree}</span>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? "Creating Account…" : "Sign Up Now"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?
          <Link to="/login" className="auth-link">
            Log In
          </Link>
        </div>
      </div>

      {/* Terms & Privacy Modal */}
      {showTermsModal && (
        <div
          className="terms-modal-overlay"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="terms-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="terms-modal-header">
              <div className="terms-modal-tabs">
                <button
                  type="button"
                  className={`terms-tab-btn ${termsModalTab === "terms" ? "active" : ""}`}
                  onClick={() => setTermsModalTab("terms")}
                >
                  Terms of Service
                </button>
                <button
                  type="button"
                  className={`terms-tab-btn ${termsModalTab === "privacy" ? "active" : ""}`}
                  onClick={() => setTermsModalTab("privacy")}
                >
                  Privacy Policy
                </button>
              </div>
              <button
                type="button"
                className="terms-close-btn"
                onClick={() => setShowTermsModal(false)}
                aria-label="Close dialog"
              >
                <IoClose size={20} />
              </button>
            </div>

            <div className="terms-modal-body">
              {termsModalTab === "terms" ? (
                <>
                  <h4>1. Acceptance of Terms</h4>
                  <p>
                    By creating an account or using SHOP.CO, you agree to comply
                    with and be bound by these Terms of Service. If you do not
                    agree, please do not use our platform.
                  </p>

                  <h4>2. Account Registration & Security</h4>
                  <p>
                    You must provide accurate and complete information during
                    registration. You are responsible for maintaining the
                    confidentiality of your account credentials and for all
                    activities under your account.
                  </p>

                  <h4>3. Orders, Pricing & Payment</h4>
                  <p>
                    All product orders are subject to availability and price
                    confirmation. We reserve the right to decline or cancel
                    orders due to pricing errors or suspected unauthorized
                    transactions.
                  </p>

                  <h4>4. Returns & Refunds</h4>
                  <p>
                    Eligible products can be returned within 30 days of delivery
                    in their original condition and packaging according to our
                    return policy.
                  </p>

                  <h4>5. Prohibited Conduct</h4>
                  <p>
                    Users are prohibited from engaging in fraudulent activities,
                    violating applicable laws, attempting unauthorized access,
                    or interfering with platform security.
                  </p>
                </>
              ) : (
                <>
                  <h4>1. Information We Collect</h4>
                  <p>
                    We collect information you provide directly, including your
                    name, email address, mobile phone number, shipping address,
                    and order preferences.
                  </p>

                  <h4>2. How We Use Your Information</h4>
                  <p>
                    Your data is used to process and deliver orders, provide
                    customer support, send order status notifications, and
                    improve your shopping experience.
                  </p>

                  <h4>3. Data Protection & Security</h4>
                  <p>
                    We implement industry-standard security measures and
                    encryption to safeguard your personal data against
                    unauthorized access, alteration, or disclosure.
                  </p>

                  <h4>4. Information Sharing</h4>
                  <p>
                    We never sell your personal information. We only share data
                    with trusted third-party service providers (such as payment
                    gateways and logistics partners) strictly required to
                    fulfill your orders.
                  </p>

                  <h4>5. Your Privacy Rights</h4>
                  <p>
                    You have the right to access, update, or request the
                    deletion of your personal data at any time by contacting our
                    support team.
                  </p>
                </>
              )}
            </div>

            <div className="terms-modal-footer">
              <button
                type="button"
                className="terms-secondary-btn"
                onClick={() => setShowTermsModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="terms-primary-btn"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, agree: true }));
                  if (errors.agree) {
                    setErrors((prev) => ({ ...prev, agree: "" }));
                  }
                  setShowTermsModal(false);
                }}
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
