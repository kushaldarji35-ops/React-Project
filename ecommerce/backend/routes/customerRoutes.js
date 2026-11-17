import express from "express";
import customerController from "../controllers/customerController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET profile of logged-in customer
router.get("/profile", authMiddleware, customerController.getProfile);

// UPDATE profile of logged-in customer
router.put("/profile", authMiddleware, customerController.updateProfile);

// CHANGE password of logged-in customer
router.put("/change-password", authMiddleware, customerController.changePassword);

// DELETE account of logged-in customer
router.delete("/delete-account", authMiddleware, customerController.deleteAccount);

export default router;
