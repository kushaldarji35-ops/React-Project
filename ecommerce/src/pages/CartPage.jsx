import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IoTrashOutline,
  IoArrowForward,
  IoPricetagOutline,
  IoCartOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import Breadcrumb from "../components/ui/Breadcrumb";
import QuantityStepper from "../components/ui/QuantityStepper";
import NewsletterBanner from "../components/layout/NewsletterBanner";
import { useCart } from "../context/CartContext";
import { validateCouponApi } from "../services/couponService";
import "./CartPage.css";

const PROMO_CODES = {
  SAVE10: 10,
  WELCOME20: 20,
  SHOPCO: 15,
};

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
  "#c0c0c0": "Silver",
  "#2f4f4f": "Dark Gray",
  "#4f4631": "Brown",
  "#314f4a": "Green",
  "#31344f": "Navy",
  "#006400": "Green",
  "#556b2f": "Olive",
  "#ff6347": "Orange",
  "#ff8c00": "Orange",
  "#ffd700": "Yellow",
  "#ff69b4": "Pink",
  "#9370db": "Purple",
  "#00ced1": "Turquoise",
  "#1c6c82": "Teal",
  "#80545e": "Burgundy",
  "#d2691e": "Brown",
};

function formatColorName(color) {
  if (!color) return "";
  if (!color.startsWith("#")) {
    return color.charAt(0).toUpperCase() + color.slice(1);
  }
  const hex = color.toLowerCase();
  return COLOR_NAMES[hex] || color;
}

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    subtotal,
    discount,
    deliveryFee,
    total,
  } = useCart();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");

  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async () => {
    const upper = promoCode.trim().toUpperCase();
    if (!upper) {
      setPromoError("Please enter a promo code.");
      return;
    }

    try {
      setPromoLoading(true);
      setPromoError("");
      const result = await validateCouponApi(upper, subtotal);
      if (result.valid) {
        setAppliedPromo({
          code: result.code,
          percent: result.discountPercent,
          discountAmount: result.discountAmount,
        });
        setPromoError("");
      }
    } catch (err) {
      // Check fallback local codes if API request fails with network error
      if (!err.response && PROMO_CODES[upper]) {
        setAppliedPromo({ code: upper, percent: PROMO_CODES[upper] });
        setPromoError("");
      } else {
        setPromoError(
          err.response?.data?.message || "Invalid or expired promo code."
        );
        setAppliedPromo(null);
      }
    } finally {
      setPromoLoading(false);
    }
  };

  const extraDiscount = appliedPromo
    ? appliedPromo.discountAmount != null
      ? appliedPromo.discountAmount
      : Math.round(subtotal * (appliedPromo.percent / 100))
    : 0;

  const finalTotal = total - extraDiscount;

  return (
    <>
      <div className="cart-page">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />

        <h1 className="cart-page__title">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <IoCartOutline size={72} className="cart-empty__icon" />
            <h2 className="cart-empty__title">Your cart is empty</h2>
            <p className="cart-empty__sub">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="cart-item">
                  <Link
                    to={`/product/${item.id}`}
                    className="cart-item__image-link"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = "";
                      }}
                    />
                  </Link>
                  <div className="cart-item__info">
                    <div className="cart-item__top">
                      <div className="cart-item__meta">
                        <Link
                          to={`/product/${item.id}`}
                          className="cart-item__name-link"
                        >
                          {item.name}
                        </Link>
                        <p className="cart-item__attr">
                          Size: <span>{item.selectedSize || item.selected_size || "Standard"}</span>
                        </p>
                        <p className="cart-item__attr">
                          Color:{" "}
                          <span>{formatColorName(item.selectedColor || item.selected_color) || "Default"}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.cartItemId || item.dbId || item.id)}
                        className="cart-item__delete"
                        aria-label="Remove item"
                      >
                        <IoTrashOutline size={18} />
                      </button>
                    </div>

                    <div className="cart-item__bottom">
                      <span className="cart-item__price">
                        ${Number(item.price != null ? item.price : (item.current_price != null ? item.current_price : 0))}
                      </span>
                      <QuantityStepper
                        quantity={Math.min(99, Math.max(1, Number(item.quantity) || 1))}
                        onChange={(qty) => updateQuantity(item.cartItemId || item.dbId || item.id, qty)}
                        size="sm"
                        max={99}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="order-summary">
              <h2 className="order-summary__title">Order Summary</h2>

              <div className="order-summary__rows">
                <div className="order-summary__row">
                  <span>Subtotal</span>
                  <span className="order-summary__row-value">${subtotal}</span>
                </div>
                <div className="order-summary__row">
                  <span>Discount (-20%)</span>
                  <span className="order-summary__row-value order-summary__row-value--red">
                    -${discount}
                  </span>
                </div>
                {appliedPromo && (
                  <div className="order-summary__row">
                    <span>Promo ({appliedPromo.code})</span>
                    <span className="order-summary__row-value order-summary__row-value--red">
                      -${extraDiscount}
                    </span>
                  </div>
                )}
                <div className="order-summary__row">
                  <span>Delivery Fee</span>
                  <span className="order-summary__row-value">
                    ${deliveryFee}
                  </span>
                </div>
              </div>

              <div className="order-summary__total-row">
                <span className="order-summary__total-label">Total</span>
                <span className="order-summary__total-value">
                  ${finalTotal}
                </span>
              </div>
              <div className="promo-wrap">
                <div className="promo-input-row">
                  <div className="promo-input-wrap">
                    <span className="promo-input-icon">
                      <IoPricetagOutline size={16} />
                    </span>
                    <input
                      type="text"
                      placeholder="Add promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                      className="promo-input"
                    />
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoLoading}
                    className="btn-primary promo-apply-btn"
                  >
                    {promoLoading ? "Applying..." : "Apply"}
                  </button>
                </div>
                {promoError && <p className="promo-error">{promoError}</p>}
                {appliedPromo && (
                  <p className="promo-success">
                    <IoCheckmarkCircleOutline
                      size={15}
                      style={{ verticalAlign: "middle", marginRight: 4 }}
                    />
                    {appliedPromo.code} applied — {appliedPromo.percent}% off!
                  </p>
                )}
              </div>
              <button
                className="btn-primary checkout-btn"
                onClick={() =>
                  navigate("/checkout", {
                    state: { appliedPromo, extraDiscount },
                  })
                }
              >
                Go to Checkout <IoArrowForward size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <NewsletterBanner />
    </>
  );
}
