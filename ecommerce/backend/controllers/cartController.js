import cartModel from "../models/cartModel.js";

// GET /api/cart - get all cart items for logged-in user
const getCart = (req, res) => {
    cartModel.getByUserId(req.user.id, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error fetching cart", error: err.message });
        res.json(results || []);
    });
};

// POST /api/cart/add or POST /api/cart - add item to cart
const addToCart = (req, res) => {
    const { product_id, productId, id, quantity = 1, selected_size, selectedSize, size, selected_color, selectedColor, color } = req.body;

    const actualProductId = product_id || productId || id;
    if (!actualProductId) {
        return res.status(400).json({ message: "Product ID is required" });
    }

    const itemData = {
        product_id: actualProductId,
        quantity: Math.min(99, Math.max(1, Number(quantity) || 1)),
        selected_size: selected_size || selectedSize || size || "Standard",
        selected_color: selected_color || selectedColor || color || "Default"
    };

    cartModel.addItem(req.user.id, itemData, (err, result) => {
        if (err) return res.status(500).json({ message: "Error adding item to cart", error: err.message });

        cartModel.getByUserId(req.user.id, (fetchErr, fullCart) => {
            res.status(200).json({
                message: result.updated ? "Cart item quantity updated" : "Item added to cart",
                item: result,
                cart: fullCart || []
            });
        });
    });
};

// PUT /api/cart/:id - update item quantity
const updateQuantity = (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity === null) {
        return res.status(400).json({ message: "Quantity is required" });
    }

    const qty = Math.min(99, Math.max(0, Number(quantity) || 0));
    if (qty <= 0) {
        // If quantity is 0 or less, remove item
        return cartModel.removeItem(id, req.user.id, (err) => {
            if (err) return res.status(500).json({ message: "Error removing cart item", error: err.message });
            cartModel.getByUserId(req.user.id, (fetchErr, fullCart) => {
                res.json({ message: "Item removed from cart", cart: fullCart || [] });
            });
        });
    }

    cartModel.updateQuantity(id, req.user.id, qty, (err, result) => {
        if (err) return res.status(500).json({ message: "Error updating cart quantity", error: err.message });
        cartModel.getByUserId(req.user.id, (fetchErr, fullCart) => {
            res.json({ message: "Cart quantity updated successfully", cart: fullCart || [] });
        });
    });
};

// DELETE /api/cart/:id - remove single item from cart
const removeCartItem = (req, res) => {
    const { id } = req.params;
    cartModel.removeItem(id, req.user.id, (err, result) => {
        if (err) return res.status(500).json({ message: "Error removing item from cart", error: err.message });
        cartModel.getByUserId(req.user.id, (fetchErr, fullCart) => {
            res.json({ message: "Item removed from cart successfully", cart: fullCart || [] });
        });
    });
};

// DELETE /api/cart - clear entire cart
const clearCart = (req, res) => {
    cartModel.clearCart(req.user.id, (err) => {
        if (err) return res.status(500).json({ message: "Error clearing cart", error: err.message });
        res.json({ message: "Cart cleared successfully", cart: [] });
    });
};

// POST /api/cart/sync - sync multiple items to database
const syncCart = (req, res) => {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ message: "Items array is required for sync" });
    }

    cartModel.syncItems(req.user.id, items, (err) => {
        if (err) return res.status(500).json({ message: "Error syncing cart", error: err.message });
        cartModel.getByUserId(req.user.id, (fetchErr, fullCart) => {
            res.json({ message: "Cart synchronized successfully", cart: fullCart || [] });
        });
    });
};

const cartController = {
    getCart,
    addToCart,
    updateQuantity,
    removeCartItem,
    clearCart,
    syncCart
};

export default cartController;
