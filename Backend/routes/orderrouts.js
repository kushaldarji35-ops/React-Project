import express from "express";

import {
    getAllOrders,
    getOneOrder,
    addOrder,
    editOrder,
    removeOrder,
    getStats
} from "../controllers/orderController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// Get all orders
router.get("/", authMiddleware, getAllOrders);

// Get order stats
router.get("/stats", authMiddleware, getStats);


// Get one order

router.get(
    "/:id",
    authMiddleware,
    getOneOrder
);


// Create order

router.post(
    "/",
    authMiddleware,
    addOrder
);


// Update order

router.put(
    "/:id",
    authMiddleware,
    editOrder
);


// Delete order

router.delete(
    "/:id",
    authMiddleware,
    removeOrder
);


export default router;