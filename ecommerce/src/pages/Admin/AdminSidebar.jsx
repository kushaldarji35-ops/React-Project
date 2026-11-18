import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  IoGridOutline,
  IoPeopleOutline,
  IoBagCheckOutline,
  IoShirtOutline,
  IoLayersOutline,
  IoListOutline,
  IoStarOutline,
  IoPricetagOutline,
  IoPersonOutline,
  IoLogOutOutline,
  IoStorefrontOutline,
} from "react-icons/io5";
import { PiShoppingBagOpenFill } from "react-icons/pi";
import { clearSession } from "../../services/authService";
import "./AdminPages.css";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearSession("logout");
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: <IoGridOutline size={19} /> },
    { label: "Users", path: "/admin/users", icon: <IoPeopleOutline size={19} /> },
    { label: "Orders", path: "/admin/orders", icon: <IoBagCheckOutline size={19} /> },
    { label: "Products", path: "/admin/products", icon: <IoShirtOutline size={19} /> }, 
    { label: "Categories", path: "/admin/categories", icon: <IoLayersOutline size={19} /> },
    { label: "Subcategories", path: "/admin/subcategories", icon: <IoListOutline size={19} /> },
    { label: "Coupons", path: "/admin/coupons", icon: <IoPricetagOutline size={19} /> },
    { label: "Reviews", path: "/admin/reviews", icon: <IoStarOutline size={19} /> },
  ];

  return (
    <aside className="adm-sidebar">
      <div className="adm-sidebar-top">
        <div className="adm-brand">
          <span className="adm-brand-full">
            SHOP.CO
            <span className="adm-brand-badge">ADMIN</span>
          </span>
          <span className="adm-brand-mini" title="SHOP.CO Admin">
            <PiShoppingBagOpenFill size={26} />
          </span>
        </div>
      </div>

      <nav className="adm-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`adm-navItem ${isActive ? "active" : ""}`}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              title={item.label}
            >
              <span className="adm-navIcon">{item.icon}</span>
              <span className="adm-navLabel">{item.label}</span>
              {isActive && <span className="adm-active-indicator" />}
            </button>
          );
        })}
      </nav>

      <div className="adm-sidebar-bottom">
        <Link
          to="/admin/profile"
          className={`adm-store-link ${location.pathname === "/admin/profile" ? "active" : ""}`}
          aria-label="Profile"
          title="Profile"
        >
          <IoPersonOutline size={18} />
          <span>Profile</span>
        </Link>
        <Link to="/" className="adm-store-link" aria-label="View Store" title="View Store">
          <IoStorefrontOutline size={18} />
          <span>View Store</span>
        </Link>
        <button className="adm-logoutBtn" onClick={handleLogout} aria-label="Logout" title="Logout">
          <IoLogOutOutline size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
