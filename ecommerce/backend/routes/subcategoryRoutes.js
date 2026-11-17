import express from "express";
import subcategoryController from "../controllers/subcategoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", subcategoryController.getSubcategories);
router.post("/", authMiddleware, subcategoryController.createSubcategory);
router.put("/:id", authMiddleware, subcategoryController.updateSubcategory);
router.delete("/:id", authMiddleware, subcategoryController.deleteSubcategory);

export default router;
