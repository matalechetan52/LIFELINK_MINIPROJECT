const db = require("../utils/db");

// Join a resource reservation queue
const joinQueue = async (
    resourceId,
    userId,
    requestedStart,
    requestedEnd
) => {

    // 1. Check whether resource exists
    const [resources] = await db.query(
        `SELECT
            resource_id,
            status
         FROM resources
         WHERE resource_id = ?`,
        [resourceId]
    );

    if (resources.length === 0) {
        throw new Error("RESOURCE_NOT_FOUND");
    }

    // 2. Check whether user exists
    const [users] = await db.query(
        `SELECT user_id
         FROM users
         WHERE user_id = ?`,
        [userId]
    );

    if (users.length === 0) {
        throw new Error("USER_NOT_FOUND");
    }

    // 3. Validate requested time
    const start = new Date(requestedStart);
    const end = new Date(requestedEnd);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("INVALID_DATE");
    }

    if (end <= start) {
        throw new Error("INVALID_TIME_RANGE");
    }

    // 4. Check whether the user is already waiting
    //    for the same resource and requested period
    const [existingQueue] = await db.query(
        `SELECT queue_id
         FROM reservation_queue
         WHERE resource_id = ?
           AND user_id = ?
           AND requested_start = ?
           AND requested_end = ?
           AND status = 'WAITING'`,
        [
            resourceId,
            userId,
            requestedStart,
            requestedEnd
        ]
    );

    if (existingQueue.length > 0) {
        throw new Error("ALREADY_IN_QUEUE");
    }

    // 5. Find the next queue position
    const [positionResult] = await db.query(
        `SELECT
            COALESCE(MAX(queue_position), 0) + 1 AS next_position
         FROM reservation_queue
         WHERE resource_id = ?
           AND status = 'WAITING'`,
        [resourceId]
    );

    const queuePosition =
        positionResult[0].next_position;

    // 6. Create queue entry
    const [result] = await db.query(
        `INSERT INTO reservation_queue
        (
            resource_id,
            user_id,
            requested_start,
            requested_end,
            priority_score,
            queue_position,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, 'WAITING')`,
        [
            resourceId,
            userId,
            requestedStart,
            requestedEnd,
            0,
            queuePosition
        ]
    );

    // 7. Return created queue entry
    return {
        queue_id: result.insertId,
        resource_id: resourceId,
        user_id: userId,
        requested_start: requestedStart,
        requested_end: requestedEnd,
        priority_score: 0,
        queue_position: queuePosition,
        status: "WAITING"
    };
};

module.exports = {
    joinQueue
}; 