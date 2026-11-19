import db from "../config/db.js";

// Helper to normalize a coupon record from database
const normalizeRow = (r) => {
    if (!r) return null;
    const discount = r.discount_percent ?? r.discountPercent ?? 10;
    const minOrder = r.min_order_amount ?? r.minSpend ?? 0;
    const startDate = Object.prototype.hasOwnProperty.call(r, "start_date_formatted")
        ? r.start_date_formatted
        : r.startDate ?? null;
    const endDate = Object.prototype.hasOwnProperty.call(r, "end_date_formatted")
        ? r.end_date_formatted
        : r.endDate ?? null;
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
        start_date: startDate,
        end_date: endDate,
        validity_invalid:
            startDate === "0000-00-00" || endDate === "0000-00-00",
        status: st,
        isActive: st === "active" ? 1 : 0,
    };
};

// Get all coupons (with optional search and status filters)
const getAll = (filters = {}, callback) => {
    let sql = `SELECT *, DATE_FORMAT(startDate, '%Y-%m-%d') AS start_date_formatted,
        DATE_FORMAT(endDate, '%Y-%m-%d') AS end_date_formatted
        FROM coupons WHERE 1=1`;
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
    const sql = `SELECT *, DATE_FORMAT(startDate, '%Y-%m-%d') AS start_date_formatted,
        DATE_FORMAT(endDate, '%Y-%m-%d') AS end_date_formatted
        FROM coupons WHERE id = ?`;
    db.query(sql, [id], (err, rows) => {
        if (err) return callback(err);
        callback(null, (rows || []).map(normalizeRow));
    });
};

// Get coupon by Code (case insensitive)
const getByCode = (code, callback) => {
    const sql = `SELECT *, DATE_FORMAT(startDate, '%Y-%m-%d') AS start_date_formatted,
        DATE_FORMAT(endDate, '%Y-%m-%d') AS end_date_formatted
        FROM coupons WHERE UPPER(code) = UPPER(?)`;
    db.query(sql, [code], (err, rows) => {
        if (err) return callback(err);
        callback(null, (rows || []).map(normalizeRow));
    });
};

// Create a new coupon
const create = (data, callback) => {
    const {
        code,
        discount_percent,
        discountPercent,
        min_order_amount,
        minSpend,
        max_discount_amount,
        start_date,
        end_date,
        status,
        isActive,
    } = data;

    const discountVal = Number(discount_percent ?? discountPercent ?? 10);
    const minOrderVal = Number(min_order_amount ?? minSpend ?? 0);
    const maxDiscountVal = max_discount_amount ? Number(max_discount_amount) : null;
    const statusVal = status || (isActive === 1 || isActive === true ? "active" : "active");
    const isActVal = statusVal.toLowerCase() === "active" ? 1 : 0;

    const sql = `
        INSERT INTO coupons (
            code,
            discountPercent,
            discount_percent,
            minSpend,
            startDate,
            endDate,
            min_order_amount,
            max_discount_amount,
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
            start_date || null,
            end_date || null,
            minOrderVal,
            maxDiscountVal,
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
        start_date,
        end_date,
        max_discount_amount,
        status,
        isActive,
    } = data;

    const discountVal = discount_percent != null || discountPercent != null ? Number(discount_percent ?? discountPercent) : null;
    const minOrderVal = min_order_amount != null || minSpend != null ? Number(min_order_amount ?? minSpend) : null;
    const maxDiscountVal = max_discount_amount != null && max_discount_amount !== "" ? Number(max_discount_amount) : null;
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
            startDate = COALESCE(?, startDate),
            endDate = COALESCE(?, endDate),
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
            start_date ?? null,
            end_date ?? null,
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
            SUM(CASE
                WHEN (status = 'active' OR isActive = 1)
                    AND (startDate IS NULL OR startDate <= CURDATE())
                    AND (endDate IS NULL OR endDate >= CURDATE())
                THEN 1 ELSE 0
            END) as activeCoupons,
            SUM(CASE
                WHEN (status != 'active' AND isActive != 1)
                    OR (endDate IS NOT NULL AND endDate < CURDATE())
                    OR (startDate IS NOT NULL AND startDate > CURDATE())
                THEN 1 ELSE 0
            END) as inactiveOrExpired
        FROM coupons
    `;
    db.query(sql, callback);
};

const couponModel = { getAll, getById, getByCode, create, update, remove, count };
export default couponModel;
