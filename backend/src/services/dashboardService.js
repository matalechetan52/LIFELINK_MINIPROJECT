
const db = require("../utils/db");

const toNumber = (value) =>
    value === null || value === undefined ? 0 : Number(value);

const normalizeMetrics = (row, numericFields) => {
    const result = { ...row };

    for (const field of numericFields) {
        result[field] = toNumber(result[field]);
    }

    return result;
};

// Booking summary, scoped to either one user or one provider
const getBookingMetrics = async ({ userId, ownerId } = {}) => {
    let where = "";
    const params = [];

    if (userId !== undefined) {
        where = "WHERE b.user_id = ?";
        params.push(userId);
    } else if (ownerId !== undefined) {
        where = "WHERE r.owner_id = ?";
        params.push(ownerId);
    }

    const [rows] = await db.query(
        `SELECT
            COUNT(*) AS total_bookings,
            COALESCE(SUM(b.status = 'PENDING'), 0) AS pending_bookings,
            COALESCE(SUM(b.status = 'CONFIRMED'), 0) AS confirmed_bookings,
            COALESCE(SUM(b.status = 'ACTIVE'), 0) AS active_bookings,
            COALESCE(SUM(b.status = 'COMPLETED'), 0) AS completed_bookings,
            COALESCE(SUM(b.status = 'CANCELLED'), 0) AS cancelled_bookings
         FROM bookings b
         INNER JOIN resources r ON r.resource_id = b.resource_id
         ${where}`,
        params
    );

    return normalizeMetrics(rows[0], [
        "total_bookings",
        "pending_bookings",
        "confirmed_bookings",
        "active_bookings",
        "completed_bookings",
        "cancelled_bookings"
    ]);
};

// Resource summary; no ownerId means platform-wide ADMIN scope
const getResourceMetrics = async (ownerId) => {
    const where = ownerId !== undefined
        ? "WHERE owner_id = ?"
        : "";

    const params = ownerId !== undefined ? [ownerId] : [];

    const [rows] = await db.query(
        `SELECT
            COUNT(*) AS total_resources,
            COALESCE(SUM(status = 'AVAILABLE'), 0) AS available_resources,
            COALESCE(SUM(status = 'UNAVAILABLE'), 0) AS unavailable_resources,
            COALESCE(SUM(status = 'MAINTENANCE'), 0) AS maintenance_resources,
            COALESCE(SUM(status = 'INACTIVE'), 0) AS inactive_resources
         FROM resources
         ${where}`,
        params
    );

    return normalizeMetrics(rows[0], [
        "total_resources",
        "available_resources",
        "unavailable_resources",
        "maintenance_resources",
        "inactive_resources"
    ]);
};

// Queue summary for a customer, provider, or ADMIN
const getQueueMetrics = async ({ userId, ownerId } = {}) => {
    let where = "";
    const params = [];

    if (userId !== undefined) {
        where = "WHERE q.user_id = ?";
        params.push(userId);
    } else if (ownerId !== undefined) {
        where = "WHERE r.owner_id = ?";
        params.push(ownerId);
    }

    const [rows] = await db.query(
        `SELECT
            COUNT(*) AS total_queue_entries,
            COALESCE(SUM(q.status = 'WAITING'), 0) AS waiting_entries,
            COALESCE(SUM(q.status = 'RESERVED'), 0) AS reserved_entries,
            COALESCE(SUM(q.status = 'CANCELLED'), 0) AS cancelled_entries,
            COALESCE(SUM(q.status = 'EXPIRED'), 0) AS expired_entries
         FROM reservation_queue q
         INNER JOIN resources r ON r.resource_id = q.resource_id
         ${where}`,
        params
    );

    return normalizeMetrics(rows[0], [
        "total_queue_entries",
        "waiting_entries",
        "reserved_entries",
        "cancelled_entries",
        "expired_entries"
    ]);
};

// Payment summary scoped to a customer, provider, or ADMIN
const getPaymentMetrics = async ({ userId, ownerId } = {}) => {
    let where = "";
    const params = [];

    if (userId !== undefined) {
        where = "WHERE b.user_id = ?";
        params.push(userId);
    } else if (ownerId !== undefined) {
        where = "WHERE r.owner_id = ?";
        params.push(ownerId);
    }

    const [rows] = await db.query(
        `SELECT
            COUNT(*) AS total_payments,
            COALESCE(SUM(p.status = 'PENDING'), 0) AS pending_payments,
            COALESCE(SUM(p.status = 'PAID'), 0) AS paid_payments,
            COALESCE(SUM(p.status = 'FAILED'), 0) AS failed_payments,
            COALESCE(SUM(p.status = 'REFUNDED'), 0) AS refunded_payments,
            COALESCE(SUM(
                CASE WHEN p.status = 'PAID'
                THEN p.amount ELSE 0 END
            ), 0) AS paid_amount
         FROM payments p
         INNER JOIN bookings b ON b.booking_id = p.booking_id
         INNER JOIN resources r ON r.resource_id = b.resource_id
         ${where}`,
        params
    );

    return normalizeMetrics(rows[0], [
        "total_payments",
        "pending_payments",
        "paid_payments",
        "failed_payments",
        "refunded_payments",
        "paid_amount"
    ]);
};

const getReviewMetrics = async (ownerId) => {
    const where = ownerId !== undefined
        ? "WHERE r.owner_id = ?"
        : "";

    const params = ownerId !== undefined ? [ownerId] : [];

    const [rows] = await db.query(
        `SELECT
            COUNT(rv.review_id) AS total_reviews,
            ROUND(AVG(rv.rating), 2) AS average_rating
         FROM resources r
         LEFT JOIN reviews rv ON rv.resource_id = r.resource_id
         ${where}`,
        params
    );

    return {
        total_reviews: toNumber(rows[0].total_reviews),
        average_rating: rows[0].average_rating === null
            ? null
            : Number(rows[0].average_rating)
    };
};

const getMaintenanceMetrics = async (ownerId) => {
    const where = ownerId !== undefined
        ? "WHERE r.owner_id = ?"
        : "";

    const params = ownerId !== undefined ? [ownerId] : [];

    const [rows] = await db.query(
        `SELECT
            COUNT(m.maintenance_id) AS total_records,
            COALESCE(SUM(m.status = 'SCHEDULED'), 0) AS scheduled,
            COALESCE(SUM(m.status = 'ONGOING'), 0) AS ongoing,
            COALESCE(SUM(m.status = 'COMPLETED'), 0) AS completed,
            COALESCE(SUM(m.status = 'CANCELLED'), 0) AS cancelled
         FROM resources r
         LEFT JOIN maintenance m ON m.resource_id = r.resource_id
         ${where}`,
        params
    );

    return normalizeMetrics(rows[0], [
        "total_records",
        "scheduled",
        "ongoing",
        "completed",
        "cancelled"
    ]);
};

const getNotificationMetrics = async (userId) => {
    const [rows] = await db.query(
        `SELECT
            COUNT(*) AS total_notifications,
            COALESCE(SUM(is_read = 0), 0) AS unread_notifications
         FROM notifications
         WHERE user_id = ?`,
        [userId]
    );

    return normalizeMetrics(rows[0], [
        "total_notifications",
        "unread_notifications"
    ]);
};

const getRecentBookings = async ({ userId, ownerId } = {}) => {
    let where = "";
    const params = [];

    if (userId !== undefined) {
        where = "WHERE b.user_id = ?";
        params.push(userId);
    } else if (ownerId !== undefined) {
        where = "WHERE r.owner_id = ?";
        params.push(ownerId);
    }

    const [rows] = await db.query(
        `SELECT
            b.booking_id,
            b.resource_id,
            r.name AS resource_name,
            b.start_time,
            b.end_time,
            b.status,
            b.total_amount,
            b.created_at
         FROM bookings b
         INNER JOIN resources r ON r.resource_id = b.resource_id
         ${where}
         ORDER BY b.created_at DESC, b.booking_id DESC
         LIMIT 5`,
        params
    );

    return rows;
};

const getRecentQueueEntries = async ({ userId, ownerId } = {}) => {
    let where = "";
    const params = [];

    if (userId !== undefined) {
        where = "WHERE q.user_id = ?";
        params.push(userId);
    } else if (ownerId !== undefined) {
        where = "WHERE r.owner_id = ?";
        params.push(ownerId);
    }

    const [rows] = await db.query(
        `SELECT
            q.queue_id,
            q.resource_id,
            r.name AS resource_name,
            q.requested_start,
            q.requested_end,
            q.priority_score,
            q.queue_position,
            q.status,
            q.joined_at
         FROM reservation_queue q
         INNER JOIN resources r ON r.resource_id = q.resource_id
         ${where}
         ORDER BY
            CASE WHEN q.status = 'WAITING' THEN 0 ELSE 1 END,
            q.queue_position ASC,
            q.joined_at DESC
         LIMIT 5`,
        params
    );

    return rows;
};

const getRecentPayments = async (userId) => {
    const [rows] = await db.query(
        `SELECT
            p.payment_id,
            p.booking_id,
            r.name AS resource_name,
            p.amount,
            p.payment_method,
            p.status,
            p.paid_at
         FROM payments p
         INNER JOIN bookings b ON b.booking_id = p.booking_id
         INNER JOIN resources r ON r.resource_id = b.resource_id
         WHERE b.user_id = ?
         ORDER BY p.payment_id DESC
         LIMIT 5`,
        [userId]
    );

    return rows;
};

const getRecentNotifications = async (userId) => {
    const [rows] = await db.query(
        `SELECT
            notification_id,
            type,
            message,
            is_read,
            created_at
         FROM notifications
         WHERE user_id = ?
         ORDER BY created_at DESC, notification_id DESC
         LIMIT 5`,
        [userId]
    );

    return rows;
};

const getDashboard = async (user) => {
    const userId = Number(user.user_id);

    if (user.role === "USER") {
        const bookings = await getBookingMetrics({ userId });
        const queue = await getQueueMetrics({ userId });
        const payments = await getPaymentMetrics({ userId });
        const notifications = await getNotificationMetrics(userId);

        return {
            role: "USER",
            summary: {
                bookings,
                queue,
                payments,
                notifications
            },
            recent: {
                bookings: await getRecentBookings({ userId }),
                queue: await getRecentQueueEntries({ userId }),
                payments: await getRecentPayments(userId),
                notifications: await getRecentNotifications(userId)
            }
        };
    }

    if (user.role === "OWNER") {
        const ownerId = userId;

        const resources = await getResourceMetrics(ownerId);
        const bookings = await getBookingMetrics({ ownerId });
        const queue = await getQueueMetrics({ ownerId });
        const maintenance = await getMaintenanceMetrics(ownerId);
        const reviews = await getReviewMetrics(ownerId);

        return {
            role: "OWNER",
            summary: {
                resources,
                bookings,
                queue,
                maintenance,
                reviews
            },
            recent: {
                bookings: await getRecentBookings({ ownerId }),
                queue: await getRecentQueueEntries({ ownerId })
            }
        };
    }

    if (user.role === "ADMIN") {
        const [userRows] = await db.query(
            `SELECT
                COUNT(*) AS total_users,
                COALESCE(SUM(role = 'USER'), 0) AS customers,
                COALESCE(SUM(role = 'OWNER'), 0) AS resource_providers,
                COALESCE(SUM(role = 'ADMIN'), 0) AS administrators
             FROM users`
        );

        const users = normalizeMetrics(userRows[0], [
            "total_users",
            "customers",
            "resource_providers",
            "administrators"
        ]);

        const resources = await getResourceMetrics();
        const bookings = await getBookingMetrics();
        const queue = await getQueueMetrics();
        const payments = await getPaymentMetrics();
        const maintenance = await getMaintenanceMetrics();
        const reviews = await getReviewMetrics();

        return {
            role: "ADMIN",
            summary: {
                users,
                resources,
                bookings,
                queue,
                payments,
                maintenance,
                reviews
            },
            recent: {
                bookings: await getRecentBookings(),
                queue: await getRecentQueueEntries()
            }
        };
    }

    throw new Error("UNSUPPORTED_DASHBOARD_ROLE");
};

module.exports = {
    getDashboard
};
