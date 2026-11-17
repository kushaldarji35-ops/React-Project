import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoSearchOutline,
  IoBagCheckOutline,
  IoEyeOutline,
  IoTrashOutline,
  IoTimeOutline,
  IoCheckmarkDoneCircleOutline,
  IoCashOutline,
  IoCloseOutline,
  IoLocationOutline,
  IoAlertCircleOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import AdminSidebar from "./AdminSidebar";
import AdminPagination from "./AdminPagination";
import AdminSearchableSelect from "./AdminSearchableSelect";
import { isSessionExpired, clearSession } from "../../services/authService";
import {
  fetchAdminOrders,
  updateOrderStatus,
  deleteOrder,
} from "../../services/orderService";
import "./AdminPages.css";

export default function AdminOrders() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  // Load orders directly from database
  const loadOrders = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const dbOrders = await fetchAdminOrders();
      setOrders(dbOrders);
    } catch (err) {
      console.error("Error fetching orders from database:", err);
      showToast("Failed to fetch orders from database", true);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
    loadOrders(true);
    showToast("Filters cleared & orders refreshed");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isSessionExpired()) {
      clearSession("expired");
      navigate("/login?expired=1");
      return;
    }
    loadOrders();
  }, [navigate]);

  // Real-time synchronization when orders are placed
  useEffect(() => {
    const handleOrderPlaced = () => {
      loadOrders(true);
    };
    window.addEventListener("orderPlaced", handleOrderPlaced);
    window.addEventListener("storage", handleOrderPlaced);
    return () => {
      window.removeEventListener("orderPlaced", handleOrderPlaced);
      window.removeEventListener("storage", handleOrderPlaced);
    };
  }, []);

  // Calculations from real database orders
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) =>
      o.status === "Pending" ||
      o.status === "Processing" ||
      o.status === "Confirmed"
  ).length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (Number(o.total) || 0),
    0
  );

  // Client-side search and status filter
  const filteredOrders = orders.filter((order) => {
    const idMatch = (order.orderNumber || order.id || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const nameMatch = (order.customer?.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const emailMatch = (order.customer?.email || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const mobileMatch = (order.customer?.mobile || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSearch = idMatch || nameMatch || emailMatch || mobileMatch;

    if (statusFilter === "all") return matchesSearch;
    return (
      matchesSearch &&
      (order.status || "").toLowerCase() === statusFilter.toLowerCase()
    );
  });

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  // Handle Quick Status Change with MySQL DB update
  const handleStatusChange = async (targetOrder, newStatus) => {
    if (!targetOrder) return;
    const orderKey = targetOrder.rawId || targetOrder.id;
    const prevStatus = targetOrder.status;

    // Optimistic state update
    const updated = orders.map((o) =>
      (o.rawId && o.rawId === targetOrder.rawId) || o.id === targetOrder.id
        ? { ...o, status: newStatus }
        : o
    );
    setOrders(updated);
    if (
      selectedOrder &&
      ((selectedOrder.rawId && selectedOrder.rawId === targetOrder.rawId) ||
        selectedOrder.id === targetOrder.id)
    ) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }

    try {
      await updateOrderStatus(orderKey, newStatus);
      const displayId = targetOrder.orderNumber || targetOrder.id;
      showToast(`Order #${displayId.replace(/^#/, "")} marked as ${newStatus}`);
    } catch (err) {
      console.error("Failed to update status in database:", err);
      // Revert on error
      const reverted = orders.map((o) =>
        (o.rawId && o.rawId === targetOrder.rawId) || o.id === targetOrder.id
          ? { ...o, status: prevStatus }
          : o
      );
      setOrders(reverted);
      if (
        selectedOrder &&
        ((selectedOrder.rawId && selectedOrder.rawId === targetOrder.rawId) ||
          selectedOrder.id === targetOrder.id)
      ) {
        setSelectedOrder({ ...selectedOrder, status: prevStatus });
      }
      showToast("Error updating order status in database");
    }
  };

  // Handle Delete with MySQL DB removal
  const handleDeleteConfirm = async () => {
    if (!selectedOrder) return;
    const targetOrder = selectedOrder;
    const orderKey = targetOrder.rawId || targetOrder.id;

    try {
      await deleteOrder(orderKey);
      const updated = orders.filter(
        (o) =>
          (o.rawId ? o.rawId !== targetOrder.rawId : true) &&
          o.id !== targetOrder.id
      );
      setOrders(updated);
      setIsDeleteModalOpen(false);
      setIsDetailsModalOpen(false);
      const displayId = targetOrder.orderNumber || targetOrder.id;
      showToast(`Order #${displayId.replace(/^#/, "")} deleted from database`);
    } catch (err) {
      console.error("Failed to delete order from database:", err);
      showToast("Error deleting order from database");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "delivered":
        return "adm-badge--delivered";
      case "shipped":
        return "adm-badge--shipped";
      case "processing":
        return "adm-badge--processing";
      case "pending":
      case "confirmed":
        return "adm-badge--pending";
      case "cancelled":
        return "adm-badge--cancelled";
      default:
        return "adm-badge--user";
    }
  };

  return (
    <div className="adm-page">
      <AdminSidebar />

      <main className="adm-main">
        {/* Toast */}
        {toast && (
          <div
            style={{
              position: "fixed",
              top: 24,
              right: 24,
              background: toast.isError ? "#ef4444" : "#10b981",
              color: "#fff",
              padding: "12px 20px",
              borderRadius: "8px",
              fontWeight: "600",
              zIndex: 9999,
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {toast.isError ? "✕" : "✓"} {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="adm-header">
          <div className="adm-header-left">
            <h1 className="adm-title">Orders Management</h1>
            <p className="adm-subtitle">
              Live orders fetched directly from database
            </p>
          </div>
          <div className="adm-header-right">
            <div className="adm-user-chip">
              <div className="adm-user-avatar">
                {(currentUser.name || "A").charAt(0).toUpperCase()}
              </div>
              <div className="adm-user-info">
                <span className="adm-user-name">
                  {currentUser.name || "Admin"}
                </span>
                <span className="adm-user-role">Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="adm-cardGrid">
          <div className="adm-card adm-card--indigo">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Total Orders</span>
              <span className="adm-cardValue">{totalOrders}</span>
              <span className="adm-cardSubtext">Database orders</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoBagCheckOutline />
            </div>
          </div>

          <div className="adm-card adm-card--amber">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Pending / Processing</span>
              <span className="adm-cardValue">{pendingOrders}</span>
              <span className="adm-cardSubtext">Needs fulfillment</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoTimeOutline />
            </div>
          </div>

          <div className="adm-card adm-card--green">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Delivered Orders</span>
              <span className="adm-cardValue">{deliveredOrders}</span>
              <span className="adm-cardSubtext">Completed shipments</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoCheckmarkDoneCircleOutline />
            </div>
          </div>

          <div className="adm-card adm-card--red">
            <div className="adm-card-content">
              <span className="adm-cardLabel">Total Revenue</span>
              <span className="adm-cardValue">
                ${totalRevenue.toLocaleString()}
              </span>
              <span className="adm-cardSubtext">Gross sales volume</span>
            </div>
            <div className="adm-cardIconWrap">
              <IoCashOutline />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="adm-toolbar">
          <div className="adm-toolbar-left">
            <div className="adm-searchBox">
              <IoSearchOutline size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Search by Order ID, customer, email or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <AdminSearchableSelect
              className="adm-selectFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="All Statuses"
              options={[
                { value: "all", label: "All Statuses" },
                { value: "pending", label: "Pending" },
                { value: "confirmed", label: "Confirmed" },
                { value: "processing", label: "Processing" },
                { value: "shipped", label: "Shipped" },
                { value: "delivered", label: "Delivered" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            />

            <button
              className="adm-btn-refresh"
              onClick={handleClearFilters}
              title="Refresh and clear filters"
            >
              <IoRefreshOutline size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="adm-table-card">
          <div className="adm-table-responsive">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>CUSTOMER NAME</th>
                  <th>EMAIL ID</th>
                  <th>ITEMS</th>
                  <th>TOTAL AMOUNT</th>
                  <th>PAYMENT</th>
                  <th>STATUS</th>
                  <th>ORDER DATE</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="10"
                      style={{ textAlign: "center", padding: "48px 16px" }}
                    >
                      <div
                        style={{
                          display: "inline-block",
                          width: 32,
                          height: 32,
                          border: "3px solid #e2e8f0",
                          borderTopColor: "#0f172a",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      <p
                        style={{
                          marginTop: 12,
                          color: "#64748b",
                          fontSize: "14px",
                        }}
                      >
                        Loading orders from database...
                      </p>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="10">
                      <div className="adm-empty">
                        <div className="adm-empty-icon">📦</div>
                        <h3 className="adm-empty-title">
                          {orders.length === 0
                            ? "No orders found in database"
                            : "No matching orders found"}
                        </h3>
                        <p>
                          {orders.length === 0
                            ? "When customers place orders, they will appear here in real time."
                            : "No orders match your active search and filter criteria."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => {
                    const rawOrderNumber = order.orderNumber || order.id || "";
                    const displayOrderId = rawOrderNumber.startsWith("#")
                      ? rawOrderNumber
                      : `#${rawOrderNumber}`;

                    const dateFormatted = new Date(
                      order.createdAt
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    const totalItems =
                      order.items?.reduce(
                        (c, i) => c + (Number(i.quantity) || 1),
                        0
                      ) ||
                      order.totalItems ||
                      1;

                    return (
                      <tr key={order.rawId || order.id}>
                        <td style={{ fontWeight: "700", color: "#0f172a" }}>
                          {displayOrderId}
                        </td>
                        <td>
                          <span style={{ fontWeight: "700", color: "#0f172a" }}>
                            {order.customer?.name || "Customer"}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: "#475569", fontSize: "13px" }}>
                            {order.customer?.email || "—"}
                          </span>
                        </td>
                        
                        <td>
                          <span style={{ fontWeight: "600" }}>
                            {totalItems} item(s)
                          </span>
                        </td>
                        <td style={{ fontWeight: "800", color: "#0f172a" }}>
                          ${Number(order.total).toFixed(0)}
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", color: "#475569" }}>
                            {order.paymentMethod || "Cash on Delivery"}
                          </span>
                        </td>
                        <td>
                          <select
                            className={`adm-badge ${getStatusBadgeClass(
                              order.status
                            )}`}
                            style={{
                              border: "none",
                              outline: "none",
                              cursor: "pointer",
                              padding: "4px 8px",
                              fontWeight: "700",
                            }}
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order, e.target.value)
                            }
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>{dateFormatted}</td>
                        <td style={{ textAlign: "right" }}>
                          <div
                            className="adm-actions-cell"
                            style={{ justifyContent: "flex-end" }}
                          >
                            <button
                              className="adm-btn-action adm-btn-action--view"
                              title="View Order Details"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDetailsModalOpen(true);
                              }}
                            >
                              <IoEyeOutline size={15} />
                            </button>
                            <button
                              className="adm-btn-action adm-btn-action--delete"
                              title="Delete Order"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <IoTrashOutline size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <AdminPagination
            currentPage={safeCurrentPage}
            totalItems={filteredOrders.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>

        {/* ─── ORDER DETAILS MODAL ─── */}
        {isDetailsModalOpen && selectedOrder && (
          <div className="adm-modal-overlay">
            <div className="adm-modal adm-modal--lg">
              <div className="adm-modal-header">
                <div>
                  <h3 className="adm-modal-title">
                    Order #
                    {(selectedOrder.orderNumber || selectedOrder.id).replace(
                      /^#/,
                      ""
                    )}
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Placed on{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <button
                  className="adm-modal-close"
                  onClick={() => setIsDetailsModalOpen(false)}
                >
                  <IoCloseOutline />
                </button>
              </div>

              <div className="adm-modal-body">
                {/* Summary Grid */}
                <div className="adm-order-summary-grid">
                  <div>
                    <h4
                      style={{
                        margin: "0 0 6px 0",
                        fontSize: "13px",
                        color: "#64748b",
                      }}
                    >
                      CUSTOMER DETAILS
                    </h4>
                    <p style={{ margin: "0 0 2px 0", fontWeight: "700" }}>
                      {selectedOrder.customer?.name}
                    </p>
                    <p
                      style={{
                        margin: "0 0 2px 0",
                        fontSize: "13px",
                        color: "#475569",
                      }}
                    >
                      {selectedOrder.customer?.email}
                    </p>
                    <p
                      style={{ margin: 0, fontSize: "13px", color: "#475569" }}
                    >
                      📞 {selectedOrder.customer?.mobile}
                    </p>
                  </div>

                  <div>
                    <h4
                      style={{
                        margin: "0 0 6px 0",
                        fontSize: "13px",
                        color: "#64748b",
                      }}
                    >
                      DELIVERY ADDRESS
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        lineHeight: "1.4",
                        color: "#334155",
                      }}
                    >
                      <IoLocationOutline style={{ verticalAlign: "middle" }} />{" "}
                      {selectedOrder.customer?.address}
                    </p>
                  </div>
                </div>

                {/* Status & Payment Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                    padding: "12px 16px",
                    background: "#f1f5f9",
                    borderRadius: "8px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      Payment Mode:{" "}
                    </span>
                    <strong style={{ fontSize: "13px" }}>
                      {selectedOrder.paymentMethod}
                    </strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      Status:{" "}
                    </span>
                    <select
                      className={`adm-badge ${getStatusBadgeClass(
                        selectedOrder.status
                      )}`}
                      style={{
                        border: "none",
                        padding: "6px 12px",
                        fontWeight: "700",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                      value={selectedOrder.status}
                      onChange={(e) =>
                        handleStatusChange(selectedOrder, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Items List */}
                <h4
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: "14px",
                    fontWeight: "700",
                  }}
                >
                  Ordered Items ({selectedOrder.items?.length || 0})
                </h4>
                <div className="adm-order-items-list">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="adm-order-item-row">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 6,
                                objectFit: "cover",
                                background: "#f8fafc",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 6,
                                background: "#e2e8f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "18px",
                              }}
                            >
                              🛍️
                            </div>
                          )}
                          <div>
                            <div
                              style={{ fontWeight: "700", fontSize: "13.5px" }}
                            >
                              {item.name}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                              {item.size ? `Size: ${item.size} · ` : ""}Qty:{" "}
                              {item.quantity}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontWeight: "700", fontSize: "14px" }}>
                          $
                          {item.totalPrice != null
                            ? item.totalPrice
                            : item.price * item.quantity}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        padding: "16px",
                        textAlign: "center",
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      No items recorded for this order.
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div
                  style={{
                    marginTop: "20px",
                    paddingTop: "16px",
                    borderTop: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    textAlign: "right",
                  }}
                >
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    Subtotal: ${selectedOrder.subtotal}
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div style={{ fontSize: "13px", color: "#ef4444" }}>
                      Discount: -${selectedOrder.discount}
                    </div>
                  )}
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    Delivery: ${selectedOrder.deliveryFee}
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "800",
                      color: "#0f172a",
                      marginTop: "4px",
                    }}
                  >
                    Total: ${selectedOrder.total}
                  </div>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setIsDetailsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── DELETE ORDER CONFIRMATION ─── */}
        {isDeleteModalOpen && selectedOrder && (
          <div className="adm-modal-overlay">
            <div className="adm-modal" style={{ maxWidth: 420 }}>
              <div className="adm-modal-header">
                <h3 className="adm-modal-title">Delete Order</h3>
                <button
                  className="adm-modal-close"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  <IoCloseOutline />
                </button>
              </div>
              <div className="adm-modal-body" style={{ textAlign: "center" }}>
                <IoAlertCircleOutline size={48} color="#ef4444" />
                <h4 style={{ margin: "12px 0 6px 0", fontSize: "16px" }}>
                  Delete Order #
                  {(selectedOrder.orderNumber || selectedOrder.id).replace(
                    /^#/,
                    ""
                  )}
                  ?
                </h4>
                <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                  This action cannot be undone. The order record for{" "}
                  <strong>{selectedOrder.customer?.name}</strong> will be
                  permanently removed from the database.
                </p>
              </div>
              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="adm-btn-danger"
                  onClick={handleDeleteConfirm}
                >
                  Yes, Delete Order
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
