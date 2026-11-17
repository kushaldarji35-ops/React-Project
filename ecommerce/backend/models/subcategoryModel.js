import db from "../config/db.js";

db.query(
    `CREATE TABLE IF NOT EXISTS subcategories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(120) NOT NULL UNIQUE,
        category_id INT DEFAULT NULL,
        status ENUM('active','inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    (err) => {
        if (err) console.error("Failed to initialize subcategories table:", err);
        else {
            // Add columns if they don't exist (safe for existing tables)
            db.query(
                `ALTER TABLE subcategories ADD COLUMN status ENUM('active','inactive') DEFAULT 'active'`,
                () => {}
            );
            db.query(
                `ALTER TABLE subcategories ADD COLUMN category_id INT DEFAULT NULL`,
                () => {}
            );
        }
    },
);

const getAll = (callback) => {
    db.query(
        `SELECT s.id, s.name, s.slug, s.category_id, s.status, s.created_at,
                c.name AS category_name
         FROM subcategories s
         LEFT JOIN categories c ON s.category_id = c.id
         ORDER BY s.name ASC`,
        callback
    );
};

const create = ({ name, slug, category_id, status }, callback) => {
    db.query(
        "INSERT INTO subcategories (name, slug, category_id, status) VALUES (?, ?, ?, ?)",
        [name, slug, category_id || null, status || "active"],
        callback,
    );
};

const update = (id, { name, slug, category_id, status }, callback) => {
    const fields = [];
    const values = [];

    if (name !== undefined) { fields.push("name = ?"); values.push(name); }
    if (slug !== undefined) { fields.push("slug = ?"); values.push(slug); }
    if (category_id !== undefined) { fields.push("category_id = ?"); values.push(category_id || null); }
    if (status !== undefined) { fields.push("status = ?"); values.push(status); }

    if (fields.length === 0) {
        return callback(new Error("No fields to update"));
    }

    values.push(id);
    db.query(
        `UPDATE subcategories SET ${fields.join(", ")} WHERE id = ?`,
        values,
        callback
    );
};

const remove = (id, callback) => {
    db.query("DELETE FROM subcategories WHERE id = ?", [id], callback);
};

const subcategoryModel = { getAll, create, update, remove };
export default subcategoryModel;
