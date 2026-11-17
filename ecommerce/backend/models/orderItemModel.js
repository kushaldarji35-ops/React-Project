import db from "../config/db.js";

// Get all items belonging to an order
const getByOrderId = (orderId, callback) => {
    const sql = `
        SELECT 
            oi.*,
            p.name AS product_name,
            p.image AS product_image,
            p.current_price AS product_price,
            c.name AS category_name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE oi.order_id = ?
        ORDER BY oi.id ASC
    `;
    db.query(sql, [orderId], callback);
};

// Create bulk items for an order
const createBulk = (orderId, items, callback) => {
    if (!items || items.length === 0) {
        return callback(null, { affectedRows: 0 });
    }

    const values = items.map((item) => {
        const rawId = item.product_id || item.productId || item.id;
        const productId = Number(rawId) > 0 ? Number(rawId) : null;
        const quantity = Number(item.quantity) || 1;
        const size = item.size || item.selected_size || item.selectedSize || "Standard";
        const price = Number(item.price || item.current_price || 0);
        const totalPrice = Number(item.total_price || (price * quantity));

        return [orderId, productId, quantity, size, price, totalPrice];
    });

    const sql = `
        INSERT INTO order_items (order_id, product_id, quantity, size, price, total_price)
        VALUES ?
    `;
    db.query(sql, [values], callback);
};

// Add single item to an order
const create = (orderId, itemData, callback) => {
    const { product_id, quantity = 1, size = null, price = 0, total_price = 0 } = itemData;
    const itemTotal = total_price || (price * quantity);
    const sql = `
        INSERT INTO order_items (order_id, product_id, quantity, size, price, total_price)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [orderId, product_id, quantity, size, price, itemTotal], callback);
};

// Remove single order item
const remove = (id, callback) => {
    const sql = "DELETE FROM order_items WHERE id = ?";
    db.query(sql, [id], callback);
};

const orderItemModel = { getByOrderId, createBulk, create, remove };
export default orderItemModel;
