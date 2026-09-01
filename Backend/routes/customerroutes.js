import express from "express";
import customerController from "../controllers/customerController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get total customers count
router.get(
    "/total-customers",
    authMiddleware,
    customerController.getTotalCustomers
);

// Get all customers
router.get(
    "/",
    authMiddleware,
    customerController.getAllCustomers
);

// Get one customer
router.get(
    "/:id",
    authMiddleware,
    customerController.getOneCustomer
);

// Create customer
router.post(
    "/",
    authMiddleware,
    customerController.addCustomer
);

// Update customer
router.put(
    "/:id",
    authMiddleware,
    customerController.editCustomer
);

// Delete customer
router.delete(
    "/:id",
    authMiddleware,
    customerController.removeCustomer
);

export default router;
