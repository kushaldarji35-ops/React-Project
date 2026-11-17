import orderItemModel from "../models/orderItemModel.js";

// GET /api/order-items/:orderId - get all items for an order
const getOrderItems = (req, res) => {
    const { orderId } = req.params;
    orderItemModel.getByOrderId(orderId, (err, items) => {
        if (err) return res.status(500).json({ message: "Database error fetching order items", error: err.message });
        res.json(items);
    });
};

// POST /api/order-items - add an item to an existing order
const addOrderItem = (req, res) => {
    const { order_id, orderId, product_id, productId, quantity, size, price, total_price, totalPrice } = req.body;

    const actualOrderId = order_id || orderId;
    const actualProductId = product_id || productId;

    if (!actualOrderId || !actualProductId) {
        return res.status(400).json({ message: "order_id and product_id are required" });
    }

    const itemData = {
        product_id: actualProductId,
        quantity: quantity || 1,
        size: size || null,
        price: price || 0,
        total_price: total_price || totalPrice || (price * (quantity || 1))
    };

    orderItemModel.create(actualOrderId, itemData, (err, result) => {
        if (err) return res.status(500).json({ message: "Error adding order item", error: err.message });
        res.status(201).json({
            message: "Order item added successfully",
            itemId: result.insertId
        });
    });
};

// DELETE /api/order-items/:id - delete an order item
const deleteOrderItem = (req, res) => {
    const { id } = req.params;
    orderItemModel.remove(id, (err, result) => {
        if (err) return res.status(500).json({ message: "Error deleting order item", error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Order item not found" });
        res.json({ message: "Order item deleted successfully" });
    });
};

const orderItemController = { getOrderItems, addOrderItem, deleteOrderItem };
export default orderItemController;
