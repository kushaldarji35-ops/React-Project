import express from "express";
import adminController from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET TOTAL USERS COUNT
router.get( "/total-users",authMiddleware,adminController.getTotalUsers);

// GET ALL USERS
router.get("/",authMiddleware,adminController.getusers);

// GET ONE USER
router.get("/:id",authMiddleware,adminController.getuserbyid);

// UPDATE USER
router.put("/:id",authMiddleware,adminController.updateuser);

// DELETE USER
router.delete("/:id",authMiddleware,adminController.deleteuser);

export default router;