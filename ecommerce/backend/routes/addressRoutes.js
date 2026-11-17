import express from "express";
import addressController from "../controllers/addressController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require a valid JWT
router.get("/", authMiddleware, addressController.getAddresses);
router.post("/", authMiddleware, addressController.createAddress);
router.put("/:id", authMiddleware, addressController.updateAddress);
router.delete("/:id", authMiddleware, addressController.deleteAddress);

export default router;
