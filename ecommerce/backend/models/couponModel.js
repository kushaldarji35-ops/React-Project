import db from "../config/db.js";

// Helper to normalize a coupon record from database
const normalizeRow = (r) => {
    if (!r) return null;
    const discount = r.discount_percent ?? r.discountPercent ?? 10;
    const minOrder = r.min_order_amount ?? r.minSpend ?? 0;
    const expiry = r.expiry_date ?? r.expiryDate ?? null;
    let st = r.status;
    if (!st) {
        st = r.isActive === 1 || r.isActive === true ? "active" : "inactive";
    }
    return {
        ...r,
        discount_percent: Number(discount),
        discountPercent: Number(discount),
        min_order_amount: Number(minOrder),
        minSpend: Number(minOrder),
        expiry_date: expiry,
        expiryDate: expiry,
        status: st,
        isActive: st === "active" ? 1 : 0,
    };
};

// Get all coupons (with optional search and status filters)
const getAll = (filters = {}, callback) => {
    let sql = "SELECT * FROM coupons WHERE 1=1";
    const params = [];

    if (filters.status && filters.status !== "all") {
        if (filters.status === "active") {
            sql += " AND (status = 'active' OR isActive = 1)";
        } else {
            sql += " AND (status != 'active' AND isActive != 1)";
        }
    }

    if (filters.search) {
        sql += " AND code LIKE ?";
        params.push(`%${filters.search}%`);
    }

    sql += " ORDER BY id DESC";
    db.query(sql, params, (err, rows) => {
        if (err) return callback(err);
        const list = (rows || []).map(normalizeRow);
        callback(null, list);
    });
};

// Get coupon by ID
const getById = (id, callback) => {
    const sql = "SELECT * FROM coupons WHERE id = ?";
    db.query(sql, [id], (err, rows) => {
        if (err) return callback(err);
        callback(null, (rows || []).map(normalizeRow));
    });
};

// Get coupon by Code (case insensitive)
const getByCode = (code, callback) => {
    const sql = "SELECT * FROM coupons WHERE UPPER(code) = UPPER(?)";
    db.query(sql, [code], (err, rows) => {
        if (err) return callback(err);
        callback(null, (rows || []).map(normalizeRow));
    });
};

// Create a new coupon (supports both camelCase and snake_case schema)
const create = (data, callback) => {
    const {
        code,
        discount_percent,
        discountPercent,
        min_order_amount,
        minSpend,
        max_discount_amount,
        expiry_date,
        expiryDate,
        status,
        isActive,
    } = data;

    const discountVal = Number(discount_percent ?? discountPercent ?? 10);
    const minOrderVal = Number(min_order_amount ?? minSpend ?? 0);
    const maxDiscountVal = max_discount_amount ? Number(max_discount_amount) : null;
    const expiryVal = expiry_date || expiryDate || null;
    const statusVal = status || (isActive === 1 || isActive === true ? "active" : "active");
    const isActVal = statusVal.toLowerCase() === "active" ? 1 : 0;

    const sql = `
        INSERT INTO coupons (
            code,
            discountPercent,
            discount_percent,
            minSpend,
            min_order_amount,
            max_discount_amount,
            expiryDate,
            expiry_date,
            isActive,
            status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            code.trim().toUpperCase(),
            discountVal,
            discountVal,
            minOrderVal,
            minOrderVal,
            maxDiscountVal,
            expiryVal,
            expiryVal,
            isActVal,
            statusVal,
        ],
        callback
    );
};

// Update an existing coupon
const update = (id, data, callback) => {
    const {
        code,
        discount_percent,
        discountPercent,
        min_order_amount,
        minSpend,
        max_discount_amount,
        expiry_date,
        expiryDate,
        status,
        isActive,
    } = data;

    const discountVal = discount_percent != null || discountPercent != null ? Number(discount_percent ?? discountPercent) : null;
    const minOrderVal = min_order_amount != null || minSpend != null ? Number(min_order_amount ?? minSpend) : null;
    const maxDiscountVal = max_discount_amount != null && max_discount_amount !== "" ? Number(max_discount_amount) : null;
    const expiryVal = expiry_date !== undefined ? expiry_date : expiryDate !== undefined ? expiryDate : null;
    const statusVal = status ?? (isActive != null ? (isActive === 1 ? "active" : "inactive") : null);
    const isActVal = statusVal ? (statusVal.toLowerCase() === "active" ? 1 : 0) : null;

    const sql = `
        UPDATE coupons SET
            code = COALESCE(?, code),
            discountPercent = COALESCE(?, discountPercent),
            discount_percent = COALESCE(?, discount_percent),
            minSpend = COALESCE(?, minSpend),
            min_order_amount = COALESCE(?, min_order_amount),
            max_discount_amount = ?,
            expiryDate = ?,
            expiry_date = ?,
            isActive = COALESCE(?, isActive),
            status = COALESCE(?, status)
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            code ? code.trim().toUpperCase() : null,
            discountVal,
            discountVal,
            minOrderVal,
            minOrderVal,
            maxDiscountVal,
            expiryVal,
            expiryVal,
            isActVal,
            statusVal,
            id,
        ],
        callback
    );
};

// Delete coupon
const remove = (id, callback) => {
    const sql = "DELETE FROM coupons WHERE id = ?";
    db.query(sql, [id], callback);
};

// Total count and stats
const count = (callback) => {
    const sql = `
        SELECT 
            COUNT(*) as totalCoupons,
            SUM(CASE WHEN status = 'active' OR isActive = 1 THEN 1 ELSE 0 END) as activeCoupons,
            SUM(CASE WHEN (status != 'active' AND isActive != 1) OR (expiry_date IS NOT NULL AND expiry_date < CURDATE()) OR (expiryDate IS NOT NULL AND expiryDate < CURDATE()) THEN 1 ELSE 0 END) as inactiveOrExpired
        FROM coupons
    `;
    db.query(sql, callback);
};

const couponModel = { getAll, getById, getByCode, create, update, remove, count };
export default couponModel;
