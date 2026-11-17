import express from "express";
import categoryController from "../controllers/categoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);

// Protected routes (Admin / authorized)
router.post("/", authMiddleware, categoryController.createCategory);
router.put("/:id", authMiddleware, categoryController.updateCategory);
router.delete("/:id", authMiddleware, categoryController.deleteCategory);

export default router;
