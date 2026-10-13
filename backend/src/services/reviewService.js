
const db = require("../utils/db");

// Get all reviews for a resource
const getResourceReviews = async (resourceId) => {
    const [rows] = await db.query(
        `SELECT
            r.review_id,
            r.user_id,
            r.resource_id,
            r.booking_id,
            r.rating,
            r.comment,
            r.created_at,
            u.name AS reviewer_name
         FROM reviews r
         INNER JOIN users u ON u.user_id = r.user_id
         WHERE r.resource_id = ?
         ORDER BY r.created_at DESC, r.review_id DESC`,
        [resourceId]
    );

    return rows;
};

// Create a review for an eligible completed booking
const createReview = async (
    userId,
    resourceId,
    bookingId,
    rating,
    comment
) => {
    const [bookingRows] = await db.query(
        `SELECT booking_id, user_id, resource_id, status
         FROM bookings
         WHERE booking_id = ?`,
        [bookingId]
    );

    if (bookingRows.length === 0) {
        throw new Error("BOOKING_NOT_FOUND");
    }

    const booking = bookingRows[0];

    if (Number(booking.user_id) !== Number(userId)) {
        throw new Error("BOOKING_ACCESS_DENIED");
    }

    if (Number(booking.resource_id) !== Number(resourceId)) {
        throw new Error("BOOKING_RESOURCE_MISMATCH");
    }

    if (booking.status !== "COMPLETED") {
        throw new Error("BOOKING_NOT_COMPLETED");
    }

    const [existingReviews] = await db.query(
        `SELECT review_id
         FROM reviews
         WHERE booking_id = ?
           AND user_id = ?
         LIMIT 1`,
        [bookingId, userId]
    );

    if (existingReviews.length > 0) {
        throw new Error("REVIEW_ALREADY_EXISTS");
    }

    const [result] = await db.query(
        `INSERT INTO reviews
            (user_id, resource_id, booking_id, rating, comment)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, resourceId, bookingId, rating, comment]
    );

    const [reviewRows] = await db.query(
        `SELECT
            review_id,
            user_id,
            resource_id,
            booking_id,
            rating,
            comment,
            created_at
         FROM reviews
         WHERE review_id = ?`,
        [result.insertId]
    );

    return reviewRows[0];
};

// Get one review
const getReviewById = async (reviewId) => {
    const [rows] = await db.query(
        `SELECT
            r.review_id,
            r.user_id,
            r.resource_id,
            r.booking_id,
            r.rating,
            r.comment,
            r.created_at,
            u.name AS reviewer_name
         FROM reviews r
         INNER JOIN users u ON u.user_id = r.user_id
         WHERE r.review_id = ?
         LIMIT 1`,
        [reviewId]
    );

    if (rows.length === 0) {
        throw new Error("REVIEW_NOT_FOUND");
    }

    return rows[0];
};

// Update only the review owner's review
const updateReview = async (
    reviewId,
    userId,
    rating,
    comment
) => {
    const [rows] = await db.query(
        `SELECT review_id, user_id
         FROM reviews
         WHERE review_id = ?
         LIMIT 1`,
        [reviewId]
    );

    if (rows.length === 0) {
        throw new Error("REVIEW_NOT_FOUND");
    }

    if (Number(rows[0].user_id) !== Number(userId)) {
        throw new Error("REVIEW_ACCESS_DENIED");
    }

    await db.query(
        `UPDATE reviews
         SET rating = ?, comment = ?
         WHERE review_id = ?
           AND user_id = ?`,
        [rating, comment, reviewId, userId]
    );

    return getReviewById(reviewId);
};

// Delete a review: owner or ADMIN
const deleteReview = async (reviewId, userId, userRole) => {
    const [rows] = await db.query(
        `SELECT review_id, user_id
         FROM reviews
         WHERE review_id = ?
         LIMIT 1`,
        [reviewId]
    );

    if (rows.length === 0) {
        throw new Error("REVIEW_NOT_FOUND");
    }

    const isOwner =
        Number(rows[0].user_id) === Number(userId);
    const isAdmin = userRole === "ADMIN";

    if (!isOwner && !isAdmin) {
        throw new Error("REVIEW_ACCESS_DENIED");
    }

    await db.query(
        `DELETE FROM reviews WHERE review_id = ?`,
        [reviewId]
    );

    return {
        review_id: Number(reviewId),
        deleted: true
    };
};

module.exports = {
    getResourceReviews,
    createReview,
    getReviewById,
    updateReview,
    deleteReview
};
