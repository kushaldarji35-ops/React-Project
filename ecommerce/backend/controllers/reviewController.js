import reviewModel from "../models/reviewModel.js";
import { removeReviewUploads, uploadedReviewFiles } from "../middleware/reviewUpload.js";

// GET /api/reviews/product/:productId - get approved reviews for a product
const getProductReviews = (req, res) => {
    const { productId } = req.params;
    reviewModel.getByProductId(productId, (err, reviews) => {
        if (err) return res.status(500).json({ message: "Database error fetching reviews", error: err.message });
        res.json(reviews);
    });
};

// GET /api/reviews - get all reviews (with optional filters)
const getAllReviews = (req, res) => {
    const { status, product_id } = req.query;
    reviewModel.getAll({ status, product_id }, (err, reviews) => {
        if (err) return res.status(500).json({ message: "Database error fetching reviews", error: err.message });
        res.json(reviews);
    });
};

// POST /api/reviews - submit a new review
const createReview = (req, res) => {
    const { product_id, productId, order_id, orderId, rating, comment } = req.body;

    const actualProductId = product_id || productId;
    if (!actualProductId || rating === undefined || rating === null) {
        removeReviewUploads(uploadedReviewFiles(req));
        return res.status(400).json({ message: "Product ID and rating (1-5) are required" });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        removeReviewUploads(uploadedReviewFiles(req));
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (typeof comment === "string" && comment.length > 2000) {
        removeReviewUploads(uploadedReviewFiles(req));
        return res.status(400).json({ message: "Review text must be 2000 characters or fewer." });
    }

    const media = uploadedReviewFiles(req).map((file) => ({
        type: file.mimetype.startsWith("image/") ? "image" : "video",
        url: `/uploads/reviews/${file.filename}`,
        name: file.originalname
    }));
    const reviewData = {
        product_id: actualProductId,
        order_id: order_id || orderId || null,
        rating: numericRating,
        comment: comment || null,
        media,
        status: "pending"
    };

    reviewModel.create(req.user.id, reviewData, (err, result) => {
        if (err) {
            removeReviewUploads(uploadedReviewFiles(req));
            console.error("Review creation error:", err);
            return res.status(500).json({ message: "Error submitting review", error: err.message });
        }
        res.status(201).json(result);
    });
};

// PUT /api/reviews/:id/status - update review status (admin)
const updateReviewStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    reviewModel.updateStatus(id, status, (err, result) => {
        if (err) return res.status(500).json({ message: "Error updating review status", error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Review not found" });
        res.json({ message: "Review status updated successfully" });
    });
};

// DELETE /api/reviews/:id - delete a review
const deleteReview = (req, res) => {
    const { id } = req.params;
    const isAdmin = req.user.role === "admin";
    const userId = req.user.id;

    reviewModel.remove(id, userId, isAdmin, (err, result) => {
        if (err) return res.status(500).json({ message: "Error deleting review", error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Review not found or unauthorized" });
        res.json({ message: "Review deleted successfully" });
    });
};

const reviewController = {
    getProductReviews,
    getAllReviews,
    createReview,
    updateReviewStatus,
    deleteReview
};

export default reviewController;
