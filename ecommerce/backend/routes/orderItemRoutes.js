import express from "express";
import orderItemController from "../controllers/orderItemController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Get items for a specific order
router.get("/:orderId", orderItemController.getOrderItems);

// Add an item to an order
router.post("/", orderItemController.addOrderItem);

// Remove an item from an order
router.delete("/:id", orderItemController.deleteOrderItem);

export default router;
