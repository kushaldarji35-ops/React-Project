import {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderStats
} from "../models/orderModel.js";


// GET ALL ORDERS
const getAllOrders = (req, res) => {
    getOrders((err, orders) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching orders", error: err.message });
        }
        res.status(200).json(orders);
    });
};


// GET ONE ORDER
const getOneOrder = (req, res) => {
    const { id } = req.params;
    getOrderById(id, (err, orders) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching order", error: err.message });
        }
        if (orders.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json(orders[0]);
    });
};


// CREATE ORDER
const addOrder = (req, res) => {
    const { customer, email, item, order_date, status } = req.body;

    if (!customer || !email || !item || !order_date) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const orderStatus = status || "Pending";

    createOrder(customer, email, item, order_date, orderStatus, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error creating order", error: err.message });
        }
        res.status(201).json({ message: "Order created successfully", orderId: result.insertId });
    });
};


// UPDATE ORDER
const editOrder = (req, res) => {
    const { id } = req.params;
    const { customer, email, item, order_date, status } = req.body;

    if (!customer || !email || !item || !order_date || !status) {
        return res.status(400).json({ message: "All fields are required" });
    }

    updateOrder(id, customer, email, item, order_date, status, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error updating order", error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json({ message: "Order updated successfully" });
    });
};


// DELETE ORDER
const removeOrder = (req, res) => {
    const { id } = req.params;
    deleteOrder(id, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting order", error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json({ message: "Order deleted successfully" });
    });
};


// GET ORDER STATS
const getStats = (req, res) => {
    getOrderStats((err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching stats", error: err.message });
        }
        res.status(200).json(results[0]);
    });
};


export { getAllOrders, getOneOrder, addOrder, editOrder, removeOrder, getStats };