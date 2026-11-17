import db from "../config/db.js";

// Get customer profile by ID (no password)
const getProfileById = (id, callback) => {
    const sql = "SELECT id, name, email, mobile, role, created_at FROM users WHERE id = ?";
    db.query(sql, [id], callback);
};

// Update customer name and mobile
const updateProfile = (id, name, mobile, callback) => {
    const sql = "UPDATE users SET name = ?, mobile = ? WHERE id = ?";
    db.query(sql, [name, mobile, id], callback);
};

// Get hashed password for comparison
const getPasswordById = (id, callback) => {
    const sql = "SELECT password FROM users WHERE id = ?";
    db.query(sql, [id], callback);
};

// Update password
const updatePassword = (id, hashedPassword, callback) => {
    const sql = "UPDATE users SET password = ? WHERE id = ?";
    db.query(sql, [hashedPassword, id], callback);
};

// Delete user account by ID
const deleteUserById = (id, callback) => {
    const sql = "DELETE FROM users WHERE id = ?";
    db.query(sql, [id], callback);
};

const customerModel = { getProfileById, updateProfile, getPasswordById, updatePassword, deleteUserById };
export default customerModel;
