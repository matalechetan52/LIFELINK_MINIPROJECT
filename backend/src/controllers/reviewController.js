
const reviewService = require("../services/reviewService");

const handleReviewError = (res, error) => {
    const errors = {
        BOOKING_NOT_FOUND: [404, "Booking not found"],
        BOOKING_ACCESS_DENIED: [403, "You cannot review another user's booking"],
        BOOKING_RESOURCE_MISMATCH: [400, "The booking does not belong to this resource"],
        BOOKING_NOT_COMPLETED: [400, "Only completed bookings can be reviewed"],
        REVIEW_ALREADY_EXISTS: [409, "A review already exists for this booking"],
        REVIEW_NOT_FOUND: [404, "Review not found"],
        REVIEW_ACCESS_DENIED: [403, "You are not allowed to modify this review"]
    };

    const mapped = errors[error.message];

    if (mapped) {
        return res.status(mapped[0]).json({
            success: false,
            message: mapped[1]
        });
    }

    console.error("Review error:", error.message);

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
};

const isPositiveId = (value) =>
    Number.isInteger(Number(value)) && Number(value) > 0;

const validateRating = (rating) =>
    Number.isInteger(rating) && rating >= 1 && rating <= 5;

// GET /api/resources/:resourceId/reviews
const getResourceReviews = async (req, res) => {
    try {
        const { resourceId } = req.params;

        if (!isPositiveId(resourceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource ID"
            });
        }

        const reviews = await reviewService.getResourceReviews(
            Number(resourceId)
        );

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        return handleReviewError(res, error);
    }
};

// POST /api/reviews
const createReview = async (req, res) => {
    try {
        const { resource_id, booking_id, rating, comment } = req.body;

        if (!isPositiveId(resource_id) || !isPositiveId(booking_id)) {
            return res.status(400).json({
                success: false,
                message: "Valid resource_id and booking_id are required"
            });
        }

        if (!validateRating(rating)) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5"
            });
        }

        if (
            comment !== undefined &&
            comment !== null &&
            typeof comment !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Comment must be a string"
            });
        }

        const review = await reviewService.createReview(
            req.user.user_id,
            Number(resource_id),
            Number(booking_id),
            rating,
            comment?.trim() || null
        );

        return res.status(201).json({
            success: true,
            message: "Review created successfully",
            data: review
        });
    } catch (error) {
        return handleReviewError(res, error);
    }
};

// GET /api/reviews/:id
const getReviewById = async (req, res) => {
    try {
        if (!isPositiveId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID"
            });
        }

        const review = await reviewService.getReviewById(
            Number(req.params.id)
        );

        return res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        return handleReviewError(res, error);
    }
};

// PUT /api/reviews/:id
const updateReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const { rating, comment } = req.body;

        if (!isPositiveId(reviewId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID"
            });
        }

        if (!validateRating(rating)) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5"
            });
        }

        if (
            comment !== undefined &&
            comment !== null &&
            typeof comment !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Comment must be a string"
            });
        }

        const review = await reviewService.updateReview(
            Number(reviewId),
            req.user.user_id,
            rating,
            comment?.trim() || null
        );

        return res.status(200).json({
            success: true,
            message: "Review updated successfully",
            data: review
        });
    } catch (error) {
        return handleReviewError(res, error);
    }
};

// DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
    try {
        if (!isPositiveId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID"
            });
        }

        const result = await reviewService.deleteReview(
            Number(req.params.id),
            req.user.user_id,
            req.user.role
        );

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully",
            data: result
        });
    } catch (error) {
        return handleReviewError(res, error);
    }
};

module.exports = {
    getResourceReviews,
    createReview,
    getReviewById,
    updateReview,
    deleteReview
};
