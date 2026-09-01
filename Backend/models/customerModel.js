import db from "../config/db.js";

// Get all customers
const getCustomers = (callback) => {
    const sql = `SELECT id, name, email, phone, address, created_at FROM customers ORDER BY id`;
    db.query(sql, callback);
};

// Get customer by ID
const getCustomerById = (id, callback) => {
    const sql = `SELECT id, name, email, phone, address, created_at FROM customers WHERE id = ?`;
    db.query(sql, [id], callback);
};

// Create customer
const createCustomer = (name, email, phone, address, callback) => {
    const sql = `INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)`;
    db.query(sql, [name, email, phone, address], callback);
};

// Update customer
const updateCustomer = (id, name, email, phone, address, callback) => {
    const sql = `UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?`;
    db.query(sql, [name, email, phone, address, id], callback);
};

// Delete customer
const deleteCustomer = (id, callback) => {
    const sql = `DELETE FROM customers WHERE id = ?`;
    db.query(sql, [id], callback);
};

// Get total customers count
const getTotalCustomers = (callback) => {
    const sql = `SELECT COUNT(*) AS totalCustomers FROM customers`;
    db.query(sql, callback);
};

export default {
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getTotalCustomers
};
