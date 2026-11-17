import db from "../config/db.js";

// Get all products (with optional filtering by category, search, status)
const getAll = (filters = {}, callback) => {
    let sql = `
        SELECT p.*, c.name AS category_name,
               (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.status = 'approved') AS review_count,
               COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id AND r.status = 'approved'), p.rating, 0.0) AS rating
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
    `;
    const params = [];

    if (filters.category_id) {
        sql += " AND p.category_id = ?";
        params.push(filters.category_id);
    }

    if (filters.category) {
        sql += " AND LOWER(c.name) = LOWER(?)";
        params.push(filters.category);
    }

    if (filters.status) {
        sql += " AND p.status = ?";
        params.push(filters.status);
    }

    if (filters.search) {
        sql += " AND (p.name LIKE ? OR p.description LIKE ?)";
        params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    sql += " ORDER BY p.id ASC";

    db.query(sql, params, callback);
};

// Get product by ID
const getById = (id, callback) => {
    const sql = `
        SELECT p.*, c.name AS category_name,
               (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.status = 'approved') AS review_count,
               COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id AND r.status = 'approved'), p.rating, 0.0) AS rating
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
    `;
    db.query(sql, [id], callback);
};

// Auto-migrate: ensure sizes, colors, and images columns exist in products table
db.query("ALTER TABLE products ADD COLUMN sizes TEXT NULL", () => {});
db.query("ALTER TABLE products ADD COLUMN colors TEXT NULL", () => {});
db.query("ALTER TABLE products ADD COLUMN images LONGTEXT NULL", () => {});
db.query("ALTER TABLE products ADD COLUMN subcategory VARCHAR(100) NULL", () => {});
db.query("ALTER TABLE products MODIFY COLUMN image LONGTEXT NULL", () => {});
db.query("ALTER TABLE products MODIFY COLUMN images LONGTEXT NULL", () => {});

// Create a new product
const create = (data, callback) => {
    const {
        category_id,
        subcategory,
        name,
        description,
        original_price,
        discount_percent,
        current_price,
        image,
        images,
        status,
        rating,
        sizes,
        colors
    } = data;

    const formattedImages = images ? (typeof images === "string" ? images : JSON.stringify(images)) : null;

    const sql = `
        INSERT INTO products 
        (category_id, subcategory, name, description, original_price, discount_percent, current_price, image, images, status, rating, sizes, colors)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
        sql,
        [
            category_id,
            subcategory || null,
            name,
            description || null,
            original_price || null,
            discount_percent || null,
            current_price || 0.00,
            image || null,
            formattedImages,
            status || "active",
            rating || 0.0,
            sizes ? (typeof sizes === "string" ? sizes : JSON.stringify(sizes)) : null,
            colors ? (typeof colors === "string" ? colors : JSON.stringify(colors)) : null
        ],
        (err, result) => {
            if (err && err.message && (err.message.includes("Unknown column 'sizes'") || err.message.includes("Unknown column 'colors'") || err.message.includes("Unknown column 'images'"))) {
                // Fallback if column wasn't added yet
                const fallbackSql = `
                    INSERT INTO products 
                    (category_id, name, description, original_price, discount_percent, current_price, image, status, rating)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                db.query(fallbackSql, [category_id, name, description || null, original_price || null, discount_percent || null, current_price || 0.00, image || null, status || "active", rating || 0.0], callback);
                return;
            }
            callback(err, result);
        }
    );
};

// Update existing product
const update = (id, data, callback) => {
    const {
        category_id,
        name,
        description,
        original_price,
        discount_percent,
        current_price,
        image,
        images,
        status,
        rating,
        sizes,
        colors,
        subcategory
    } = data;

    const formattedImages = images !== undefined ? (typeof images === "string" ? images : JSON.stringify(images)) : undefined;

    const sql = `
        UPDATE products SET
            category_id = COALESCE(?, category_id),
            subcategory = COALESCE(?, subcategory),
            name = COALESCE(?, name),
            description = COALESCE(?, description),
            original_price = COALESCE(?, original_price),
            discount_percent = COALESCE(?, discount_percent),
            current_price = COALESCE(?, current_price),
            image = COALESCE(?, image),
            images = COALESCE(?, images),
            status = COALESCE(?, status),
            rating = COALESCE(?, rating),
            sizes = COALESCE(?, sizes),
            colors = COALESCE(?, colors)
        WHERE id = ?
    `;
    db.query(
        sql,
        [
            category_id ?? null,
            subcategory ?? null,
            name ?? null,
            description ?? null,
            original_price ?? null,
            discount_percent ?? null,
            current_price ?? null,
            image ?? null,
            formattedImages ?? null,
            status ?? null,
            rating ?? null,
            sizes !== undefined ? (typeof sizes === "string" ? sizes : JSON.stringify(sizes)) : null,
            colors !== undefined ? (typeof colors === "string" ? colors : JSON.stringify(colors)) : null,
            id
        ],
        (err, result) => {
            if (err && err.message && (err.message.includes("Unknown column 'sizes'") || err.message.includes("Unknown column 'colors'") || err.message.includes("Unknown column 'images'"))) {
                const fallbackSql = `
                    UPDATE products SET
                        category_id = COALESCE(?, category_id),
                        subcategory = COALESCE(?, subcategory),
                        name = COALESCE(?, name),
                        description = COALESCE(?, description),
                        original_price = COALESCE(?, original_price),
                        discount_percent = COALESCE(?, discount_percent),
                        current_price = COALESCE(?, current_price),
                        image = COALESCE(?, image),
                        status = COALESCE(?, status),
                        rating = COALESCE(?, rating)
                    WHERE id = ?
                `;
                db.query(fallbackSql, [category_id ?? null, subcategory ?? null, name ?? null, description ?? null, original_price ?? null, discount_percent ?? null, current_price ?? null, image ?? null, status ?? null, rating ?? null, id], callback);
                return;
            }
            callback(err, result);
        }
    );
};

// Delete product
const remove = (id, callback) => {
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [id], callback);
};

// Count total products
const count = (callback) => {
    const sql = "SELECT COUNT(*) as totalProducts FROM products";
    db.query(sql, callback);
};

const productModel = { getAll, getById, create, update, remove, count };
export default productModel;
