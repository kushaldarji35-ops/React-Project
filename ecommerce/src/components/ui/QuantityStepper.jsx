import React from "react";
import "./QuantityStepper.css";
import { AiOutlinePlus } from "react-icons/ai";
import { FiMinus } from "react-icons/fi";
export default function QuantityStepper({
  quantity = 1,
  onChange,
  min = 1,
  max = 10,
  size = "md",
}) {
  return (
    <div className={`qty-stepper qty-stepper--${size}`}>
      <button
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className="qty-stepper__btn"
        aria-label="Decrease quantity"
      >
        <FiMinus />
      </button>
      <span className="qty-stepper__count">{quantity}</span>
      <button
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="qty-stepper__btn"
        aria-label="Increase quantity"
      >
        <AiOutlinePlus />
      </button>
    </div>
  );
}
