import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  IoEyeOutline,
  IoEyeOffOutline,
  IoTimeOutline,
} from "react-icons/io5";
import "./AuthPages.css";
import { loginUser } from "../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    emailOrMobile: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [sessionExpired, setSessionExpired] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const wasRedirected = params.get("expired") === "1";
    const hadExpiredSession = localStorage.getItem("sessionExpired") === "true";

    localStorage.removeItem("sessionExpired");
    localStorage.removeItem("sessionExpiredRole");

    return wasRedirected || hadExpiredSession;
  });

  useEffect(() => {
    if (new URLSearchParams(location.search).get("expired") === "1") {
      setSessionExpired(true);
      localStorage.removeItem("sessionExpired");
      localStorage.removeItem("sessionExpiredRole");
    }
  }, [location.search]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  const validate = () => {
    const newErrors = {};

    if (!formData.emailOrMobile.trim()) {
      newErrors.emailOrMobile = "Mobile number or email is required";
    } else {
      const value = formData.emailOrMobile.trim();

      const isEmail = /\S+@\S+\.\S+/.test(value);
      const isMobile = /^\d{7,15}$/.test(value); // accept any 7-15 digit number

      if (!isEmail && !isMobile) {
        newErrors.emailOrMobile =
          "Enter a valid mobile number or email address";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setServerError("");
    setSessionExpired(false);
    localStorage.removeItem("sessionExpired");

    try {
      const data = await loginUser({
        emailOrMobile: formData.emailOrMobile.trim(),
        password: formData.password,
      });

      // Save token & user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("lastActivity", Date.now().toString());
      localStorage.removeItem("sessionExpired");
      localStorage.removeItem("sessionExpiredRole");
      try {
        window.dispatchEvent(new Event("cartAuthChange"));
      } catch (e) {}
      // Show welcome modal only on the very first login after signup
      const isFirstTime = localStorage.getItem("firstTimeUser") === "true";
      if (data.user?.role !== "admin" && isFirstTime) {
        localStorage.setItem("showWelcome", "true");
        localStorage.removeItem("firstTimeUser"); // consume the flag
      }

      sessionStorage.setItem("loginSuccessToast", "true");
      const role = data.user?.role;
      const returnUrl = location.state?.returnUrl;

      if (role === "admin") {
        navigate("/admin", { state: { loginToast: true }, replace: true });
      } else if (returnUrl) {
        navigate(returnUrl, { state: { loginToast: true }, replace: true });
      } else {
        navigate("/", { state: { loginToast: true }, replace: true });
      }
    } catch (err) {
      setServerError(
        err?.response?.data?.message || "Login failed. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fadeIn">
        <div className="auth-header">
          <Link to="/" className="auth-brand-logo">
            SHOP.CO
          </Link>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Log in with your credentials to access your account.
          </p>
        </div>

        {sessionExpired && !serverError && (
          <div className="auth-alert auth-alert--warning">
            <IoTimeOutline size={20} />
            <span>Your session has expired. Please log in again to continue.</span>
          </div>
        )}



        {serverError && (
          <div className="auth-alert auth-alert--error">
            <span>{serverError}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="emailOrMobile">Mobile Number or Email</label>

            <input
              id="emailOrMobile"
              name="emailOrMobile"
              type="text"
              placeholder="Enter mobile number or email"
              className="auth-input"
              value={formData.emailOrMobile}
              onChange={handleChange}
              autoComplete="username"
            />

            {errors.emailOrMobile && (
              <span className="auth-error-msg">{errors.emailOrMobile}</span>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="auth-input"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
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

          <div className="auth-row">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="auth-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?
          <Link to="/signup" className="auth-link">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
