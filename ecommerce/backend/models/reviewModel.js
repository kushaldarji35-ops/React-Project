import db from "../config/db.js";

// Ensure reviews table exists on startup
const initReviewTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            product_id INT NOT NULL,
            order_id INT NULL,
            rating INT NOT NULL,
            comment TEXT NULL,
            status VARCHAR(50) DEFAULT 'approved',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_review_prod (product_id),
            INDEX idx_review_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    db.query(sql, (err) => {
        if (err) {
            console.error("[reviewModel] Error initializing reviews table:", err.message);
        }
    });
};

initReviewTable();

// Get reviews for a specific product
const getByProductId = (productId, callback) => {
    const sql = `
        SELECT 
            r.*,
            u.name AS user_name
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ? AND r.status = 'approved'
        ORDER BY r.id DESC
    `;
    db.query(sql, [productId], callback);
};

// Get all reviews (for admin, with user and product details)
const getAll = (filters = {}, callback) => {
    let sql = `
        SELECT 
            r.*,
            u.name AS user_name,
            u.email AS user_email,
            p.name AS product_name,
            p.image AS product_image
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN products p ON r.product_id = p.id
        WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
        sql += " AND r.status = ?";
        params.push(filters.status);
    }

    if (filters.product_id) {
        sql += " AND r.product_id = ?";
        params.push(filters.product_id);
    }

    sql += " ORDER BY r.id DESC";

    db.query(sql, params, callback);
};

// Get review by ID
const getById = (id, callback) => {
    const sql = `
        SELECT r.*, u.name AS user_name, p.name AS product_name
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN products p ON r.product_id = p.id
        WHERE r.id = ?
    `;
    db.query(sql, [id], callback);
};

// Create a new review
const create = (userId, data, callback) => {
    const { product_id, order_id = null, rating, comment, status = "approved" } = data;

    const sql = `
        INSERT INTO reviews (user_id, product_id, order_id, rating, comment, status)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [userId, product_id, order_id || null, Number(rating), comment || null, status],
        (err, result) => {
            if (err) return callback(err);

            // Recalculate and update product rating
            updateProductRating(product_id);

            callback(null, { reviewId: result.insertId, message: "Review submitted successfully" });
        }
    );
};

// Helper to update product average rating
const updateProductRating = (productId) => {
    const avgSql = `
        SELECT ROUND(AVG(rating), 1) as avgRating 
        FROM reviews 
        WHERE product_id = ? AND status = 'approved'
    `;
    db.query(avgSql, [productId], (err, rows) => {
        if (!err && rows && rows.length > 0 && rows[0].avgRating !== null) {
            const avg = rows[0].avgRating;
            db.query("UPDATE products SET rating = ? WHERE id = ?", [avg, productId]);
        }
    });
};

// Update review status (admin approval/rejection)
const updateStatus = (id, status, callback) => {
    const sql = "UPDATE reviews SET status = ? WHERE id = ?";
    db.query(sql, [status, id], (err, result) => {
        if (err) return callback(err);

        // Update product rating if status changed
        db.query("SELECT product_id FROM reviews WHERE id = ?", [id], (findErr, rows) => {
            if (!findErr && rows.length > 0) {
                updateProductRating(rows[0].product_id);
            }
        });

        callback(null, result);
    });
};

// Delete review
const remove = (id, userId = null, isAdmin = false, callback) => {
    let sql = "DELETE FROM reviews WHERE id = ?";
    const params = [id];

    if (!isAdmin && userId) {
        sql += " AND user_id = ?";
        params.push(userId);
    }

    db.query("SELECT product_id FROM reviews WHERE id = ?", [id], (findErr, rows) => {
        const productId = (!findErr && rows.length > 0) ? rows[0].product_id : null;

        db.query(sql, params, (delErr, result) => {
            if (delErr) return callback(delErr);

            if (productId) {
                updateProductRating(productId);
            }

            callback(null, result);
        });
    });
};

const reviewModel = { getByProductId, getAll, getById, create, updateStatus, remove };
export default reviewModel;
