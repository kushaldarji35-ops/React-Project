import React from "react";
import { IoStar, IoStarHalf, IoStarOutline } from "react-icons/io5";
import "./StarRating.css";
export default function StarRating({
  rating = 0,
  max = 5,
  size = "md",
  showValue = false,
}) {
  const sizePx = size === "sm" ? 12 : size === "lg" ? 22 : 16;
  const stars = Array.from({ length: max }, (_, i) => {
    const val = i + 1;
    if (rating >= val) return "full";
    if (rating >= val - 0.5) return "half";
    return "empty";
  });
  return (
    <span className="star-rating">
      {stars.map((type, i) => (
        <span
          key={i}
          className={`star-rating__star${type === "empty" ? " star-rating__star--empty" : ""}`}
        >
          {type === "full" && <IoStar size={sizePx} />}
          {type === "half" && <IoStarHalf size={sizePx} />}
          {type === "empty" && <IoStarOutline size={sizePx} />}
        </span>
      ))}
      {showValue && (
        <span className="star-rating__value">{rating.toFixed(1)}/5</span>
      )}
    </span>
  );
}
