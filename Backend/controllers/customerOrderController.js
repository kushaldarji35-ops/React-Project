import {
    createOrder,
    getOrdersByCustomerEmail,
    getOrderByIdAndEmail,
    deleteCustomerOrder,
    getOrderStatsByCustomerEmail,
    updateOrder
} from "../models/orderModel.js";
import adminModel from "../models/adminModel.js";

// GET ALL ORDERS FOR LOGGED-IN CUSTOMER
const getMyOrders = (req, res) => {
    const customerEmail = req.user?.email || req.query.email;

    if (!customerEmail) {
        return res.status(400).json({ message: "Customer email not found in token." });
    }

    getOrdersByCustomerEmail(customerEmail, (err, orders) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching customer orders", error: err.message });
        }
        res.status(200).json(orders || []);
    });
};

// GET ONE ORDER FOR LOGGED-IN CUSTOMER
const getMyOrderById = (req, res) => {
    const { id } = req.params;
    const customerEmail = req.user?.email;

    getOrderByIdAndEmail(id, customerEmail, (err, orders) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching order", error: err.message });
        }
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json(orders[0]);
    });
};

// CREATE ORDER FOR LOGGED-IN CUSTOMER
const createMyOrder = (req, res) => {
    const { item, order_date, status, customer } = req.body;
    // Auto-fetch customer email and name from authenticated token
    const email = req.user?.email || req.body.email;
    const customerName = customer || req.user?.name || "Customer";
    const orderDate = order_date || new Date().toISOString().slice(0, 10);
    const orderStatus = status || "Pending";

    if (!item) {
        return res.status(400).json({ message: "Item/Service is required" });
    }

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    createOrder(customerName, email, item, orderDate, orderStatus, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error creating order", error: err.message });
        }
        res.status(201).json({
            message: "Order placed successfully",
            orderId: result.insertId,
            order: {
                id: result.insertId,
                customer: customerName,
                email,
                item,
                order_date: orderDate,
                status: orderStatus
            }
        });
    });
};

// UPDATE CUSTOMER ORDER
const updateMyOrder = (req, res) => {
    const { id } = req.params;
    const { item, order_date, status, customer } = req.body;
    const email = req.user?.email || req.body.email;
    const customerName = customer || req.user?.name || "Customer";

    if (!item || !order_date) {
        return res.status(400).json({ message: "Item and order date are required" });
    }

    updateOrder(id, customerName, email, item, order_date, status || "Pending", (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error updating order", error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json({ message: "Order updated successfully" });
    });
};

// CANCEL / DELETE ORDER FOR CUSTOMER
const deleteMyOrder = (req, res) => {
    const { id } = req.params;
    const customerEmail = req.user?.email;

    deleteCustomerOrder(id, customerEmail, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting order", error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found or unauthorized" });
        }
        res.status(200).json({ message: "Order cancelled successfully" });
    });
};

// GET CUSTOMER ORDER STATS (Dashboard counts)
const getMyStats = (req, res) => {
    const customerEmail = req.user?.email;

    getOrderStatsByCustomerEmail(customerEmail, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching order stats", error: err.message });
        }
        res.status(200).json(results && results.length > 0 ? results[0] : {
            totalOrders: 0,
            pendingOrders: 0,
            confirmedOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0
        });
    });
};

// GET CUSTOMER PROFILE
const getMyProfile = (req, res) => {
    const email = req.user?.email;
    if (!email) {
        return res.status(400).json({ message: "No email in session" });
    }

    adminModel.getuserbyemail(email, (err, users) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "User profile not found" });
        }
        const u = users[0];
        res.status(200).json({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            created_at: u.created_at
        });
    });
};

export default {
    getMyOrders,
    getMyOrderById,
    createMyOrder,
    updateMyOrder,
    deleteMyOrder,
    getMyStats,
    getMyProfile
};
