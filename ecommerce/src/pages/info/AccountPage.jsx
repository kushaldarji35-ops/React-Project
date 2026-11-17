import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IoPersonOutline,
  IoBagCheckOutline,
  IoLocationOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoShieldCheckmarkOutline,
  IoSparklesOutline,
  IoArrowForwardOutline,
  IoAirplaneOutline,
  IoCardOutline,
} from "react-icons/io5";
import Breadcrumb from "../../components/ui/Breadcrumb";
import { getCustomerProfile, clearSession } from "../../services/authService";
import "./InfoPages.css";

export default function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getCustomerProfile()
        .then((data) => {
          setUser(data);
          setLoading(false);
        })
        .catch(() => {
          setUser(null);
          setLoading(false);
        });
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    clearSession();
    setUser(null);
    navigate("/login");
  };

  const accountTiles = [
    {
      icon: IoBagCheckOutline,
      title: "Orders & Purchases",
      desc: "View past invoices, active shipments, and track deliveries in real time.",
      link: "/orders",
      badge: "Active",
    },
    {
      icon: IoAirplaneOutline,
      title: "Manage Deliveries",
      desc: "Change shipping address, delivery time slots, or add courier instructions.",
      link: "/manage-deliveries",
    },
    {
      icon: IoPersonOutline,
      title: "Personal Profile",
      desc: "Update your name, mobile number, and contact preferences.",
      link: "/profile",
    },
    {
      icon: IoLocationOutline,
      title: "Saved Addresses",
      desc: "Manage default shipping and billing addresses for 1-click checkout.",
      link: "/add-address",
    },
    {
      icon: IoCardOutline,
      title: "Payment Methods",
      desc: "View accepted payment modes, security standards, and invoices.",
      link: "/payments",
    },
    {
      icon: IoSettingsOutline,
      title: "Account Settings",
      desc: "Change password, enable two-factor security, or delete account.",
      link: "/settings",
    },
  ];

  return (
    <div className="info-page">
      <div className="info-container">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "My Account" }]} />

        {/* Hero */}
        <section className="info-hero">
          <span className="info-hero__badge">
            <IoPersonOutline /> Customer Hub
          </span>
          <h1 className="info-hero__title">
            {user ? `Welcome Back, ${user.name || "Valued Member"}!` : "Your SHOP.CO Account Hub"}
          </h1>
          <p className="info-hero__subtitle">
            {user
              ? "Manage your active orders, personal sizing preferences, shipping destinations, and security settings in one place."
              : "Access real-time order tracking, faster 1-click checkouts, personalized size recommendations, and VIP member drops."}
          </p>

          {!user && (
            <div className="info-hero__actions">
              <Link to="/login" className="btn-primary-dark">
                Sign In to Account
              </Link>
              <Link to="/signup" className="btn-secondary-light">
                Create Free Account
              </Link>
            </div>
          )}
        </section>

        {/* If logged in: User Overview Bar */}
        {user && (
          <section className="info-section">
            <div
              className="info-card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px",
                background: "#000000",
                color: "#ffffff",
                marginBottom: "32px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    color: "#000000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "900",
                    fontSize: "20px",
                  }}
                >
                  {(user.name || "U")[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0 }}>{user.name}</h3>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", margin: "2px 0 0" }}>{user.email}</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ textAlign: "right", borderRight: "1px solid rgba(255,255,255,0.2)", paddingRight: "16px" }}>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#aaa" }}>
                    Membership
                  </span>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#eab308", display: "flex", alignItems: "center", gap: "4px" }}>
                    <IoSparklesOutline /> VIP Gold Tier
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-outline"
                  style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}
                >
                  <IoLogOutOutline size={16} /> Sign Out
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Dashboard Navigation Grid */}
        <section className="info-section">
          <div className="info-section-header">
            <div className="info-section-tag">Quick Management</div>
            <h2 className="info-section-title">Account Services</h2>
          </div>

          <div className="info-grid-3">
            {accountTiles.map((tile, idx) => {
              const Icon = tile.icon;
              return (
                <Link
                  key={idx}
                  to={tile.link}
                  className="info-card info-card--hover"
                  style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div className="info-icon-box">
                      <Icon />
                    </div>
                    {tile.badge && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          background: "#000",
                          color: "#fff",
                          padding: "2px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        {tile.badge}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: "800", marginBottom: "6px", color: "#111" }}>
                    {tile.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.5", flex: 1 }}>
                    {tile.desc}
                  </p>
                  <div
                    style={{
                      marginTop: "16px",
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#000",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    Open section <IoArrowForwardOutline />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* VIP Perks Highlight */}
        <section className="info-section">
          <div
            className="info-card"
            style={{
              background: "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
              color: "#ffffff",
              padding: "36px",
            }}
          >
            <div className="info-grid-2" style={{ alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#facc15", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Exclusive Benefits
                </span>
                <h3 style={{ fontSize: "24px", fontWeight: "900", margin: "6px 0 10px" }}>
                  Unlock SHOP.CO Member Rewards
                </h3>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: "1.6" }}>
                  Every purchase earns you 1 point per $1 spent. Redeem points for exclusive discounts, free expedited shipping, and private runway access.
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <Link to="/features" className="btn-primary-dark">
                  Learn About Perks
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
