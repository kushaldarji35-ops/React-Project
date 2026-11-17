import express from "express";
import orderController from "../controllers/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All order routes require authentication
router.use(authMiddleware);

// Get current user's orders
router.get("/my-orders", orderController.getMyOrders);

// Get all orders (admin gets all, regular users get their own)
router.get("/", orderController.getAllOrders);

// Get single order by ID
router.get("/:id", orderController.getOrderById);

// Place a new order with items
router.post("/", orderController.createOrder);

// Update order status (admin)
router.put("/:id/status", orderController.updateOrderStatus);

// Delete order (admin)
router.delete("/:id", orderController.deleteOrder);

export default router;
