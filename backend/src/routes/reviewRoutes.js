
const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/reviewController");
const authenticateToken = require("../middleware/authMiddleware");

// List reviews for a resource
router.get(
    "/resources/:resourceId/reviews",
    authenticateToken,
    reviewController.getResourceReviews
);

// Create a review for a completed booking
router.post(
    "/reviews",
    authenticateToken,
    reviewController.createReview
);

// Get one review
router.get(
    "/reviews/:id",
    authenticateToken,
    reviewController.getReviewById
);

// Update own review
router.put(
    "/reviews/:id",
    authenticateToken,
    reviewController.updateReview
);

// Delete own review or allow ADMIN
router.delete(
    "/reviews/:id",
    authenticateToken,
    reviewController.deleteReview
);

module.exports = router;
