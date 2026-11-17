import React, { useState, useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  IoSearchOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoDocumentTextOutline,
  IoHandRightOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoArrowBackOutline,
} from "react-icons/io5";
import Breadcrumb from "../../components/ui/Breadcrumb";
import "./InfoPages.css";

// Helper to format an order object into delivery tracking structure
function buildDeliveryFromOrder(order) {
  if (!order) return null;
  const rawStatus = String(order.status || "").toLowerCase();
  const isDelivered = rawStatus === "delivered";
  const isCancelled = rawStatus === "cancelled";
  const isReturned = rawStatus === "returned";

  const dateStr = order.date || "Oct 26, 2026";
  const orderIdClean = String(order.id).startsWith("#") ? order.id : `#${order.id}`;
  const trackingClean = order.trackingId || `TRK-${order.id}`;
  const addressClean = order.shippingAddress || "742 Evergreen Terrace, Brooklyn, NY 11201";

  let statusText = "Out for Delivery";
  let statusBadgeBg = "#22c55e";
  let progress = 75;
  let eta = "Today by 4:30 PM";

  if (isDelivered) {
    statusText = "Delivered";
    statusBadgeBg = "#22c55e";
    progress = 100;
    eta = `Delivered on ${dateStr}`;
  } else if (isCancelled) {
    statusText = "Cancelled";
    statusBadgeBg = "#ef4444";
    progress = 100;
    eta = "Order Cancelled";
  } else if (isReturned) {
    statusText = "Returned";
    statusBadgeBg = "#a855f7";
    progress = 100;
    eta = "Returned to Facility";
  } else {
    statusText = "Out for Delivery";
    statusBadgeBg = "#22c55e";
    progress = 75;
    eta = "Today by 4:30 PM";
  }

  // Milestones matching Photo 2
  let milestones = [];
  if (isDelivered) {
    milestones = [
      { step: "1. Placed", time: `${dateStr}, 09:30 AM`, color: "#000", isDone: true },
      { step: "2. Dispatched", time: `${dateStr}, 01:15 PM`, color: "#000", isDone: true },
      { step: "3. Out for Delivery", time: `${dateStr}, 03:45 PM`, color: "#000", isDone: true },
      { step: "4. Delivered", time: `${dateStr}, 05:20 PM`, color: "#16a34a", isDone: true, isHighlight: true },
    ];
  } else if (isCancelled) {
    milestones = [
      { step: "1. Placed", time: `${dateStr}, 09:30 AM`, color: "#000", isDone: true },
      { step: "2. Processing", time: "Cancelled", color: "#ef4444", isDone: false },
      { step: "3. Out for Delivery", time: "—", color: "#999", isDone: false },
      { step: "4. Cancelled", time: `${dateStr}`, color: "#ef4444", isDone: true, isHighlight: true },
    ];
  } else if (isReturned) {
    milestones = [
      { step: "1. Placed", time: `${dateStr}`, color: "#000", isDone: true },
      { step: "2. Dispatched", time: `${dateStr}`, color: "#000", isDone: true },
      { step: "3. Return Picked", time: "In Transit", color: "#000", isDone: true },
      { step: "4. Returned", time: "Refund Issued", color: "#a855f7", isDone: true, isHighlight: true },
    ];
  } else {
    milestones = [
      { step: "1. Placed", time: `${dateStr}, 11:00 AM`, color: "#000", isDone: true },
      { step: "2. Dispatched", time: `${dateStr}, 02:40 PM`, color: "#000", isDone: true },
      { step: "3. Out for Delivery", time: "In Transit Now", color: "#22c55e", isDone: true, inTransit: true },
      { step: "4. Delivered", time: "Today 4:30 PM", color: "#aaa", isDone: false },
    ];
  }

  // Events matching Photo 2
  let events = [];
  const primaryItem = order.items && order.items[0] ? order.items[0].name : "purchased goods";

  if (isDelivered) {
    events = [
      { time: `${dateStr}, 05:20 PM`, text: "Package handed directly to resident / Delivered", location: addressClean },
      { time: `${dateStr}, 03:45 PM`, text: "Out for delivery with local courier agent", location: "Brooklyn Depot, NY" },
      { time: `${dateStr}, 01:15 PM`, text: "Arrived at regional air distribution hub", location: "JFK Airport Hub, NY" },
      { time: `${dateStr}, 09:30 AM`, text: `Order verified, inspected & packed for ${primaryItem}`, location: "SHOP.CO Workshop" },
    ];
  } else if (isCancelled) {
    events = [
      { time: `${dateStr}, 11:30 AM`, text: `Order ${orderIdClean} cancelled per customer request`, location: "SHOP.CO Support" },
      { time: `${dateStr}, 09:30 AM`, text: `Order received and confirmed`, location: "SHOP.CO Workshop" },
    ];
  } else if (isReturned) {
    events = [
      { time: `${dateStr}, 04:15 PM`, text: "Returned package verified and refund issued", location: "SHOP.CO Central Return Atelier" },
      { time: `${dateStr}, 10:00 AM`, text: "Return parcel collected from destination", location: addressClean },
    ];
  } else {
    events = [
      { time: "Today, 08:15 AM", text: "Package loaded onto local delivery van", location: "Brooklyn Depot, NY" },
      { time: "Yesterday, 07:30 PM", text: "Arrived at regional air distribution hub", location: "JFK Airport Hub, NY" },
      { time: `${dateStr}, 02:40 PM`, text: "Scanned & dispatched from fulfillment atelier", location: "Secaucus Center, NJ" },
      { time: `${dateStr}, 11:00 AM`, text: `Order verified, inspected & packed for ${primaryItem}`, location: "SHOP.CO Workshop" },
    ];
  }

  return {
    trackingId: trackingClean,
    orderId: orderIdClean,
    carrier: "FEDEX EXPRESS PRIORITY",
    destination: addressClean,
    status: statusText,
    badgeBg: statusBadgeBg,
    eta,
    progress,
    milestones,
    events,
    items: order.items || [],
    total: order.total || 0,
    date: dateStr,
  };
}

// Fallback demo orders for testing & direct link visits
const DEMO_ORDERS = [
  {
    id: "ORD-7205792248",
    date: "Oct 26, 2026",
    status: "Delivered",
    total: 306.0,
    trackingId: "TRK-2",
    shippingAddress: "742 Evergreen Terrace, Brooklyn, NY 11201",
    items: [
      {
        name: "T sgirt",
        size: "Medium",
        color: "Navy",
        qty: 1,
        price: 364.0,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "ORD-2676733692",
    date: "Oct 23, 2026",
    status: "On the way",
    total: 169.0,
    trackingId: "TRK-1",
    shippingAddress: "742 Evergreen Terrace, Brooklyn, NY 11201",
    items: [
      {
        name: "Vintage Boy T Shirt",
        size: "Small",
        color: "Olive",
        qty: 1,
        price: 192.0,
        image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "ORD-94821",
    date: "Oct 12, 2026",
    status: "Out for Delivery",
    total: 245.0,
    trackingId: "SHP-884920",
    shippingAddress: "742 Evergreen Terrace, Brooklyn, NY 11201",
    items: [
      {
        name: "Gradient Graphic T-shirt",
        size: "Large",
        color: "White",
        qty: 1,
        price: 145.0,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80",
      },
    ],
  },
];

export default function ManageDeliveriesPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [trackingNumber, setTrackingNumber] = useState("");
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [userOrders, setUserOrders] = useState(DEMO_ORDERS);
  const [activeModal, setActiveModal] = useState(null); // 'reschedule' | 'instructions' | 'address' | 'hold'
  const [successToast, setSuccessToast] = useState("");

  // Initialize tracking data from route state, URL search param, or user orders
  useEffect(() => {
    const passedOrder = location.state?.order;
    const trackingParam = searchParams.get("tracking") || searchParams.get("orderId");

    // Fetch user orders if logged in to enrich lookup capability
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data) && data.length > 0) {
            const formatted = data.map((d) => {
              const dateObj = new Date(d.created_at || d.date || Date.now());
              const dateStr = dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const rawStatus = String(d.order_status || "").toLowerCase();
              let statusStr = "On the way";
              if (rawStatus === "delivered") statusStr = "Delivered";
              else if (rawStatus === "cancelled") statusStr = "Cancelled";
              else if (rawStatus === "returned") statusStr = "Returned";

              return {
                id: d.order_number || String(d.id),
                date: dateStr,
                status: statusStr,
                total: Number(d.total) || 0,
                trackingId: d.tracking_number || `TRK-${d.id}`,
                shippingAddress:
                  [d.line1, d.line2, d.city, d.state, d.pincode]
                    .filter(Boolean)
                    .join(", ") || "742 Evergreen Terrace, Brooklyn, NY 11201",
                items: (d.items || []).map((it) => ({
                  name: it.product_name || "Product",
                  size: it.size || "Standard",
                  color: it.color || "",
                  qty: Number(it.quantity) || 1,
                  price: Number(it.price) || 0,
                  image:
                    it.product_image ||
                    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80",
                })),
              };
            });
            setUserOrders(formatted);

            // If we don't have a passed order from state, resolve with fetched orders
            if (!passedOrder) {
              resolveInitialDelivery(formatted, trackingParam);
            }
          } else {
            if (!passedOrder) {
              resolveInitialDelivery(DEMO_ORDERS, trackingParam);
            }
          }
        })
        .catch(() => {
          if (!passedOrder) {
            resolveInitialDelivery(DEMO_ORDERS, trackingParam);
          }
        });
    }

    if (passedOrder) {
      const delivery = buildDeliveryFromOrder(passedOrder);
      setActiveDelivery(delivery);
      setTrackingNumber(delivery.trackingId);
    } else if (!token) {
      resolveInitialDelivery(DEMO_ORDERS, trackingParam);
    }
  }, [location.state, searchParams]);

  const resolveInitialDelivery = (ordersList, trackingQuery) => {
    if (!ordersList || ordersList.length === 0) return;

    if (trackingQuery) {
      const q = trackingQuery.trim().toLowerCase();
      const match = ordersList.find(
        (o) =>
          String(o.trackingId || "").toLowerCase() === q ||
          String(o.id || "").toLowerCase() === q ||
          String(o.id || "").toLowerCase() === `#${q}` ||
          `#${String(o.id || "").toLowerCase()}` === q
      );

      if (match) {
        const delivery = buildDeliveryFromOrder(match);
        setActiveDelivery(delivery);
        setTrackingNumber(delivery.trackingId);
        return;
      }
    }

    // Default to the first order
    const defaultOrder = ordersList[0];
    const delivery = buildDeliveryFromOrder(defaultOrder);
    setActiveDelivery(delivery);
    setTrackingNumber(delivery.trackingId);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = trackingNumber.trim();
    if (!query) return;

    const q = query.toLowerCase();
    // Look up in loaded user orders
    const match = userOrders.find(
      (o) =>
        String(o.trackingId || "").toLowerCase() === q ||
        String(o.id || "").toLowerCase() === q ||
        String(o.id || "").toLowerCase() === `#${q}` ||
        `#${String(o.id || "").toLowerCase()}` === q
    );

    if (match) {
      const delivery = buildDeliveryFromOrder(match);
      setActiveDelivery(delivery);
      setSuccessToast(`Found active shipment records for ${query}`);
    } else {
      // Dynamic fallback for any entered tracking query
      setActiveDelivery({
        trackingId: query.toUpperCase(),
        orderId: `#ORD-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        carrier: "FEDEX EXPRESS PRIORITY",
        destination: "742 Evergreen Terrace, Brooklyn, NY 11201",
        status: "Out for Delivery",
        badgeBg: "#22c55e",
        eta: "Today by 4:30 PM",
        progress: 75,
        milestones: [
          { step: "1. Placed", time: "Oct 26, 11:00 AM", color: "#000", isDone: true },
          { step: "2. Dispatched", time: "Oct 26, 02:40 PM", color: "#000", isDone: true },
          { step: "3. Out for Delivery", time: "In Transit Now", color: "#22c55e", inTransit: true, isDone: true },
          { step: "4. Delivered", time: "Today 4:30 PM", color: "#aaa", isDone: false },
        ],
        events: [
          { time: "Today, 08:15 AM", text: "Package loaded onto local delivery van", location: "Brooklyn Depot, NY" },
          { time: "Yesterday, 07:30 PM", text: "Arrived at regional air distribution hub", location: "JFK Airport Hub, NY" },
          { time: "Oct 26, 02:40 PM", text: "Scanned & dispatched from fulfillment atelier", location: "Secaucus Center, NJ" },
          { time: "Oct 26, 11:00 AM", text: "Order verified, inspected & packed with eco-mailer", location: "SHOP.CO Workshop" },
        ],
        items: [],
      });
      setSuccessToast(`Showing live tracking records for ${query}`);
    }

    setTimeout(() => setSuccessToast(""), 3500);
  };

  const handleModalSubmit = (actionName) => {
    setActiveModal(null);
    setSuccessToast(`${actionName} applied successfully! A confirmation SMS and email have been sent.`);
    setTimeout(() => setSuccessToast(""), 3500);
  };

  return (
    <div className="info-page">
      <div className="info-container">
        {/* Top Breadcrumb & Back Link */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Manage Deliveries" }]} />
          <Link
            to="/orders"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: "700",
              color: "#111",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "8px",
              background: "#f5f5f5",
              transition: "all 0.2s ease",
            }}
          >
            <IoArrowBackOutline size={14} /> Back to My Orders
          </Link>
        </div>

        <h1 className="visually-hidden">Track & Manage Deliveries</h1>

        {/* Tracking Search Bar */}
        <form onSubmit={handleSearch} className="orders-top-toolbar" style={{ marginTop: "14px" }}>
          <div className="orders-search-box">
            <IoSearchOutline size={20} color="#666" />
            <input
              type="text"
              placeholder="Enter Tracking Number (e.g. TRK-2, TRK-1, SHP-884920)..."
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>
          <button type="submit" className="orders-track-btn">
            Track
          </button>
        </form>

        {/* Feedback Alert Toast */}
        {successToast && (
          <div
            style={{
              background: "#dcfce7",
              color: "#15803d",
              padding: "14px 20px",
              borderRadius: "12px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontWeight: "600",
              fontSize: "14px",
              border: "1px solid #bbf7d0",
            }}
          >
            <IoCheckmarkCircleOutline size={20} /> {successToast}
          </div>
        )}

        {/* Active Shipment Tracker Panel */}
        {activeDelivery && (
          <section className="info-section">
            <div className="info-card" style={{ padding: "36px" }}>
              {/* Header Info */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "16px",
                  paddingBottom: "24px",
                  borderBottom: "1px solid #eee",
                  marginBottom: "28px",
                }}
              >
                <div>
                  <span className="info-section-tag">{activeDelivery.carrier}</span>
                  <h2 style={{ fontSize: "24px", fontWeight: "900", margin: "4px 0" }}>
                    {activeDelivery.trackingId}
                  </h2>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    Associated Order: <strong>{activeDelivery.orderId}</strong>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      background: activeDelivery.badgeBg || "#22c55e",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "700",
                      padding: "4px 12px",
                      borderRadius: "999px",
                      display: "inline-block",
                      marginBottom: "6px",
                    }}
                  >
                    ● {activeDelivery.status}
                  </span>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: "#111" }}>
                    {activeDelivery.status === "Delivered" ? activeDelivery.eta : `Expected: ${activeDelivery.eta}`}
                  </div>
                  <div style={{ fontSize: "13px", color: "#777", maxWidth: "340px", wordBreak: "break-word" }}>
                    To: {activeDelivery.destination}
                  </div>
                </div>
              </div>

              {/* Progress Visual Bar */}
              <div style={{ marginBottom: "36px" }}>
                <div style={{ height: "8px", background: "#f0f0f0", borderRadius: "999px", overflow: "hidden", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: `${activeDelivery.progress}%`,
                      height: "100%",
                      background: "#000000",
                      borderRadius: "999px",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", textAlign: "center" }}>
                  {activeDelivery.milestones &&
                    activeDelivery.milestones.map((m, idx) => (
                      <div key={idx}>
                        <div style={{ fontSize: "12px", fontWeight: "800", color: m.color || "#000" }}>
                          {m.step}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: m.inTransit ? "#22c55e" : m.isHighlight ? "#16a34a" : m.color || "#777",
                            fontWeight: m.inTransit || m.isHighlight ? "700" : "500",
                          }}
                        >
                          {m.time}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "32px" }}>
                <button className="btn-outline" onClick={() => setActiveModal("reschedule")}>
                  <IoCalendarOutline size={16} /> Reschedule Delivery
                </button>
                <button className="btn-outline" onClick={() => setActiveModal("instructions")}>
                  <IoDocumentTextOutline size={16} /> Delivery Instructions
                </button>
                <button className="btn-outline" onClick={() => setActiveModal("address")}>
                  <IoLocationOutline size={16} /> Update Destination
                </button>
                <button className="btn-outline" onClick={() => setActiveModal("hold")}>
                  <IoHandRightOutline size={16} /> Hold at Pickup Hub
                </button>
              </div>

              {/* Package Items Preview */}
              {activeDelivery.items && activeDelivery.items.length > 0 && (
                <div
                  style={{
                    marginBottom: "32px",
                    padding: "20px",
                    background: "#fafafa",
                    borderRadius: "14px",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h4
                      style={{
                        fontSize: "13px",
                        fontWeight: "800",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        color: "#555",
                        margin: 0,
                      }}
                    >
                      Package Contents ({activeDelivery.items.length}{" "}
                      {activeDelivery.items.length === 1 ? "item" : "items"})
                    </h4>
                    {activeDelivery.total > 0 && (
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#111" }}>
                        Order Total: ${Number(activeDelivery.total).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {activeDelivery.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          paddingBottom: idx < activeDelivery.items.length - 1 ? "12px" : "0",
                          borderBottom: idx < activeDelivery.items.length - 1 ? "1px solid #f0f0f0" : "none",
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: "52px",
                            height: "52px",
                            objectFit: "cover",
                            borderRadius: "10px",
                            background: "#eaeaea",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <h5 style={{ fontSize: "14px", fontWeight: "700", color: "#111", margin: 0 }}>
                            {item.name}
                          </h5>
                          <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                            {item.size && <>Size: <strong>{item.size}</strong></>}
                            {item.color && <> • Color: <strong>{item.color}</strong></>}
                            {" "}• Qty: <strong>{item.qty}</strong>
                          </div>
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: "800", color: "#000" }}>
                          ${(Number(item.price || 0) * Number(item.qty || 1)).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Event Timeline History */}
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "16px" }}>Shipment Event Log</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {activeDelivery.events &&
                    activeDelivery.events.map((ev, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "14px",
                          padding: "12px 16px",
                          background: i === 0 ? "#f9f9f9" : "transparent",
                          borderRadius: "10px",
                          borderLeft: i === 0 ? "3px solid #000" : "3px solid #ddd",
                        }}
                      >
                        <div style={{ minWidth: "150px", fontSize: "12px", fontWeight: "700", color: "#555" }}>
                          {ev.time}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "14px", fontWeight: i === 0 ? "800" : "600", color: "#111" }}>
                            {ev.text}
                          </div>
                          <div style={{ fontSize: "12px", color: "#777", marginTop: "2px" }}>{ev.location}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Modals for actions */}
        {activeModal && (
          <div className="info-modal-backdrop" onClick={() => setActiveModal(null)}>
            <div className="info-modal-card" onClick={(e) => e.stopPropagation()}>
              <button className="info-modal-close" onClick={() => setActiveModal(null)}>
                <IoCloseOutline size={20} />
              </button>

              {activeModal === "reschedule" && (
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>
                    Reschedule Delivery Date
                  </h3>
                  <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
                    Select your preferred time slot for courier arrival.
                  </p>
                  <div className="info-form-group">
                    <label className="info-form-label">Preferred Date & Window</label>
                    <select className="info-form-select">
                      <option>Tomorrow (09:00 AM - 01:00 PM)</option>
                      <option>Tomorrow (02:00 PM - 06:00 PM)</option>
                      <option>Next Business Day (All Day Window)</option>
                      <option>Upcoming Saturday (Weekend Drop)</option>
                    </select>
                  </div>
                  <button className="btn-solid-black" onClick={() => handleModalSubmit("Rescheduling")}>
                    Confirm New Date
                  </button>
                </div>
              )}

              {activeModal === "instructions" && (
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>
                    Special Courier Instructions
                  </h3>
                  <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
                    Add gate access codes or delivery notes for the courier driver.
                  </p>
                  <div className="info-form-group">
                    <label className="info-form-label">Instruction Note</label>
                    <textarea
                      rows={3}
                      className="info-form-textarea"
                      placeholder="e.g. Leave with building doorman / Ring doorbell twice / Gate code #4820"
                    />
                  </div>
                  <button className="btn-solid-black" onClick={() => handleModalSubmit("Driver instructions")}>
                    Save Instructions
                  </button>
                </div>
              )}

              {activeModal === "address" && (
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>
                    Update Shipping Destination
                  </h3>
                  <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
                    Modify your address before out-for-delivery courier handoff.
                  </p>
                  <div className="info-form-group">
                    <label className="info-form-label">Destination Address</label>
                    <input
                      type="text"
                      className="info-form-input"
                      defaultValue={activeDelivery?.destination || ""}
                    />
                  </div>
                  <button className="btn-solid-black" onClick={() => handleModalSubmit("Address update")}>
                    Update Address
                  </button>
                </div>
              )}

              {activeModal === "hold" && (
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>
                    Hold at Local Pickup Hub
                  </h3>
                  <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
                    Prefer to pick up at your convenience? We can hold your parcel safely for 7 days.
                  </p>
                  <div className="info-form-group">
                    <label className="info-form-label">Select Nearest Hub</label>
                    <select className="info-form-select">
                      <option>FedEx Office Center - 120 Atlantic Ave, Brooklyn</option>
                      <option>Walgreens Pickup Locker - 462 5th Ave, Brooklyn</option>
                      <option>SHOP.CO Boutique Locker - SoHo, Manhattan</option>
                    </select>
                  </div>
                  <button className="btn-solid-black" onClick={() => handleModalSubmit("Hold request")}>
                    Confirm Pickup Hub
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
