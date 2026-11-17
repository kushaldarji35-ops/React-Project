import db from "../config/db.js";

// Helper to extract first image
const extractFirstImage = (image, images) => {
    if (image && typeof image === "string" && image.trim()) return image;
    if (images) {
        if (Array.isArray(images) && images[0]) return images[0];
        if (typeof images === "string" && images.trim()) {
            try {
                const parsed = JSON.parse(images);
                if (Array.isArray(parsed) && parsed[0]) return parsed[0];
            } catch {
                const split = images.split(",").map((s) => s.trim()).filter(Boolean);
                if (split[0]) return split[0];
            }
        }
    }
    return image || "";
};

// Get all cart items for a user (with merged duplicates and normalized product details)
const getByUserId = (userId, callback) => {
    const sql = `
        SELECT 
            ci.id,
            ci.id AS cartItemId,
            ci.user_id,
            ci.product_id,
            ci.selected_size,
            ci.selected_color,
            ci.quantity,
            ci.created_at,
            ci.updated_at,
            p.id AS product_table_id,
            p.name,
            p.current_price,
            p.original_price,
            p.discount_percent,
            p.image,
            p.images,
            p.sizes,
            p.colors,
            p.status AS product_status,
            c.name AS category_name
        FROM cart_items ci
        LEFT JOIN products p ON ci.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE ci.user_id = ?
        ORDER BY ci.id DESC
    `;

    db.query(sql, [userId], (err, rows) => {
        if (err) return callback(err);

        // Group & merge duplicate items by (product_id + size + color)
        const mergedMap = new Map();
        const duplicateIdsToDelete = [];

        (rows || []).forEach((row) => {
            const itemImage = extractFirstImage(row.image, row.images);
            const rawPrice = Number(row.current_price != null ? row.current_price : 0);
            const safeQty = Math.min(99, Math.max(1, Number(row.quantity) || 1));

            // Size fallback
            let chosenSize = row.selected_size && row.selected_size.trim() ? row.selected_size.trim() : "";
            if (!chosenSize && row.sizes) {
                try {
                    const parsedSizes = JSON.parse(row.sizes);
                    if (Array.isArray(parsedSizes) && parsedSizes[0]) chosenSize = parsedSizes[0];
                } catch {}
            }
            if (!chosenSize) chosenSize = "Standard";

            // Color fallback
            let chosenColor = row.selected_color && row.selected_color.trim() ? row.selected_color.trim() : "";
            if (!chosenColor && row.colors) {
                try {
                    const parsedColors = JSON.parse(row.colors);
                    if (Array.isArray(parsedColors) && parsedColors[0]) chosenColor = parsedColors[0];
                } catch {}
            }
            if (!chosenColor) chosenColor = "Default";

            const key = `${row.product_id}_${chosenSize.toLowerCase()}_${chosenColor.toLowerCase()}`;

            if (mergedMap.has(key)) {
                // Duplicate row exists in database: mark the duplicate row for deletion from DB
                duplicateIdsToDelete.push(row.id);
            } else {
                mergedMap.set(key, {
                    id: row.product_id || row.id,
                    productId: row.product_id,
                    cartItemId: row.id,
                    dbId: row.id,
                    name: row.name || "Product",
                    price: rawPrice,
                    current_price: rawPrice,
                    originalPrice: row.original_price != null ? Number(row.original_price) : null,
                    discountPercent: row.discount_percent != null ? Number(row.discount_percent) : null,
                    image: itemImage,
                    selectedSize: chosenSize,
                    selectedColor: chosenColor,
                    selected_size: chosenSize,
                    selected_color: chosenColor,
                    quantity: safeQty,
                });
            }
        });

        // Clean up duplicate rows in background from DB
        if (duplicateIdsToDelete.length > 0) {
            db.query("DELETE FROM cart_items WHERE id IN (?)", [duplicateIdsToDelete], () => {});
        }

        callback(null, Array.from(mergedMap.values()));
    });
};

// Add item to cart (if already exists for same size and color, increase quantity instead of duplicating)
const addItem = (userId, itemData, callback) => {
    const { product_id, quantity = 1, selected_size = "", selected_color = "" } = itemData;

    const safeQty = Math.min(99, Math.max(1, Number(quantity) || 1));
    const sizeVal = selected_size && selected_size.trim() ? selected_size.trim() : "Standard";
    const colorVal = selected_color && selected_color.trim() ? selected_color.trim() : "Default";

    const checkSql = `
        SELECT id, quantity, selected_size, selected_color
        FROM cart_items 
        WHERE user_id = ? AND product_id = ?
    `;

    db.query(checkSql, [userId, product_id], (err, rows) => {
        if (err) return callback(err);

        // Case-insensitive match on size and color
        const match = (rows || []).find(
            (r) =>
                (r.selected_size || "Standard").toLowerCase() === sizeVal.toLowerCase() &&
                (r.selected_color || "Default").toLowerCase() === colorVal.toLowerCase()
        );

        if (match) {
            // Update quantity of existing item
            const newQuantity = Math.min(99, Math.max(1, (Number(match.quantity) || 0) + safeQty));
            const updateSql = "UPDATE cart_items SET quantity = ?, selected_size = ?, selected_color = ? WHERE id = ? AND user_id = ?";
            db.query(updateSql, [newQuantity, sizeVal, colorVal, match.id, userId], (upErr) => {
                if (upErr) return callback(upErr);
                callback(null, { updated: true, id: match.id, quantity: newQuantity });
            });
        } else {
            // Insert new cart item
            const insertSql = `
                INSERT INTO cart_items (user_id, product_id, selected_size, selected_color, quantity)
                VALUES (?, ?, ?, ?, ?)
            `;
            db.query(
                insertSql,
                [userId, product_id, sizeVal, colorVal, safeQty],
                (inErr, inRes) => {
                    if (inErr) return callback(inErr);
                    callback(null, { updated: false, id: inRes.insertId, quantity: safeQty });
                }
            );
        }
    });
};

// Update cart item quantity
const updateQuantity = (cartItemId, userId, quantity, callback) => {
    const safeQty = Math.min(99, Math.max(1, Number(quantity) || 1));
    const sql = "UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?";
    db.query(sql, [safeQty, cartItemId, userId], callback);
};

// Remove single cart item
const removeItem = (cartItemId, userId, callback) => {
    const sql = "DELETE FROM cart_items WHERE id = ? AND user_id = ?";
    db.query(sql, [cartItemId, userId], callback);
};

// Clear all cart items for a user
const clearCart = (userId, callback) => {
    const sql = "DELETE FROM cart_items WHERE user_id = ?";
    db.query(sql, [userId], callback);
};

// Sync multiple items from local storage to database
const syncItems = (userId, items, callback) => {
    if (!Array.isArray(items) || items.length === 0) {
        return callback(null, { message: "No items to sync" });
    }

    let processed = 0;
    let hasError = null;

    items.forEach((item) => {
        const product_id = item.product_id || item.productId || item.id;
        const quantity = Math.min(99, Math.max(1, Number(item.quantity) || 1));
        const selected_size = item.selected_size || item.selectedSize || item.size || "Standard";
        const selected_color = item.selected_color || item.selectedColor || item.color || "Default";

        addItem(userId, { product_id, quantity, selected_size, selected_color }, (err) => {
            if (err && !hasError) hasError = err;
            processed++;
            if (processed === items.length) {
                callback(hasError, { synced: processed });
            }
        });
    });
};

const cartModel = { getByUserId, addItem, updateQuantity, removeItem, clearCart, syncItems };
export default cartModel;
