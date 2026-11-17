import db from "../config/db.js";
import orderItemModel from "./orderItemModel.js";

// Helper to sanitize payment method to enum ('card','upi','netbanking','cod')
const normalizePaymentMethod = (method) => {
    if (!method) return "cod";
    const lower = String(method).toLowerCase();
    if (lower.includes("card")) return "card";
    if (lower.includes("upi")) return "upi";
    if (lower.includes("net") || lower.includes("bank")) return "netbanking";
    if (lower.includes("cod") || lower.includes("cash")) return "cod";
    return "cod";
};

// Create a new order with items
const create = (userId, orderData, items, callback) => {
    const {
        address_id,
        subtotal = 0,
        discount = 0,
        delivery_fee = 0,
        total = 0,
        payment_method = "cod",
        payment_status = "pending",
        order_status = "confirmed",
        tracking_number = null,
        order_number
    } = orderData;

    const generatedOrderNumber = order_number || `ORD-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
    const sanitizedPaymentMethod = normalizePaymentMethod(payment_method);

    const orderSql = `
        INSERT INTO orders 
        (order_number, user_id, address_id, subtotal, discount, delivery_fee, total, payment_method, payment_status, order_status, tracking_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        orderSql,
        [
            generatedOrderNumber,
            userId,
            address_id,
            subtotal,
            discount,
            delivery_fee,
            total,
            sanitizedPaymentMethod,
            payment_status,
            order_status,
            tracking_number
        ],
        (err, result) => {
            if (err) return callback(err);

            const orderId = result.insertId;

            // If items provided, insert into order_items
            if (items && Array.isArray(items) && items.length > 0) {
                orderItemModel.createBulk(orderId, items, (itemErr) => {
                    if (itemErr) return callback(itemErr);

                    // Clear user cart after placing order
                    db.query("DELETE FROM cart_items WHERE user_id = ?", [userId], () => {
                        callback(null, {
                            orderId,
                            orderNumber: generatedOrderNumber,
                            message: "Order placed successfully"
                        });
                    });
                });
            } else {
                callback(null, {
                    orderId,
                    orderNumber: generatedOrderNumber,
                    message: "Order placed successfully"
                });
            }
        }
    );
};

// Auto-heal / backfill any orders missing address_id on startup
const autoHealOrders = () => {
    db.query(
        `UPDATE orders o 
         SET address_id = (
             SELECT a.id FROM addresses a 
             WHERE a.user_id = o.user_id 
             ORDER BY a.id DESC LIMIT 1
         ) 
         WHERE o.address_id IS NULL`,
        (err, res) => {
            if (!err && res && res.affectedRows > 0) {
                console.log(`[orderModel] Linked ${res.affectedRows} orders with missing address_id to customer address`);
            }
        }
    );

    // Sync mobile to users table if blank
    db.query(
        `UPDATE users u 
         JOIN addresses a ON a.user_id = u.id 
         SET u.mobile = a.mobile 
         WHERE (u.mobile IS NULL OR u.mobile = '' OR u.mobile = '—') 
           AND a.mobile IS NOT NULL AND a.mobile != ''`,
        () => {}
    );

    // Sync name to users table if 'Customer' or blank
    db.query(
        `UPDATE users u 
         JOIN addresses a ON a.user_id = u.id 
         SET u.name = a.full_name 
         WHERE (u.name IS NULL OR u.name = '' OR u.name = 'Customer') 
           AND a.full_name IS NOT NULL AND a.full_name != ''`,
        () => {}
    );
};

autoHealOrders();

// Get all orders (for Admin) with resilient multi-tier fallback
const getAll = (filters = {}, callback) => {
    const buildSql = (includeAddress = true, includeUser = true) => {
        let selectParts = ["o.*"];
        let joinParts = [];

        if (includeAddress && includeUser) {
            selectParts.push(
                "COALESCE(NULLIF(u.name, ''), NULLIF(a.full_name, ''), 'Customer') AS customer_name",
                "COALESCE(NULLIF(u.email, ''), NULLIF(a.email, ''), '—') AS customer_email",
                "COALESCE(NULLIF(u.mobile, ''), NULLIF(a.mobile, ''), '—') AS customer_mobile",
                "a.line1",
                "a.line2",
                "a.city",
                "a.state",
                "a.pincode",
                "a.country",
                "a.address_type",
                "a.full_name AS address_full_name",
                "a.mobile AS address_mobile",
                "a.email AS address_email"
            );
            joinParts.push("LEFT JOIN users u ON o.user_id = u.id");
            joinParts.push(
                "LEFT JOIN addresses a ON (o.address_id = a.id OR (o.address_id IS NULL AND a.id = (SELECT a2.id FROM addresses a2 WHERE a2.user_id = o.user_id ORDER BY a2.id DESC LIMIT 1)))"
            );
        } else if (includeUser) {
            selectParts.push(
                "COALESCE(NULLIF(u.name, ''), 'Customer') AS customer_name",
                "COALESCE(NULLIF(u.email, ''), '—') AS customer_email",
                "COALESCE(NULLIF(u.mobile, ''), '—') AS customer_mobile"
            );
            joinParts.push("LEFT JOIN users u ON o.user_id = u.id");
        } else {
            selectParts.push(
                "'Customer' AS customer_name",
                "'—' AS customer_email",
                "'—' AS customer_mobile"
            );
        }

        let query = `
            SELECT ${selectParts.join(", ")}
            FROM orders o
            ${joinParts.join("\n")}
            WHERE 1=1
        `;

        const queryParams = [];
        if (filters.status && filters.status !== "all") {
            query += " AND o.order_status = ?";
            queryParams.push(filters.status.toLowerCase());
        }

        if (filters.search) {
            if (includeUser) {
                query += " AND (o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR u.mobile LIKE ?)";
                queryParams.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
            } else {
                query += " AND o.order_number LIKE ?";
                queryParams.push(`%${filters.search}%`);
            }
        }

        query += " ORDER BY o.id DESC";
        return { query, queryParams };
    };

    const runItemsEnrichment = (orders) => {
        if (!orders || orders.length === 0) return callback(null, []);

        const orderIds = orders.map((o) => o.id);
        const itemsSql = `
            SELECT 
                oi.*,
                p.name AS product_name,
                p.image AS product_image,
                p.images AS product_images,
                COALESCE(p.current_price, oi.price, 0) AS product_price
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id IN (?)
            ORDER BY oi.id ASC
        `;

        db.query(itemsSql, [orderIds], (itemErr, items) => {
            if (itemErr) {
                console.warn("[orderModel.getAll] Item enrichment warning (orders will be returned without items):", itemErr.message);
                const fallback = orders.map((o) => ({
                    ...o,
                    items: [],
                    total_items: 0
                }));
                return callback(null, fallback);
            }

            const itemsByOrder = {};
            (items || []).forEach((item) => {
                if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
                itemsByOrder[item.order_id].push(item);
            });

            const enrichedOrders = orders.map((o) => {
                const orderItems = itemsByOrder[o.id] || [];
                const totalItems = orderItems.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
                return {
                    ...o,
                    items: orderItems,
                    total_items: totalItems || orderItems.length
                };
            });

            callback(null, enrichedOrders);
        });
    };

    // Level 1: Try full query with addresses and users joins
    const full = buildSql(true, true);
    db.query(full.query, full.queryParams, (err1, orders1) => {
        if (!err1) {
            return runItemsEnrichment(orders1);
        }

        console.warn("[orderModel.getAll] Full query with addresses failed:", err1.message, "— attempting query without addresses table...");

        // Level 2: Try query with users join only
        const userOnly = buildSql(false, true);
        db.query(userOnly.query, userOnly.queryParams, (err2, orders2) => {
            if (!err2) {
                return runItemsEnrichment(orders2);
            }

            console.warn("[orderModel.getAll] User-join query failed:", err2.message, "— attempting direct orders query...");

            // Level 3: Direct orders query with no foreign joins
            const direct = buildSql(false, false);
            db.query(direct.query, direct.queryParams, (err3, orders3) => {
                if (!err3) {
                    return runItemsEnrichment(orders3);
                }

                console.error("[orderModel.getAll] Direct orders query failed:", err3.message);
                return callback(err3);
            });
        });
    });
};

// Get orders for a specific customer
const getByUserId = (userId, callback) => {
    const sql = `
        SELECT 
            o.*,
            COALESCE(NULLIF(u.name, ''), NULLIF(a.full_name, ''), 'Customer') AS customer_name,
            COALESCE(NULLIF(u.email, ''), NULLIF(a.email, ''), '—') AS customer_email,
            COALESCE(NULLIF(u.mobile, ''), NULLIF(a.mobile, ''), '—') AS customer_mobile,
            a.line1, a.line2, a.city, a.state, a.pincode, a.country, a.address_type
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN addresses a ON (o.address_id = a.id OR (o.address_id IS NULL AND a.id = (SELECT a2.id FROM addresses a2 WHERE a2.user_id = o.user_id ORDER BY a2.id DESC LIMIT 1)))
        WHERE o.user_id = ?
        ORDER BY o.id DESC
    `;

    db.query(sql, [userId], (err, orders) => {
        if (err) return callback(err);
        if (orders.length === 0) return callback(null, []);

        // Load items for each order
        const orderIds = orders.map((o) => o.id);
        const itemsSql = `
            SELECT 
                oi.*,
                p.name AS product_name,
                p.image AS product_image
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id IN (?)
            ORDER BY oi.id ASC
        `;

        db.query(itemsSql, [orderIds], (itemErr, items) => {
            if (itemErr) return callback(itemErr);

            const itemsByOrder = {};
            items.forEach((item) => {
                if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
                itemsByOrder[item.order_id].push(item);
            });

            const enrichedOrders = orders.map((o) => ({
                ...o,
                items: itemsByOrder[o.id] || []
            }));

            callback(null, enrichedOrders);
        });
    });
};

// Get single order with complete details and items
const getById = (id, userId = null, callback) => {
    let sql = `
        SELECT 
            o.*,
            COALESCE(NULLIF(u.name, ''), NULLIF(a.full_name, ''), 'Customer') AS customer_name,
            COALESCE(NULLIF(u.email, ''), NULLIF(a.email, ''), '—') AS customer_email,
            COALESCE(NULLIF(u.mobile, ''), NULLIF(a.mobile, ''), '—') AS customer_mobile,
            a.line1, a.line2, a.city, a.state, a.pincode, a.country, a.address_type,
            a.full_name AS address_full_name, a.mobile AS address_mobile
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN addresses a ON (o.address_id = a.id OR (o.address_id IS NULL AND a.id = (SELECT a2.id FROM addresses a2 WHERE a2.user_id = o.user_id ORDER BY a2.id DESC LIMIT 1)))
        WHERE (o.id = ? OR o.order_number = ?)
    `;
    const params = [id, id];

    if (userId) {
        sql += " AND o.user_id = ?";
        params.push(userId);
    }

    db.query(sql, params, (err, orders) => {
        if (err) return callback(err);
        if (orders.length === 0) return callback(null, null);

        const order = orders[0];
        orderItemModel.getByOrderId(order.id, (itemErr, items) => {
            if (itemErr) return callback(itemErr);
            order.items = items || [];
            callback(null, order);
        });
    });
};

// Update order status or tracking details
const updateStatus = (id, data, callback) => {
    const { order_status, payment_status, tracking_number } = data;
    const sql = `
        UPDATE orders SET
            order_status = COALESCE(?, order_status),
            payment_status = COALESCE(?, payment_status),
            tracking_number = COALESCE(?, tracking_number)
        WHERE (id = ? OR order_number = ?)
    `;
    db.query(sql, [order_status ?? null, payment_status ?? null, tracking_number ?? null, id, id], callback);
};

// Delete order
const remove = (id, callback) => {
    db.query("DELETE FROM order_items WHERE order_id = ?", [id], (itemErr) => {
        if (itemErr) console.error("Error deleting order items:", itemErr);
        const sql = "DELETE FROM orders WHERE id = ? OR order_number = ?";
        db.query(sql, [id, id], callback);
    });
};

// Total orders count
const getTotalOrders = (callback) => {
    const sql = "SELECT COUNT(*) as totalOrders FROM orders";
    db.query(sql, callback);
};

// Total revenue sum
const getTotalRevenue = (callback) => {
    const sql = "SELECT COALESCE(SUM(total), 0) as totalRevenue FROM orders WHERE order_status != 'cancelled'";
    db.query(sql, callback);
};

const orderModel = {
    create,
    getAll,
    getByUserId,
    getById,
    updateStatus,
    remove,
    getTotalOrders,
    getTotalRevenue
};

export default orderModel;
