import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

// Format address from DB fields
export const formatAddress = (order) => {
  if (!order) return "No delivery address provided";

  // If already a pre-formatted string
  if (typeof order === "string" && order.trim() && order !== "No delivery address provided") {
    return order;
  }
  if (typeof order.address === "string" && order.address.trim() && order.address !== "No delivery address provided") {
    return order.address;
  }

  // Handle nested object or direct fields
  const addr =
    typeof order.address === "object" && order.address !== null
      ? order.address
      : typeof order.customer?.address === "object" && order.customer?.address !== null
      ? order.customer.address
      : order;

  const line1 = addr.line1 || addr.address_line1 || addr.street || "";
  const line2 = addr.line2 || addr.address_line2 || "";
  const line3 = addr.line3 || addr.landmark || "";
  const city = addr.city || "";
  const state = addr.state || "";
  const pincode = addr.pincode || addr.zip || "";
  const country = addr.country || "India";

  const parts = [
    line1,
    line2,
    line3,
    city,
    state,
    pincode ? `— ${pincode}` : "",
    country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ").replace(", —", " —") : "No delivery address provided";
};

// Format payment method into display text
export const formatPaymentMethod = (method) => {
  if (!method) return "Cash on Delivery";
  const lower = String(method).toLowerCase();
  if (lower.includes("card") || lower === "credit card") return "Credit Card";
  if (lower.includes("upi") || lower.includes("qr")) return "UPI / QR Code";
  if (lower.includes("net") || lower.includes("bank")) return "Net Banking";
  if (lower.includes("cod") || lower.includes("cash")) return "Cash on Delivery";
  return method;
};

// Format status into Title Case
export const formatStatus = (status) => {
  if (!status) return "Confirmed";
  const lower = String(status).toLowerCase();
  switch (lower) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "processing":
      return "Processing";
    case "shipped":
    case "out_for_delivery":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

// Normalize single order from API to frontend structure
export const normalizeOrder = (raw) => {
  if (!raw) return null;

  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const normalizedItems = rawItems.map((it) => {
    let itemImg = it.product_image || it.image || "";
    if (!itemImg && it.product_images) {
      try {
        const parsed = JSON.parse(it.product_images);
        if (Array.isArray(parsed) && parsed[0]) itemImg = parsed[0];
      } catch {
        itemImg = it.product_images;
      }
    }

    return {
      id: it.id,
      productId: it.product_id,
      name: it.product_name || it.name || "Product",
      size: it.size || "Standard",
      color: it.color || "",
      quantity: Number(it.quantity) || 1,
      price: Number(it.price || it.current_price || 0),
      totalPrice: Number(it.total_price || (Number(it.price || 0) * (Number(it.quantity) || 1))),
      image: itemImg,
    };
  });

  const totalItemsCount = normalizedItems.reduce(
    (sum, it) => sum + (it.quantity || 1),
    0
  );

  const customerName =
    raw.customer_name && raw.customer_name !== "Customer" && raw.customer_name !== "—"
      ? raw.customer_name
      : raw.address_full_name || raw.user_name || raw.full_name || raw.name || "Customer";

  const customerMobile =
    raw.customer_mobile && raw.customer_mobile !== "—" && raw.customer_mobile !== "-"
      ? raw.customer_mobile
      : raw.address_mobile || raw.mobile || raw.phone || raw.user_mobile || "—";

  const customerEmail =
    raw.customer_email && raw.customer_email !== "—" && raw.customer_email !== "-"
      ? raw.customer_email
      : raw.address_email || raw.email || raw.user_email || "—";

  return {
    rawId: raw.id, // primary key integer ID
    id: raw.order_number || String(raw.id),
    orderNumber: raw.order_number || String(raw.id),
    customer: {
      name: customerName,
      email: customerEmail,
      mobile: customerMobile,
      address: formatAddress(raw),
    },
    items: normalizedItems,
    totalItems: totalItemsCount || raw.total_items || 1,
    subtotal: Number(raw.subtotal) || 0,
    discount: Number(raw.discount) || 0,
    deliveryFee: Number(raw.delivery_fee) || 0,
    total: Number(raw.total) || 0,
    paymentMethod: formatPaymentMethod(raw.payment_method),
    status: formatStatus(raw.order_status),
    trackingNumber: raw.tracking_number || null,
    createdAt: raw.created_at || new Date().toISOString(),
  };
};

// Fetch all orders for admin directly from database
export const fetchAdminOrders = async (params = {}) => {
  try {
    let res;
    try {
      res = await axios.get(`${API_URL}/orders`, {
        ...getAuthHeaders(),
        params,
      });
    } catch (primaryErr) {
      // Fallback to /api/admin/orders
      res = await axios.get(`${API_URL}/admin/orders`, {
        ...getAuthHeaders(),
        params,
      });
    }
    const data = Array.isArray(res.data) ? res.data : [];
    const normalized = data.map(normalizeOrder).filter(Boolean);
    console.log(`[orderService] Fetched ${normalized.length} orders from MySQL:`, normalized);
    return normalized;
  } catch (error) {
    console.error("Error fetching admin orders from database:", error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const lowerStatus = String(newStatus).toLowerCase();
    const res = await axios.put(
      `${API_URL}/orders/${orderId}/status`,
      { order_status: lowerStatus },
      getAuthHeaders()
    );
    return res.data;
  } catch (error) {
    console.error(`Error updating order #${orderId} status:`, error);
    throw error;
  }
};

// Delete order
export const deleteOrder = async (orderId) => {
  try {
    const res = await axios.delete(
      `${API_URL}/orders/${orderId}`,
      getAuthHeaders()
    );
    return res.data;
  } catch (error) {
    console.error(`Error deleting order #${orderId}:`, error);
    throw error;
  }
};

// Place / create a new order (customer side)
export const createOrder = async (orderPayload) => {
  try {
    const res = await axios.post(
      `${API_URL}/orders`,
      orderPayload,
      getAuthHeaders()
    );
    return res.data;
  } catch (error) {
    console.error("Error creating order in database:", error);
    throw error;
  }
};

const orderService = {
  createOrder,
  fetchAdminOrders,
  updateOrderStatus,
  deleteOrder,
  normalizeOrder,
  formatAddress,
  formatPaymentMethod,
  formatStatus,
};

export default orderService;
