import express from "express";
import productController from "../controllers/productController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

// Protected routes (Admin / authorized)
router.post("/", authMiddleware, productController.createProduct);
router.put("/:id", authMiddleware, productController.updateProduct);
router.delete("/:id", authMiddleware, productController.deleteProduct);

export default router;
