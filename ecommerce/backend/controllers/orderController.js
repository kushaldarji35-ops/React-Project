import orderModel from "../models/orderModel.js";
import addressModel from "../models/addressModel.js";

// POST /api/orders - place a new order
const createOrder = (req, res) => {
    const userId = req.user.id;
    const {
        address_id,
        addressId,
        address,
        subtotal = 0,
        discount = 0,
        delivery_fee = 0,
        deliveryFee = 0,
        total = 0,
        payment_method = "cod",
        paymentMethod,
        payment_status,
        paymentStatus,
        order_status = "confirmed",
        orderStatus,
        tracking_number = null,
        trackingNumber,
        items = []
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order must include at least one item" });
    }

    const method = String(payment_method || paymentMethod || "cod").toLowerCase();
    const finalPaymentStatus =
        payment_status ||
        paymentStatus ||
        (method === "cod" ? "pending" : "paid");

    const proceedWithAddressId = (resolvedAddrId) => {
        const orderData = {
            address_id: resolvedAddrId ? Number(resolvedAddrId) : null,
            subtotal: Number(subtotal),
            discount: Number(discount),
            delivery_fee: Number(delivery_fee || deliveryFee),
            total: Number(total),
            payment_method: method,
            payment_status: finalPaymentStatus,
            order_status: order_status || orderStatus || "confirmed",
            tracking_number: tracking_number || trackingNumber || null
        };

        orderModel.create(userId, orderData, items, (err, result) => {
            if (err) {
                console.error("Order creation error:", err);
                return res.status(500).json({ message: "Error creating order", error: err.message });
            }
            res.status(201).json({
                message: "Order placed successfully",
                orderId: result.orderId,
                orderNumber: result.orderNumber
            });
        });
    };

    const initialAddrId = address_id || addressId;
    if (initialAddrId) {
        return proceedWithAddressId(initialAddrId);
    }

    // Auto-create address if address payload provided
    if (address && (address.line1 || address.address_line1 || address.city)) {
        const addrData = {
            full_name: address.full_name || address.fullName || req.user.name || "Customer",
            mobile: address.mobile || address.phone || req.user.mobile || "0000000000",
            line1: address.line1 || address.address_line1 || "Street Address",
            line2: address.line2 || "",
            line3: address.line3 || "",
            city: address.city || "City",
            state: address.state || "State",
            pincode: address.pincode || address.zip || "000000",
            country: address.country || "India",
            address_type: (address.address_type || address.deliveryType || "home").toLowerCase()
        };

        return addressModel.create(userId, addrData, (addrErr, addrResult) => {
            if (!addrErr && addrResult && addrResult.insertId) {
                return proceedWithAddressId(addrResult.insertId);
            }
            // If failed, proceed without address_id
            proceedWithAddressId(null);
        });
    }

    // Fallback: check if user has any existing saved address
    addressModel.getByUserId(userId, (addrErr, addrs) => {
        if (!addrErr && addrs && addrs.length > 0) {
            return proceedWithAddressId(addrs[0].id);
        }
        proceedWithAddressId(null);
    });
};

// GET /api/orders/my-orders - get logged-in customer's orders
const getMyOrders = (req, res) => {
    orderModel.getByUserId(req.user.id, (err, orders) => {
        if (err) return res.status(500).json({ message: "Database error fetching orders", error: err.message });
        res.json(orders);
    });
};

// GET /api/orders - get all orders (for admin dashboard / orders management)
const getAllOrders = (req, res) => {
    const { status, search } = req.query;
    orderModel.getAll({ status, search }, (err, orders) => {
        if (err) {
            console.error("Database error fetching orders in getAllOrders:", err);
            return res.status(500).json({ message: "Database error fetching orders", error: err.message });
        }
        res.json(orders || []);
    });
};

// GET /api/orders/:id - get single order by ID
const getOrderById = (req, res) => {
    const { id } = req.params;
    const userRole = String(req.user?.role || "").toLowerCase();
    const isAdmin = userRole === "admin" || !req.user?.id;
    const userId = isAdmin ? null : req.user.id;

    orderModel.getById(id, userId, (err, order) => {
        if (err) return res.status(500).json({ message: "Database error", error: err.message });
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    });
};

// PUT /api/orders/:id/status - update order status (admin)
const updateOrderStatus = (req, res) => {
    const { id } = req.params;
    const { order_status, orderStatus, payment_status, paymentStatus, tracking_number, trackingNumber } = req.body;

    const data = {
        order_status: order_status || orderStatus,
        payment_status: payment_status || paymentStatus,
        tracking_number: tracking_number || trackingNumber
    };

    orderModel.updateStatus(id, data, (err, result) => {
        if (err) return res.status(500).json({ message: "Error updating order status", error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Order not found" });
        res.json({ message: "Order status updated successfully" });
    });
};

// DELETE /api/orders/:id - delete order
const deleteOrder = (req, res) => {
    const { id } = req.params;
    orderModel.remove(id, (err, result) => {
        if (err) return res.status(500).json({ message: "Error deleting order", error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Order not found" });
        res.json({ message: "Order deleted successfully" });
    });
};

const orderController = {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
};

export default orderController;
