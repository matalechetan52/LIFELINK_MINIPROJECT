const db = require("../utils/db");

//add booking if there is no active booking or maintenance conflict.
const createBooking = async (
    resourceId,
    userId,
    startTime,
    endTime
) => {

    // 1. Check resource
    const [resourceRows] = await db.query(
        `SELECT
            resource_id,
            owner_id,
            name,
            price_per_hour,
            status
         FROM resources
         WHERE resource_id = ?`,
        [resourceId]
    );

    if (resourceRows.length === 0) {
        return {
            error: "RESOURCE_NOT_FOUND"
        };
    }

    const resource = resourceRows[0];

    // 2. Check user
    const [userRows] = await db.query(
        `SELECT
            user_id,
            name,
            role
         FROM users
         WHERE user_id = ?`,
        [userId]
    );

    if (userRows.length === 0) {
        return {
            error: "USER_NOT_FOUND"
        };
    }

    // 3. Resource must be available
    if (resource.status !== "AVAILABLE") {
        return {
            error: "RESOURCE_UNAVAILABLE"
        };
    }

    // 4. Check booking conflicts
    const [bookingRows] = await db.query(
        `SELECT
            booking_id,
            start_time,
            end_time,
            status
         FROM bookings
         WHERE resource_id = ?
           AND status NOT IN ('CANCELLED', 'COMPLETED')
           AND start_time < ?
           AND end_time > ?
         LIMIT 1`,
        [resourceId, endTime, startTime]
    );

    if (bookingRows.length > 0) {
        return {
            error: "BOOKING_CONFLICT",
            conflict: bookingRows[0]
        };
    }

    // 5. Check maintenance conflicts
    const [maintenanceRows] = await db.query(
        `SELECT
            maintenance_id,
            start_date,
            end_date,
            reason,
            status
         FROM maintenance
         WHERE resource_id = ?
           AND status IN ('SCHEDULED', 'ONGOING')
           AND start_date < ?
           AND end_date > ?
         LIMIT 1`,
        [resourceId, endTime, startTime]
    );

    if (maintenanceRows.length > 0) {
        return {
            error: "MAINTENANCE_CONFLICT",
            conflict: maintenanceRows[0]
        };
    }

    // 6. Calculate duration in hours
    const start = new Date(startTime);
    const end = new Date(endTime);

    const durationInHours =
        (end.getTime() - start.getTime()) /
        (1000 * 60 * 60);

    // 7. Calculate total amount
    const totalAmount =
        durationInHours * Number(resource.price_per_hour);

    // 8. Create booking
    const [result] = await db.query(
        `INSERT INTO bookings
            (
                resource_id,
                user_id,
                start_time,
                end_time,
                status,
                total_amount
            )
         VALUES (?, ?, ?, ?, 'PENDING', ?)`,
        [
            resourceId,
            userId,
            startTime,
            endTime,
            totalAmount
        ]
    );

    // 9. Return created booking
    return {
        booking_id: result.insertId,
        resource_id: resourceId,
        user_id: userId,
        start_time: startTime,
        end_time: endTime,
        status: "PENDING",
        total_amount: totalAmount
    };
};

//getAllBookings.
const getAllBookings = async () => {

    const [bookingRows] = await db.query(
        `SELECT
            b.booking_id,
            b.resource_id,
            b.user_id,
            b.start_time,
            b.end_time,
            b.status,
            b.total_amount,
            r.name AS resource_name,
            u.name AS user_name
         FROM bookings b
         INNER JOIN resources r
            ON b.resource_id = r.resource_id
         INNER JOIN users u
            ON b.user_id = u.user_id
         ORDER BY b.start_time DESC`
    );

    return bookingRows;
};

// Get booking by ID
const getBookingById = async (bookingId) => {

    const [rows] = await db.query(
    `SELECT
        b.booking_id,
        b.resource_id,
        b.user_id,
        b.start_time,
        b.end_time,
        b.status,
        b.total_amount,
        b.created_at,
        r.name AS resource_name,
        u.name AS user_name
    FROM bookings b
    INNER JOIN resources r
        ON b.resource_id = r.resource_id
    INNER JOIN users u
        ON b.user_id = u.user_id
    WHERE b.booking_id = ?`,
    [bookingId]
);

    if (rows.length === 0) {
        throw new Error("BOOKING_NOT_FOUND");
    }

    return rows[0];
};

// Cancel booking
const cancelBooking = async (bookingId) => {

    const [rows] = await db.query(
        `SELECT
            booking_id,
            status
        FROM bookings
        WHERE booking_id = ?`,
        [bookingId]
    );

    if (rows.length === 0) {
        throw new Error("BOOKING_NOT_FOUND");
    }

    const booking = rows[0];

    if (booking.status === "CANCELLED") {
        throw new Error("BOOKING_ALREADY_CANCELLED");
    }

    if (booking.status === "COMPLETED") {
        throw new Error("BOOKING_ALREADY_COMPLETED");
    }

    if (booking.status === "ACTIVE") {
        throw new Error("ACTIVE_BOOKING_CANNOT_BE_CANCELLED");
    }

    await db.query(
        `UPDATE bookings
         SET status = 'CANCELLED'
         WHERE booking_id = ?`,
        [bookingId]
    );

    return {
        booking_id: bookingId,
        status: "CANCELLED"
    };
};

// Update booking
const updateBooking = async (bookingId, startTime, endTime, status) => {

    const [rows] = await db.query(
        `SELECT
            booking_id,
            resource_id,
            user_id,
            start_time,
            end_time,
            status
        FROM bookings
        WHERE booking_id = ?`,
        [bookingId]
    );

    if (rows.length === 0) {
        throw new Error("BOOKING_NOT_FOUND");
    }

    const booking = rows[0];

    // Completed or cancelled bookings cannot be updated
    if (
        booking.status === "COMPLETED" ||
        booking.status === "CANCELLED"
    ) {
        throw new Error("BOOKING_CANNOT_BE_UPDATED");
    }

    // Validate status if provided
    const allowedStatuses = [
        "PENDING",
        "CONFIRMED",
        "ACTIVE",
        "COMPLETED",
        "CANCELLED"
    ];

    if (status && !allowedStatuses.includes(status)) {
        throw new Error("INVALID_BOOKING_STATUS");
    }

    // If time is being changed, validate availability
    if (startTime || endTime) {

        const newStartTime = startTime || booking.start_time;
        const newEndTime = endTime || booking.end_time;

        if (newEndTime <= newStartTime) {
            throw new Error("INVALID_BOOKING_TIME");
        }

        // Check booking conflicts
        const [bookingConflicts] = await db.query(
            `SELECT booking_id
             FROM bookings
             WHERE resource_id = ?
             AND booking_id != ?
             AND status NOT IN ('CANCELLED', 'COMPLETED')
             AND start_time < ?
             AND end_time > ?
             LIMIT 1`,
            [
                booking.resource_id,
                bookingId,
                newEndTime,
                newStartTime
            ]
        );

        if (bookingConflicts.length > 0) {
            throw new Error("BOOKING_CONFLICT");
        }

        // Check maintenance conflicts
        const [maintenanceConflicts] = await db.query(
            `SELECT maintenance_id
             FROM maintenance
             WHERE resource_id = ?
             AND status IN ('SCHEDULED', 'ONGOING')
             AND start_date < ?
             AND end_date > ?
             LIMIT 1`,
            [
                booking.resource_id,
                newEndTime,
                newStartTime
            ]
        );

        if (maintenanceConflicts.length > 0) {
            throw new Error("MAINTENANCE_CONFLICT");
        }
    }

    const fields = [];
    const values = [];

    if (startTime) {
        fields.push("start_time = ?");
        values.push(startTime);
    }

    if (endTime) {
        fields.push("end_time = ?");
        values.push(endTime);
    }

    if (status) {
        fields.push("status = ?");
        values.push(status);
    }

    if (fields.length === 0) {
        throw new Error("NO_UPDATE_FIELDS");
    }

    values.push(bookingId);

    await db.query(
        `UPDATE bookings
         SET ${fields.join(", ")}
         WHERE booking_id = ?`,
        values
    );

    const [updatedRows] = await db.query(
        `SELECT
            booking_id,
            resource_id,
            user_id,
            start_time,
            end_time,
            status,
            total_amount,
            created_at
        FROM bookings
        WHERE booking_id = ?`,
        [bookingId]
    );

    return updatedRows[0];
};

// Get bookings for a specific resource
const getResourceBookings = async (resourceId) => {

    // Check whether resource exists
    const [resourceRows] = await db.query(
        `SELECT resource_id
         FROM resources
         WHERE resource_id = ?`,
        [resourceId]
    );

    if (resourceRows.length === 0) {
        throw new Error("RESOURCE_NOT_FOUND");
    }

    const [rows] = await db.query(
        `SELECT
            b.booking_id,
            b.resource_id,
            b.user_id,
            b.start_time,
            b.end_time,
            b.status,
            b.total_amount,
            b.created_at,
            u.name AS user_name
        FROM bookings b
        INNER JOIN users u
            ON b.user_id = u.user_id
        WHERE b.resource_id = ?
        ORDER BY b.start_time DESC`,
        [resourceId]
    );

    return rows;
};

module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    cancelBooking,
    updateBooking,
    getResourceBookings,
};