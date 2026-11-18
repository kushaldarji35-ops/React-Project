import express from "express";
import reviewController from "../controllers/reviewController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { handleReviewUpload } from "../middleware/reviewUpload.js";

const router = express.Router();

// Public routes for reading reviews
router.get("/", reviewController.getAllReviews);
router.get("/product/:productId", reviewController.getProductReviews);

// Authenticated routes
router.post("/", authMiddleware, handleReviewUpload, reviewController.createReview);
router.put("/:id/status", authMiddleware, reviewController.updateReviewStatus);
router.delete("/:id", authMiddleware, reviewController.deleteReview);

export default router;
