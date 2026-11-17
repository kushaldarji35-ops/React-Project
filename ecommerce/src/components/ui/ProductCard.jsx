import React from "react";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  if (!product) return null;

  const { id, name, price, originalPrice, discountPercent, rating, images } =
    product;

  return (
    <Link
      to={`/product/${id}`}
      className="product-card"
      aria-label={`View ${name}`}
    >
      <div className="product-card__image">
        <img
          src={images?.[0]}
          alt={name}
          className="product-card__img"
          loading="lazy"
        />
      </div>

      <div className="product-card__info">
        <h3 className="product-card__name">{name}</h3>

        <div className="product-card__rating">
          <StarRating rating={Number(rating) || 0} size="sm" />
          <span className="product-card__rating-value">
            {(Number(rating) || 0).toFixed(1)}/5
          </span>
        </div>

        <div className="product-card__price">
          <span className="product-card__price-current">${price}</span>
          {originalPrice && (
            <>
              <span className="product-card__price-original">
                ${originalPrice}
              </span>
              <span className="product-card__price-discount">
                -{discountPercent}%
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
