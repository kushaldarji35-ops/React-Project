import React from "react";
import { Link } from "react-router-dom";
import { IoChevronForwardOutline } from "react-icons/io5";
import "./Breadcrumb.css";
export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {isLast ? (
              <span className="breadcrumb__current">{item.label}</span>
            ) : (
              <>
                <Link to={item.href || "/"} className="breadcrumb__link">
                  {item.label}
                </Link>
                <span className="breadcrumb__sep">
                  <IoChevronForwardOutline size={14} />
                </span>
              </>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
