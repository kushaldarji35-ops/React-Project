import db from "../config/db.js";

//get all orders
const getOrders = (callback) => {
    const sql = `SELECT id, customer, email, item, order_date, status, created_at FROM orders ORDER BY id`;
    db.query(sql, callback);
};

//get order by id
const getOrderById = (id, callback) => {
    const sql = `SELECT id, customer, email, item, order_date, status, created_at FROM orders WHERE id = ?`;
    db.query(sql, [id], callback);
};

//create Order
const createOrder = (customer, email, item, order_date, status, callback) => {
    const sql = `INSERT INTO orders (customer, email, item, order_date, status) VALUES(?,?,?,?,?)`;
    db.query(sql, [customer, email, item, order_date, status], callback);
};

//update order
const updateOrder = (id, customer, email, item, order_date, status, callback) => {
    const sql = `UPDATE orders SET customer = ?, email = ?, item = ?, order_date = ?, status = ? WHERE id = ?`;
    db.query(sql, [customer, email, item, order_date, status, id], callback);
};

//delete order
const deleteOrder = (id, callback) => {
    const sql = `DELETE FROM orders WHERE id = ?`;
    db.query(sql, [id], callback);
};

// get orders by customer email
const getOrdersByCustomerEmail = (email, callback) => {
    const sql = `SELECT id, customer, email, item, order_date, status, created_at FROM orders WHERE email = ? ORDER BY id DESC`;
    db.query(sql, [email], callback);
};

// get single order by id and customer email
const getOrderByIdAndEmail = (id, email, callback) => {
    const sql = `SELECT id, customer, email, item, order_date, status, created_at FROM orders WHERE id = ? AND email = ?`;
    db.query(sql, [id, email], callback);
};

// delete customer order (only if belongs to customer)
const deleteCustomerOrder = (id, email, callback) => {
    const sql = `DELETE FROM orders WHERE id = ? AND email = ?`;
    db.query(sql, [id, email], callback);
};

// get order stats by customer email
const getOrderStatsByCustomerEmail = (email, callback) => {
    const sql = `
        SELECT
            COUNT(*) AS totalOrders,
            SUM(status = 'Pending')   AS pendingOrders,
            SUM(status = 'Confirmed') AS confirmedOrders,
            SUM(status = 'Completed') AS completedOrders,
            SUM(status = 'Cancelled') AS cancelledOrders
        FROM orders
        WHERE email = ?
    `;
    db.query(sql, [email], callback);
};

// get order stats (counts by status)
const getOrderStats = (callback) => {
    const sql = `
        SELECT
            COUNT(*) AS totalOrders,
            SUM(status = 'Pending')   AS pendingOrders,
            SUM(status = 'Confirmed') AS confirmedOrders,
            SUM(status = 'Completed') AS completedOrders,
            SUM(status = 'Cancelled') AS cancelledOrders
        FROM orders
    `;
    db.query(sql, callback);
};

export {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderStats,
    getOrdersByCustomerEmail,
    getOrderByIdAndEmail,
    deleteCustomerOrder,
    getOrderStatsByCustomerEmail
};