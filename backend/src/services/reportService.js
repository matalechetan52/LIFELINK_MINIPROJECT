
const db = require("../utils/db");

const toNumber = (value) =>
    value === null || value === undefined ? 0 : Number(value);

const normalizeRows = (rows, numericFields) =>
    rows.map((row) => {
        const result = { ...row };

        for (const field of numericFields) {
            result[field] = toNumber(result[field]);
        }

        return result;
    });

const getResourceReport = async (user) => {
    const isOwner = user.role === "OWNER";
    const where = isOwner ? "WHERE r.owner_id = ?" : "";
    const params = isOwner ? [user.user_id] : [];

    const [summaryRows] = await db.query(
        `SELECT
            COUNT(*) AS total_resources,
            COALESCE(SUM(r.status = 'AVAILABLE'), 0) AS available,
            COALESCE(SUM(r.status = 'UNAVAILABLE'), 0) AS unavailable,
            COALESCE(SUM(r.status = 'MAINTENANCE'), 0) AS in_maintenance,
            COALESCE(SUM(r.status = 'INACTIVE'), 0) AS inactive,
            ROUND(AVG(r.price_per_hour), 2) AS average_hourly_price
         FROM resources r
         ${where}`,
        params
    );

    const summary = {
        ...summaryRows[0],
        total_resources: toNumber(summaryRows[0].total_resources),
        available: toNumber(summaryRows[0].available),
        unavailable: toNumber(summaryRows[0].unavailable),
        in_maintenance: toNumber(summaryRows[0].in_maintenance),
        inactive: toNumber(summaryRows[0].inactive),
        average_hourly_price:
            summaryRows[0].average_hourly_price === null
                ? null
                : Number(summaryRows[0].average_hourly_price)
    };

    const [resourceRows] = await db.query(
        `SELECT
            r.resource_id,
            r.owner_id,
            r.category_id,
            c.category_name,
            r.name,
            r.location,
            r.price_per_hour,
            r.status,
            r.created_at,
            COALESCE(bs.total_bookings, 0) AS total_bookings,
            COALESCE(bs.completed_bookings, 0) AS completed_bookings,
            COALESCE(qs.waiting_entries, 0) AS waiting_entries,
            COALESCE(ms.maintenance_records, 0) AS maintenance_records,
            COALESCE(rs.total_reviews, 0) AS total_reviews,
            rs.average_rating
         FROM resources r
         LEFT JOIN categories c
            ON c.category_id = r.category_id
         LEFT JOIN (
            SELECT
                resource_id,
                COUNT(*) AS total_bookings,
                SUM(status = 'COMPLETED') AS completed_bookings
            FROM bookings
            GROUP BY resource_id
         ) bs ON bs.resource_id = r.resource_id
         LEFT JOIN (
            SELECT
                resource_id,
                COUNT(*) AS waiting_entries
            FROM reservation_queue
            WHERE status = 'WAITING'
            GROUP BY resource_id
         ) qs ON qs.resource_id = r.resource_id
         LEFT JOIN (
            SELECT resource_id, COUNT(*) AS maintenance_records
            FROM maintenance
            GROUP BY resource_id
         ) ms ON ms.resource_id = r.resource_id
         LEFT JOIN (
            SELECT
                resource_id,
                COUNT(*) AS total_reviews,
                ROUND(AVG(rating), 2) AS average_rating
            FROM reviews
            GROUP BY resource_id
         ) rs ON rs.resource_id = r.resource_id
         ${where}
         ORDER BY r.created_at DESC, r.resource_id DESC`,
        params
    );

    return {
        summary,
        resources: resourceRows.map((row) => ({
            ...row,
            price_per_hour: Number(row.price_per_hour),
            total_bookings: toNumber(row.total_bookings),
            completed_bookings: toNumber(row.completed_bookings),
            waiting_entries: toNumber(row.waiting_entries),
            maintenance_records: toNumber(row.maintenance_records),
            total_reviews: toNumber(row.total_reviews),
            average_rating: row.average_rating === null
                ? null
                : Number(row.average_rating)
        }))
    };
};

const getBookingReport = async (user) => {
    const isOwner = user.role === "OWNER";
    const scope = isOwner ? "r.owner_id = ?" : "1 = 1";
    const params = isOwner ? [user.user_id] : [];

    const [summaryRows] = await db.query(
        `SELECT
            COUNT(*) AS total_bookings,
            COALESCE(SUM(b.status = 'PENDING'), 0) AS pending,
            COALESCE(SUM(b.status = 'CONFIRMED'), 0) AS confirmed,
            COALESCE(SUM(b.status = 'ACTIVE'), 0) AS active,
            COALESCE(SUM(b.status = 'COMPLETED'), 0) AS completed,
            COALESCE(SUM(b.status = 'CANCELLED'), 0) AS cancelled,
            COALESCE(SUM(
                CASE WHEN b.status <> 'CANCELLED'
                THEN b.total_amount ELSE 0 END
            ), 0) AS non_cancelled_booking_value
         FROM bookings b
         INNER JOIN resources r ON r.resource_id = b.resource_id
         WHERE ${scope}`,
        params
    );

    const summary = normalizeRows(summaryRows, [
        "total_bookings",
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
        "non_cancelled_booking_value"
    ])[0];

    const [statusRows] = await db.query(
        `SELECT
            b.status,
            COUNT(*) AS booking_count,
            COALESCE(SUM(b.total_amount), 0) AS booking_value
         FROM bookings b
         INNER JOIN resources r ON r.resource_id = b.resource_id
         WHERE ${scope}
         GROUP BY b.status
         ORDER BY b.status`,
        params
    );

    const [monthlyRows] = await db.query(
        `SELECT
            DATE_FORMAT(b.created_at, '%Y-%m') AS month,
            COUNT(*) AS total_bookings,
            COALESCE(SUM(b.status = 'COMPLETED'), 0) AS completed_bookings,
            COALESCE(SUM(b.status = 'CANCELLED'), 0) AS cancelled_bookings
         FROM bookings b
         INNER JOIN resources r ON r.resource_id = b.resource_id
         WHERE b.created_at >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
           AND ${scope}
         GROUP BY DATE_FORMAT(b.created_at, '%Y-%m')
         ORDER BY month ASC`,
        params
    );

    return {
        summary,
        status_breakdown: normalizeRows(statusRows, [
            "booking_count",
            "booking_value"
        ]),
        monthly_trend: normalizeRows(monthlyRows, [
            "total_bookings",
            "completed_bookings",
            "cancelled_bookings"
        ])
    };
};

const getQueueReport = async (user) => {
    const isOwner = user.role === "OWNER";
    const scope = isOwner ? "r.owner_id = ?" : "1 = 1";
    const params = isOwner ? [user.user_id] : [];

    const [summaryRows] = await db.query(
        `SELECT
            COUNT(q.queue_id) AS total_entries,
            COALESCE(SUM(q.status = 'WAITING'), 0) AS waiting,
            COALESCE(SUM(q.status = 'RESERVED'), 0) AS reserved,
            COALESCE(SUM(q.status = 'CANCELLED'), 0) AS cancelled,
            COALESCE(SUM(q.status = 'EXPIRED'), 0) AS expired,
            ROUND(AVG(
                CASE WHEN q.status = 'WAITING'
                THEN q.queue_position ELSE NULL END
            ), 2) AS average_waiting_position
         FROM resources r
         LEFT JOIN reservation_queue q
            ON q.resource_id = r.resource_id
         WHERE ${scope}`,
        params
    );

    const summary = {
        ...summaryRows[0],
        total_entries: toNumber(summaryRows[0].total_entries),
        waiting: toNumber(summaryRows[0].waiting),
        reserved: toNumber(summaryRows[0].reserved),
        cancelled: toNumber(summaryRows[0].cancelled),
        expired: toNumber(summaryRows[0].expired),
        average_waiting_position:
            summaryRows[0].average_waiting_position === null
                ? null
                : Number(summaryRows[0].average_waiting_position)
    };

    const [statusRows] = await db.query(
        `SELECT
            q.status,
            COUNT(*) AS entry_count
         FROM reservation_queue q
         INNER JOIN resources r ON r.resource_id = q.resource_id
         WHERE ${scope}
         GROUP BY q.status
         ORDER BY q.status`,
        params
    );

    const [resourceRows] = await db.query(
        `SELECT
            r.resource_id,
            r.name AS resource_name,
            COUNT(q.queue_id) AS total_entries,
            COALESCE(SUM(q.status = 'WAITING'), 0) AS waiting,
            COALESCE(SUM(q.status = 'RESERVED'), 0) AS reserved,
            COALESCE(SUM(q.status = 'CANCELLED'), 0) AS cancelled,
            COALESCE(SUM(q.status = 'EXPIRED'), 0) AS expired
         FROM resources r
         LEFT JOIN reservation_queue q
            ON q.resource_id = r.resource_id
         WHERE ${scope}
         GROUP BY r.resource_id, r.name
         ORDER BY waiting DESC, r.name ASC`,
        params
    );

    return {
        summary,
        status_breakdown: normalizeRows(statusRows, ["entry_count"]),
        resources: normalizeRows(resourceRows, [
            "total_entries",
            "waiting",
            "reserved",
            "cancelled",
            "expired"
        ])
    };
};

// This report is ADMIN-only; enforce that again at service level.
const getPaymentReport = async (user) => {
    if (user.role !== "ADMIN") {
        throw new Error("REPORT_ACCESS_DENIED");
    }

    const [summaryRows] = await db.query(
        `SELECT
            COUNT(*) AS total_payments,
            COALESCE(SUM(status = 'PENDING'), 0) AS pending_count,
            COALESCE(SUM(status = 'PAID'), 0) AS paid_count,
            COALESCE(SUM(status = 'FAILED'), 0) AS failed_count,
            COALESCE(SUM(status = 'REFUNDED'), 0) AS refunded_count,
            COALESCE(SUM(
                CASE WHEN status = 'PAID'
                THEN amount ELSE 0 END
            ), 0) AS paid_amount,
            COALESCE(SUM(
                CASE WHEN status = 'PENDING'
                THEN amount ELSE 0 END
            ), 0) AS pending_amount,
            COALESCE(SUM(
                CASE WHEN status = 'REFUNDED'
                THEN amount ELSE 0 END
            ), 0) AS refunded_amount
         FROM payments`
    );

    const summary = normalizeRows(summaryRows, [
        "total_payments",
        "pending_count",
        "paid_count",
        "failed_count",
        "refunded_count",
        "paid_amount",
        "pending_amount",
        "refunded_amount"
    ])[0];

    const [statusRows] = await db.query(
        `SELECT
            status,
            COUNT(*) AS payment_count,
            COALESCE(SUM(amount), 0) AS amount_total
         FROM payments
         GROUP BY status
         ORDER BY status`
    );

    const [monthlyRows] = await db.query(
        `SELECT
            DATE_FORMAT(paid_at, '%Y-%m') AS month,
            COUNT(*) AS paid_transactions,
            COALESCE(SUM(amount), 0) AS paid_amount
         FROM payments
         WHERE status = 'PAID'
           AND paid_at IS NOT NULL
           AND paid_at >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
         GROUP BY DATE_FORMAT(paid_at, '%Y-%m')
         ORDER BY month ASC`
    );

    return {
        summary,
        status_breakdown: normalizeRows(statusRows, [
            "payment_count",
            "amount_total"
        ]),
        monthly_paid_trend: normalizeRows(monthlyRows, [
            "paid_transactions",
            "paid_amount"
        ])
    };
};

module.exports = {
    getResourceReport,
    getBookingReport,
    getQueueReport,
    getPaymentReport
};
