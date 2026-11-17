import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IoSearchOutline,
  IoCloseOutline,
  IoChevronDownOutline,
  IoPersonOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { CiShoppingCart } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { useCart } from "../../context/CartContext";
import { isSessionExpired, clearSession } from "../../services/authService";
import { fetchDbCategories } from "../../services/categoryService";
import "./Navbar.css";

export default function Navbar() {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [shopCategories, setShopCategories] = useState([]);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    let active = true;
    const loadCategories = () => {
      fetchDbCategories({ status: "active" })
        .then((categories) => {
          if (active) setShopCategories(categories);
        })
        .catch(() => {
          if (active) setShopCategories([]);
        });
    };

    loadCategories();
    window.addEventListener("categories_updated", loadCategories);
    return () => {
      active = false;
      window.removeEventListener("categories_updated", loadCategories);
    };
  }, []);

  // Read logged-in user and check session status
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const isExpired = !token || isSessionExpired();

  useEffect(() => {
    if (token && isSessionExpired()) {
      clearSession("expired");
    }
  }, [token]);

  const user = (!isExpired && storedUser) ? JSON.parse(storedUser) : null;

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShopOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearSession("logout");
    setProfileOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/category/casual?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal("");
      setMobileOpen(false);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <button
          className="navbar__hamburger"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <GiHamburgerMenu size={24} />
        </button>

        <Link to="/" className="navbar__logo">
          SHOP.CO
        </Link>

        <nav className="navbar__nav">
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShopOpen(!shopOpen)}
              className="navbar__dropdown-trigger"
            >
              Shop
              <IoChevronDownOutline
                size={14}
                className={`chevron${shopOpen ? " open" : ""}`}
              />
            </button>
            {shopOpen && (
              <div className="navbar__dropdown-menu animate-fadeIn">
                {shopCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/category/${cat.slug}`}
                    onClick={() => setShopOpen(false)}
                    className="navbar__dropdown-item"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/category/casual?sale=true" className="navbar__nav-link">
            On Sale
          </Link>
          <Link to="/category/casual?new=true" className="navbar__nav-link">
            New Arrivals
          </Link>
          <Link to="/category/casual" className="navbar__nav-link">
            Brands
          </Link>
        </nav>

        <form onSubmit={handleSearch} className="navbar__search-form">
          <div className="navbar__search-wrap">
            <IoSearchOutline size={18} className="navbar__search-icon" />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="navbar__search-input"
            />
          </div>
        </form>

        <div className="navbar__icons">
          <button
            className="navbar__icon-btn navbar__mobile-search-btn"
            aria-label="Search"
          >
            <IoSearchOutline size={22} />
          </button>

          <Link
            to={user ? "/cart" : "/login"}
            className="navbar__icon-btn"
            aria-label={`Cart (${cartCount} items)`}
          >
            <CiShoppingCart size={26} />
            {user && cartCount > 0 && (
              <span className="navbar__cart-badge">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Profile icon with dropdown */}
          <div ref={profileRef} className="navbar__profile-wrap">
            <button
              className="navbar__icon-btn"
              aria-label="Account"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <CgProfile size={22} />
            </button>

            {profileOpen && (
              <div className="navbar__profile-menu animate-fadeIn">
                {user && (
                  <div className="navbar__profile-header">
                    <div className="navbar__profile-avatar">
                      {localStorage.getItem("profile_avatar") ? (
                        <img
                          src={localStorage.getItem("profile_avatar")}
                          alt="Profile"
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        user.name ? user.name.charAt(0).toUpperCase() : "U"
                      )}
                    </div>
                    <div>
                      <p className="navbar__profile-name">{user.name}</p>
                      <p className="navbar__profile-email">{user.email}</p>
                    </div>
                  </div>
                )}

                <div className="navbar__profile-divider" />

                <Link
                  to="/profile"
                  className="navbar__profile-item"
                  onClick={() => setProfileOpen(false)}
                >
                  <IoPersonOutline size={16} />
                  Profile
                </Link>

                <div className="navbar__profile-divider" />


                {user ? (
                  <button
                    className="navbar__profile-item navbar__profile-logout"
                    onClick={handleLogout}
                  >
                    <IoLogOutOutline size={16} />
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="navbar__profile-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    <IoPersonOutline size={16} />
                    Login
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div
            className="navbar__overlay"
            onClick={() => setMobileOpen(false)}
          />
          <div className="navbar__drawer animate-slideInLeft">
            <div className="navbar__drawer-header">
              <span className="navbar__drawer-logo">SHOP.CO</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="navbar__drawer-close"
                aria-label="Close menu"
              >
                <IoCloseOutline size={26} />
              </button>
            </div>

            <div className="navbar__drawer-search">
              <form onSubmit={handleSearch}>
                <div className="navbar__drawer-search-wrap">
                  <IoSearchOutline
                    size={16}
                    className="navbar__drawer-search-icon"
                  />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    className="navbar__drawer-search-input"
                  />
                </div>
              </form>
            </div>

            <nav className="navbar__drawer-nav">
              <p className="navbar__drawer-label">Shop by Category</p>
              {shopCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="navbar__drawer-link"
                >
                  {cat.name}
                </Link>
              ))}
              <div className="navbar__drawer-links-extra">
                <Link
                  to="/category/casual?sale=true"
                  onClick={() => setMobileOpen(false)}
                  className="navbar__drawer-link"
                >
                  On Sale
                </Link>
                <Link
                  to="/category/casual?new=true"
                  onClick={() => setMobileOpen(false)}
                  className="navbar__drawer-link"
                >
                  New Arrivals
                </Link>
                <Link
                  to="/category/casual"
                  onClick={() => setMobileOpen(false)}
                  className="navbar__drawer-link"
                >
                  Brands
                </Link>
              </div>
            </nav>

            <div className="navbar__drawer-footer">
              <Link
                to="/cart"
                onClick={() => setMobileOpen(false)}
                className="navbar__drawer-footer-link"
              >
                <CiShoppingCart size={22} />
                Cart{user && cartCount > 0 ? ` (${cartCount})` : ""}
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="navbar__drawer-footer-link"
              >
                <CgProfile size={22} />
                My Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
