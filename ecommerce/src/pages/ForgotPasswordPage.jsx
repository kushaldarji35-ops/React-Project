import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import "./AuthPages.css";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Step 1: Mobile/Email, Step 2: Verification Code
  const [step, setStep] = useState(1);
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [resendStatus, setResendStatus] = useState("");
  const [errors, setErrors] = useState({});

  // 30s Countdown timer for Resend Code
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  // Handle Step 1: Send Code
  const handleSubmitIdentifier = (e) => {
    e.preventDefault();
    const val = emailOrMobile.trim();
    if (!val) {
      setErrors({
        emailOrMobile: "Registered mobile number or email is required",
      });
      return;
    }

    const isEmail = /\S+@\S+\.\S+/.test(val);
    const isMobile = /^[6-9]\d{9}$/.test(val);

    if (!isEmail && !isMobile) {
      setErrors({
        emailOrMobile: "Enter a valid mobile number or email address",
      });
      return;
    }

    setErrors({});
    setTimer(30);
    setOtp("");
    setResendStatus("");
    setStep(2);
  };

  // Handle Step 2: Verification Code (Strictly '0000')
  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setOtp(val);
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: "" }));
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!otp) {
      setErrors({ otp: "Please enter the 4-digit code" });
      return;
    }
    if (otp.length < 4) {
      setErrors({ otp: "Code must be 4 digits" });
      return;
    }
    if (otp !== "0000") {
      setErrors({ otp: "Invalid code. Please enter 0000." });
      return;
    }

    // OTP is valid (0000) -> Navigate to /reset-password route
    navigate("/reset-password");
  };

  const handleResendCode = () => {
    if (timer > 0) return;
    setTimer(30);
    setOtp("");
    setErrors({});
    setResendStatus("New code sent! (Use code 0000)");
    setTimeout(() => {
      setResendStatus("");
    }, 4000);
  };

  return (
    <div className="auth-page">
      {/* STEP 1: FORGOT PASSWORD */}
      {step === 1 && (
        <div className="auth-card animate-fadeIn">
          <div className="auth-header">
            <Link to="/" className="auth-brand-logo">
              SHOP.CO
            </Link>
            <h1 className="auth-title">Forgot Password</h1>
            <p className="auth-subtitle">
              Enter your registered mobile number or email and we will send you a code.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmitIdentifier} noValidate>
            <div className="auth-field">
              <label htmlFor="emailOrMobile">Registered Mobile number or Email</label>
              <input
                id="emailOrMobile"
                name="emailOrMobile"
                type="text"
                placeholder="mobile number or email"
                className="auth-input"
                value={emailOrMobile}
                onChange={(e) => {
                  setEmailOrMobile(e.target.value);
                  if (errors.emailOrMobile) {
                    setErrors((prev) => ({ ...prev, emailOrMobile: "" }));
                  }
                }}
                autoComplete="username"
                autoFocus
              />
              {errors.emailOrMobile && (
                <span className="auth-error-msg">{errors.emailOrMobile}</span>
              )}
            </div>

            <button type="submit" className="auth-submit-btn">
              Send Code
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login" className="auth-link">
              Back to Log In
            </Link>
          </div>
        </div>
      )}

      {/* STEP 2: ENTER VERIFICATION CODE */}
      {step === 2 && (
        <div className="auth-card animate-fadeIn">
          <div className="auth-header">
            <Link to="/" className="auth-brand-logo">
              SHOP.CO
            </Link>
            <h1 className="auth-title">Enter Verification Code</h1>
            <p className="auth-subtitle">
              We've sent a 4-digit verification code to you. Please enter it
              below.
            </p>
          </div>

          {resendStatus && (
            <div className="auth-alert auth-alert--success">
              <IoCheckmarkCircleOutline size={18} />
              <span>{resendStatus}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleOtpSubmit} noValidate>
            <div className="auth-field">
              <input
                id="otpCode"
                name="otpCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="Enter 4-digit code"
                className="auth-input auth-code-input"
                value={otp}
                onChange={handleOtpChange}
                autoFocus
              />
              {errors.otp && (
                <span className="auth-error-msg">{errors.otp}</span>
              )}
            </div>

            <button type="submit" className="auth-submit-btn">
              Submit Code
            </button>
          </form>

          <div
            className="auth-footer"
            style={{ display: "flex", flexDirection: "column", gap: "6px" }}
          >
            <div>
              <button
                type="button"
                className="auth-resend-btn"
                onClick={handleResendCode}
                disabled={timer > 0}
              >
                Resend Code {timer > 0 ? `(${timer}s)` : ""}
              </button>
            </div>
            <div>
              <button
                type="button"
                className="auth-back-link-btn"
                onClick={() => {
                  setErrors({});
                  setStep(1);
                }}
              >
                Change Mobile / Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
