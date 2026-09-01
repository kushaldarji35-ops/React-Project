import db from "../config/db.js";

//create User
const createuser = (name, email, password, callback) => {
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, password], callback);
};

// Get all Users
const getusers = (callback) => {
    const sql = 'SELECT id, name, email, role, created_at FROM users ORDER BY id';
    db.query(sql, callback);
};

// get user by email
const getuserbyemail = (email, callback) => {
    const sql = `SELECT * FROM users where email = ?`;
    db.query(sql, [email], callback);
};

// get user by ID
const getuserbyid = (id, callback) => {
    const sql = 'SELECT id, name, email, role, created_at from users where id = ?';
    db.query(sql, [id], callback);
};

//update user
const updateuser = (id, name, callback) => {
    const sql = 'UPDATE users SET name = ? WHERE id = ?';
    db.query(sql, [name, id], callback);
};

//delete user
const deleteuser = (id, callback) => {
    const sql = 'DELETE FROM users WHERE id = ?';
    db.query(sql, [id], callback);
};

//get total users count
const getTotalUsers = (callback) => {
    const sql = 'SELECT COUNT(*) AS totalUsers FROM users';
    db.query(sql, callback);
}

export default { createuser, getusers, getuserbyemail, getuserbyid, updateuser, deleteuser, getTotalUsers };
