import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  IoPeopleOutline,
  IoBagCheckOutline,
  IoShirtOutline,
  IoLayersOutline,
  IoStarOutline,
  IoCashOutline,
  IoArrowForward,
} from "react-icons/io5";
import AdminSidebar from "./AdminSidebar";
import {
  getTotalUsers,
  isSessionExpired,
  clearSession,
} from "../../services/authService";
import { fetchAdminOrders } from "../../services/orderService";
import { products } from "../../data/products";
import "./AdminPages.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [totalUsers, setTotalUsers] = useState(1);
  const [orders, setOrders] = useState([]);

  const [productsList] = useState(() => {
    const saved = localStorage.getItem("admin_products_data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return products;
      }
    }
    return products;
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isSessionExpired()) {
      clearSession("expired");
      navigate("/login?expired=1");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const data = await getTotalUsers();
        if (data && typeof data.totalUsers !== "undefined") {
          setTotalUsers(data.totalUsers);
        }
      } catch (error) {
        console.error("Error fetching total users:", error);
      }
    };

    const fetchOrdersData = async () => {
      try {
        const dbOrders = await fetchAdminOrders();
        setOrders(dbOrders);
      } catch (error) {
        console.error("Error fetching orders for dashboard:", error);
      }
    };

    fetchTotalUsers();
    fetchOrdersData();

    const handleOrderPlaced = () => {
      fetchOrdersData();
    };
    window.addEventListener("orderPlaced", handleOrderPlaced);
    window.addEventListener("storage", handleOrderPlaced);
    return () => {
      window.removeEventListener("orderPlaced", handleOrderPlaced);
      window.removeEventListener("storage", handleOrderPlaced);
    };
  }, []);

  const totalOrdersCount = orders.length;
  const totalProductsCount = productsList.length;
  const totalRevenueAmount = orders.reduce(
    (sum, o) => sum + (Number(o.total) || 0),
    0
  );

  const recentOrders = orders.slice(0, 4);

  return (
    <div className="adm-page">
      <AdminSidebar />

      <main className="adm-main">
        {/* Header */}
        <div className="adm-header">
          <div className="adm-header-left">
            <h1 className="adm-title">Admin Dashboard</h1>
            <p className="adm-subtitle">
              Overview of store performance, catalog stats, and user accounts
            </p>
          </div>
          <div className="adm-header-right">
            <div className="adm-user-chip">
              <div className="adm-user-avatar">
                {(user.name || "A").charAt(0).toUpperCase()}
              </div>
              <div className="adm-user-info">
                <span className="adm-user-name">{user.name || "Admin"}</span>
                <span className="adm-user-role">Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="adm-cardGrid">
          <div
            className="adm-card adm-card--indigo"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/admin/users")}
          >
            <div className="adm-card-content">
              <span className="adm-cardLabel">Total Users</span>
              <span className="adm-cardValue">{totalUsers}</span>
              <span className="adm-cardSubtext">Registered profiles</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoPeopleOutline />
            </div>
          </div>

          <div
            className="adm-card adm-card--green"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/admin/orders")}
          >
            <div className="adm-card-content">
              <span className="adm-cardLabel">Total Orders</span>
              <span className="adm-cardValue">{totalOrdersCount}</span>
              <span className="adm-cardSubtext">Customer checkouts</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoBagCheckOutline />
            </div>
          </div>

          <div
            className="adm-card adm-card--amber"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/admin/products")}
          >
            <div className="adm-card-content">
              <span className="adm-cardLabel">Products</span>
              <span className="adm-cardValue">{totalProductsCount}</span>
              <span className="adm-cardSubtext">Live store items</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoShirtOutline />
            </div>
          </div>

          <div className="adm-card adm-card--red">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Revenue</span>
              <span className="adm-cardValue">
                ${totalRevenueAmount.toLocaleString()}
              </span>
              <span className="adm-cardSubtext">Total sales</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoCashOutline />
            </div>
          </div>
        </div>

        {/* Quick Management Navigation Cards */}
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px" }}>
            Admin Management Hub
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Users Box */}
            <div
              className="adm-card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/admin/users")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  className="adm-cardIconWrap"
                  style={{ background: "#eef2ff", color: "#6366f1", width: 40, height: 40 }}
                >
                  <IoPeopleOutline size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                  Users Directory
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                View all registered accounts, change roles, add users, and manage access privileges.
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#6366f1",
                  marginTop: "8px",
                }}
              >
                Manage Users <IoArrowForward size={14} />
              </div>
            </div>

            {/* Orders Box */}
            <div
              className="adm-card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/admin/orders")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  className="adm-cardIconWrap"
                  style={{ background: "#ecfdf5", color: "#10b981", width: 40, height: 40 }}
                >
                  <IoBagCheckOutline size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                  Orders &amp; Shipments
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                Track live customer orders, update delivery statuses, view payment and shipping breakdowns.
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#10b981",
                  marginTop: "8px",
                }}
              >
                Manage Orders <IoArrowForward size={14} />
              </div>
            </div>

            {/* Products Box */}
            <div
              className="adm-card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/admin/products")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  className="adm-cardIconWrap"
                  style={{ background: "#fffbeb", color: "#f59e0b", width: 40, height: 40 }}
                >
                  <IoShirtOutline size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                  Product Catalog
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                Add new apparel items, update pricing and discounts, manage categories and inventory stock.
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#f59e0b",
                  marginTop: "8px",
                }}
              >
                Manage Products <IoArrowForward size={14} />
              </div>
            </div>

            {/* Categories Box */}
            <div
              className="adm-card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/admin/categories")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  className="adm-cardIconWrap"
                  style={{ background: "#f0fdf4", color: "#16a34a", width: 40, height: 40 }}
                >
                  <IoLayersOutline size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                  Categories
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                Organize storefront dress styles, manage category paths, slugs, and mapped product counts.
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#16a34a",
                  marginTop: "8px",
                }}
              >
                Manage Categories <IoArrowForward size={14} />
              </div>
            </div>

            {/* Reviews Box */}
            <div
              className="adm-card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/admin/reviews")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  className="adm-cardIconWrap"
                  style={{ background: "#faf5ff", color: "#a855f7", width: 40, height: 40 }}
                >
                  <IoStarOutline size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                  Customer Reviews
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                Moderate customer testimonials, filter by star ratings, and publish approved reviews.
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#a855f7",
                  marginTop: "8px",
                }}
              >
                Manage Reviews <IoArrowForward size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        {recentOrders.length > 0 && (
          <div className="adm-table-card">
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>
                Recent Orders
              </h3>
              <Link
                to="/admin/orders"
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#6366f1",
                  textDecoration: "none",
                }}
              >
                View All Orders →
              </Link>
            </div>
            <div className="adm-table-responsive">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total Amount</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td style={{ fontWeight: "700" }}>#{ord.id}</td>
                      <td>{ord.customer?.name}</td>
                      <td style={{ fontWeight: "700" }}>${ord.total}</td>
                      <td>{ord.paymentMethod}</td>
                      <td>
                        <span
                          className={`adm-badge ${
                            ord.status === "Delivered"
                              ? "adm-badge--delivered"
                              : ord.status === "Shipped"
                              ? "adm-badge--shipped"
                              : "adm-badge--processing"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
