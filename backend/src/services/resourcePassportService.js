
const db = require("../utils/db");

// Verify that a resource exists and check its owner
const getResourceAccess = async (resourceId, userId, userRole) => {
    const [rows] = await db.query(
        `SELECT resource_id, owner_id, category_id, name,
                description, location, price_per_hour,
                status, created_at
         FROM resources
         WHERE resource_id = ?
         LIMIT 1`,
        [resourceId]
    );

    if (rows.length === 0) {
        throw new Error("RESOURCE_NOT_FOUND");
    }

    const resource = rows[0];

    if (
        userRole !== "ADMIN" &&
        Number(resource.owner_id) !== Number(userId)
    ) {
        throw new Error("RESOURCE_ACCESS_DENIED");
    }

    return resource;
};

// Get lifecycle history for a resource
const getResourceHistory = async (
    resourceId,
    userId,
    userRole
) => {
    await getResourceAccess(resourceId, userId, userRole);

    const [rows] = await db.query(
        `SELECT
            history_id,
            resource_id,
            event_type,
            event_description,
            event_date
         FROM resource_history
         WHERE resource_id = ?
         ORDER BY event_date DESC, history_id DESC`,
        [resourceId]
    );

    return rows;
};

// Get the consolidated Resource Passport
const getResourcePassport = async (
    resourceId,
    userId,
    userRole
) => {
    const resource = await getResourceAccess(
        resourceId,
        userId,
        userRole
    );

    const [historyRows] = await db.query(
        `SELECT COUNT(*) AS total_history_events
         FROM resource_history
         WHERE resource_id = ?`,
        [resourceId]
    );

    const [bookingRows] = await db.query(
        `SELECT
            COUNT(*) AS total_bookings,
            SUM(CASE WHEN status = 'COMPLETED'
                THEN 1 ELSE 0 END) AS completed_bookings
         FROM bookings
         WHERE resource_id = ?`,
        [resourceId]
    );

    const [maintenanceRows] = await db.query(
        `SELECT
            COUNT(*) AS total_maintenance_records,
            SUM(CASE WHEN status = 'COMPLETED'
                THEN 1 ELSE 0 END) AS completed_maintenance
         FROM maintenance
         WHERE resource_id = ?`,
        [resourceId]
    );

    const [reviewRows] = await db.query(
        `SELECT
            COUNT(*) AS total_reviews,
            ROUND(AVG(rating), 2) AS average_rating
         FROM reviews
         WHERE resource_id = ?`,
        [resourceId]
    );

    return {
        resource,
        summary: {
            total_history_events:
                Number(historyRows[0].total_history_events),
            total_bookings:
                Number(bookingRows[0].total_bookings),
            completed_bookings:
                Number(bookingRows[0].completed_bookings || 0),
            total_maintenance_records:
                Number(maintenanceRows[0].total_maintenance_records),
            completed_maintenance:
                Number(maintenanceRows[0].completed_maintenance || 0),
            total_reviews:
                Number(reviewRows[0].total_reviews),
            average_rating:
                reviewRows[0].average_rating === null
                    ? null
                    : Number(reviewRows[0].average_rating)
        }
    };
};

// Get booking history for a resource
const getPassportBookings = async (
    resourceId,
    userId,
    userRole
) => {
    await getResourceAccess(resourceId, userId, userRole);

    const [rows] = await db.query(
        `SELECT
            booking_id,
            user_id,
            start_time,
            end_time,
            status,
            total_amount,
            created_at
         FROM bookings
         WHERE resource_id = ?
         ORDER BY start_time DESC, booking_id DESC`,
        [resourceId]
    );

    return rows;
};

// Get maintenance history for a resource
const getPassportMaintenance = async (
    resourceId,
    userId,
    userRole
) => {
    await getResourceAccess(resourceId, userId, userRole);

    const [rows] = await db.query(
        `SELECT
            maintenance_id,
            resource_id,
            start_date,
            end_date,
            reason,
            status
         FROM maintenance
         WHERE resource_id = ?
         ORDER BY start_date DESC, maintenance_id DESC`,
        [resourceId]
    );

    return rows;
};

// Get reviews associated with a resource
const getPassportReviews = async (
    resourceId,
    userId,
    userRole
) => {
    await getResourceAccess(resourceId, userId, userRole);

    const [rows] = await db.query(
        `SELECT
            r.review_id,
            r.user_id,
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

module.exports = {
    getResourceHistory,
    getResourcePassport,
    getPassportBookings,
    getPassportMaintenance,
    getPassportReviews
};
