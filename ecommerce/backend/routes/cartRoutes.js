import express from "express";
import cartController from "../controllers/cartController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All cart routes require user authentication
router.use(authMiddleware);

// Get cart items for logged-in user
router.get("/", cartController.getCart);

// Add item to cart
router.post("/add", cartController.addToCart);
router.post("/", cartController.addToCart);

// Sync local items to database cart
router.post("/sync", cartController.syncCart);

// Update quantity of specific cart item
router.put("/:id", cartController.updateQuantity);

// Remove specific item from cart
router.delete("/:id", cartController.removeCartItem);

// Clear entire cart
router.delete("/", cartController.clearCart);

export default router;
