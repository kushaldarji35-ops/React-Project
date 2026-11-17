import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IoEyeOutline,
  IoEyeOffOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import "./AuthPages.css";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = "New password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fadeIn">
        <div className="auth-header">
          <Link to="/" className="auth-brand-logo">
            SHOP.CO
          </Link>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            Enter your new password below.
          </p>
        </div>

        {isSuccess && (
          <div className="auth-alert auth-alert--success">
            <IoCheckmarkCircleOutline size={20} />
            <span>Password reset successfully! Redirecting to login...</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="password">New Password</label>
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
                autoFocus
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

          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="auth-input-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your new password"
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

          <button type="submit" className="auth-submit-btn">
            Reset Password
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="auth-link">
            Back to Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
