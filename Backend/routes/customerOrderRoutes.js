import express from "express";
import customerOrderController from "../controllers/customerOrderController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware so req.user is automatically populated from JWT token
router.use(authMiddleware);

// GET customer order statistics (for Customer Dashboard)
router.get("/stats", customerOrderController.getMyStats);

// GET customer profile
router.get("/profile", customerOrderController.getMyProfile);

// GET all orders belonging to the logged-in customer
router.get("/orders", customerOrderController.getMyOrders);

// GET specific order by ID
router.get("/orders/:id", customerOrderController.getMyOrderById);

// CREATE new order for logged-in customer (auto-associates email)
router.post("/orders", customerOrderController.createMyOrder);

// UPDATE customer's order
router.put("/orders/:id", customerOrderController.updateMyOrder);

// DELETE / CANCEL customer's order
router.delete("/orders/:id", customerOrderController.deleteMyOrder);

export default router;
