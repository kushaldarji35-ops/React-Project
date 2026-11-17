import express from "express";
import adminController from "../controllers/adminController.js";
import orderController from "../controllers/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// STATS
router.get("/total-users", authMiddleware, adminController.getTotalUsers);
router.get("/total-orders", authMiddleware, adminController.getTotalOrders);
router.get("/total-products", authMiddleware, adminController.getTotalProducts);
router.get("/revenue", authMiddleware, adminController.getRevenue);

// ORDERS (Admin)
router.get("/orders", authMiddleware, orderController.getAllOrders);
router.get("/orders/:id", authMiddleware, orderController.getOrderById);
router.put("/orders/:id/status", authMiddleware, orderController.updateOrderStatus);
router.delete("/orders/:id", authMiddleware, orderController.deleteOrder);

// USERS CRUD
router.get("/", authMiddleware, adminController.getusers);
router.get("/users", authMiddleware, adminController.getusers);
router.post("/users", authMiddleware, adminController.createuser);
router.get("/users/:id", authMiddleware, adminController.getuserbyid);
router.put("/users/:id", authMiddleware, adminController.updateuser);
router.delete("/users/:id", authMiddleware, adminController.deleteuser);

// Backward compatibility routes for /:id
router.get("/:id", authMiddleware, adminController.getuserbyid);
router.put("/:id", authMiddleware, adminController.updateuser);   
router.delete("/:id", authMiddleware, adminController.deleteuser);

export default router;