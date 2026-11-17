import db from "../config/db.js";

db.query("ALTER TABLE categories ADD COLUMN slug VARCHAR(255) NULL", () => {
    db.query(
        "UPDATE categories SET slug = LOWER(REPLACE(TRIM(name), ' ', '-')) WHERE slug IS NULL OR slug = ''",
        () => {},
    );
});

// Get all categories (optionally filtered by status or search)
const getAll = (filters = {}, callback) => {
    let sql = `
        SELECT c.*, COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
        sql += " AND c.status = ?";
        params.push(filters.status);
    }

    if (filters.search) {
        sql += " AND c.name LIKE ?";
        params.push(`%${filters.search}%`);
    }

    sql += " GROUP BY c.id ORDER BY c.id ASC";

    db.query(sql, params, callback);
};

// Get single category by ID
const getById = (id, callback) => {
    const sql = `
        SELECT c.*, COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        WHERE c.id = ?
        GROUP BY c.id
    `;
    db.query(sql, [id], callback);
};

// Create a new category
const create = (data, callback) => {
    const { name, description, image, status } = data;
    const { slug } = data;
    const sql = "INSERT INTO categories (name, slug, description, image, status) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [name, slug, description || null, image || null, status || "active"], callback);
};

// Update an existing category
const update = (id, data, callback) => {
    const { name, slug, description, image, status } = data;
    const sql = `
        UPDATE categories SET
            name = COALESCE(?, name),
            slug = COALESCE(?, slug),
            description = COALESCE(?, description),
            image = COALESCE(?, image),
            status = COALESCE(?, status)
        WHERE id = ?
    `;
    db.query(sql, [name ?? null, slug ?? null, description ?? null, image ?? null, status ?? null, id], callback);
};

// Delete category
const remove = (id, callback) => {
    const sql = "DELETE FROM categories WHERE id = ?";
    db.query(sql, [id], callback);
};

// Total categories count
const count = (callback) => {
    const sql = "SELECT COUNT(*) as totalCategories FROM categories";
    db.query(sql, callback);
};

const categoryModel = { getAll, getById, create, update, remove, count };
export default categoryModel;
