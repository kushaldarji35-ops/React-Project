import express from "express";
import couponController from "../controllers/couponController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: Validate coupon during checkout/cart
router.post("/validate", couponController.validateCoupon);

// Admin & Authorized routes
router.get("/stats", couponController.getCouponStats);
router.get("/", couponController.getCoupons);
router.get("/:id", couponController.getCouponById);
router.post("/", authMiddleware, couponController.createCoupon);
router.put("/:id", authMiddleware, couponController.updateCoupon);
router.delete("/:id", authMiddleware, couponController.deleteCoupon);

export default router;

