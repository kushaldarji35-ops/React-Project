import db from "../config/db.js";

// Ensure existing users with empty, null, or 'user' role are set to 'customer' (while preserving admin users)
db.query("UPDATE users SET role = 'customer' WHERE (role IS NULL OR role = '' OR role = 'user') AND id != 1 AND email NOT LIKE '%admin%'", (err, result) => {
    if (!err && result && result.affectedRows > 0) {
        console.log(`Updated ${result.affectedRows} users with blank role to 'customer'`);
    }
});
db.query("UPDATE users SET role = 'admin' WHERE id = 1 OR email LIKE '%admin%'", () => {});

//create User
const createuser = (name, email, mobile, password, roleOrCallback, maybeCallback) => {
    let role = "customer";
    let callback;

    if (typeof roleOrCallback === "function") {
        // Called with 5 arguments: (name, email, mobile, password, callback)
        callback = roleOrCallback;
        role = "customer";
    } else {
        // Called with 6 arguments: (name, email, mobile, password, role, callback)
        role = (roleOrCallback && typeof roleOrCallback === "string" && roleOrCallback.trim())
            ? roleOrCallback.trim()
            : "customer";
        callback = maybeCallback;
    }

    const sql = 'INSERT INTO users (name, email, mobile, password, role) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, email, mobile, password, role], (err, result) => {
        if (callback && typeof callback === "function") {
            callback(err, result);
        }
    });
};

// Get all Users
const getusers = (callback) => {
    const sql = 'SELECT id, name, email, mobile, role, created_at FROM users ORDER BY id ASC';
    db.query(sql, callback);
};

const getuserbymobile = (mobile, callback) => {
    const sql = `SELECT * FROM users where mobile = ?`;
    db.query(sql, [mobile], callback);
};

// get user by email
const getuserbyemail = (email, callback) => {
    const sql = `SELECT * FROM users where email = ?`;
    db.query(sql, [email], callback);
};

// get user by email OR mobile
const getuserbyemailormobile = (value, callback) => {
    const isEmail = /\S+@\S+\.\S+/.test(value);
    if (isEmail) {
        const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;
        db.query(sql, [value], callback);
    } else {
        const sql = `SELECT * FROM users WHERE mobile = ? LIMIT 1`;
        db.query(sql, [value], callback);
    }
};

// get user by ID
const getuserbyid = (id, callback) => {
    const sql = 'SELECT id, name, email, mobile, role, created_at from users where id = ?';
    db.query(sql, [id], callback);
};

//update user
const updateuser = (id, userData, callback) => {
    const { name, email, mobile, role } = userData;
    const sql = 'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), mobile = COALESCE(?, mobile), role = COALESCE(?, role) WHERE id = ?';
    db.query(sql, [name || null, email || null, mobile || null, role || null, id], callback);
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
};

export const adminModel = { createuser, getusers, getuserbymobile, getuserbyemail, getuserbyemailormobile, getuserbyid, updateuser, deleteuser, getTotalUsers };
export default adminModel;
