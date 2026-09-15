const db = require("../utils/db");
const availabilityService =
    require("./availabilityService");

// Calculate priority score for a queue entry
const calculatePriorityScore = (
    requestedStart,
    joinedAt,
    scheduleFit
) => {

    const now = new Date();

    const start = new Date(requestedStart);
    const joined = new Date(joinedAt);

    // 1. Request Urgency: 0–40
    const hoursUntilStart =
        (start - now) / (1000 * 60 * 60);

    let urgencyScore;

    if (hoursUntilStart <= 24) {
        urgencyScore = 40;
    } else if (hoursUntilStart <= 48) {
        urgencyScore = 30;
    } else if (hoursUntilStart <= 168) {
        urgencyScore = 20;
    } else {
        urgencyScore = 10;
    }

    // 2. Waiting Time: 0–30
    const waitingHours =
        (now - joined) / (1000 * 60 * 60);

    let waitingScore;

    if (waitingHours < 1) {
        waitingScore = 5;
    } else if (waitingHours < 6) {
        waitingScore = 10;
    } else if (waitingHours < 24) {
        waitingScore = 20;
    } else {
        waitingScore = 30;
    }

    // 3. Schedule Fit: 0–30
    const fitScore = scheduleFit;

    // Final score: 0–100
    return urgencyScore + waitingScore + fitScore;
};


// Calculate schedule fit based on predicted availability
const calculateScheduleFit = (
    requestedStart,
    nextAvailableStart
) => {

    const requestedTime =
        new Date(requestedStart);

    const availableTime =
        new Date(nextAvailableStart);

    const delayHours =
        (availableTime - requestedTime) /
        (1000 * 60 * 60);

    // Exact or earlier availability
    if (delayHours <= 0) {
        return 30;
    }

    // Resource becomes available within 24 hours
    if (delayHours <= 24) {
        return 20;
    }

    // Resource becomes available within 7 days
    if (delayHours <= 168) {
        return 10;
    }

    // Resource becomes available after 7 days
    return 0;
};

// Recalculate queue positions based on priority
const recalculateQueuePositions = async (resourceId) => {

    // Get all waiting entries for this resource
    // Higher priority comes first.
    // If priority is equal, earlier joined entry comes first.
    const [queueRows] = await db.query(
        `SELECT
            queue_id
         FROM reservation_queue
         WHERE resource_id = ?
           AND status = 'WAITING'
         ORDER BY
            priority_score DESC,
            joined_at ASC,
            queue_id ASC`,
        [resourceId]
    );

    // Assign positions starting from 1
    for (let i = 0; i < queueRows.length; i++) {

        await db.query(
            `UPDATE reservation_queue
             SET queue_position = ?
             WHERE queue_id = ?`,
            [
                i + 1,
                queueRows[i].queue_id
            ]
        );
    }
};

// Mark waiting queue entries as expired
// when their requested period has completely passed.
const expireOldQueueEntries = async (resourceId) => {

    await db.query(
        `UPDATE reservation_queue
         SET status = 'EXPIRED'
         WHERE resource_id = ?
           AND status = 'WAITING'
           AND requested_end < NOW()`,
        [resourceId]
    );
};

// Recalculate priority scores for all waiting entries
const recalculatePriorityScores = async (resourceId) => {

    // Get all waiting queue entries for this resource
    const [queueRows] = await db.query(
        `SELECT
            queue_id,
            requested_start,
            requested_end,
            joined_at
         FROM reservation_queue
         WHERE resource_id = ?
           AND status = 'WAITING'`,
        [resourceId]
    );

    // Recalculate priority for each entry
    for (const queueEntry of queueRows) {

        const nextAvailable =
            await availabilityService.getNextAvailableTime(
                resourceId,
                queueEntry.requested_start,
                queueEntry.requested_end
            );

        let scheduleFit = 0;

        if (
            nextAvailable &&
            nextAvailable.available &&
            nextAvailable.next_available_start
        ) {
            scheduleFit =
                calculateScheduleFit(
                    queueEntry.requested_start,
                    nextAvailable.next_available_start
                );
        }

        const priorityScore =
            calculatePriorityScore(
                queueEntry.requested_start,
                queueEntry.joined_at,
                scheduleFit
            );

        await db.query(
            `UPDATE reservation_queue
             SET priority_score = ?
             WHERE queue_id = ?`,
            [
                priorityScore,
                queueEntry.queue_id
            ]
        );
    }
};

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

    const resource = resources[0];

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

    if (
        isNaN(start.getTime()) ||
        isNaN(end.getTime())
    ) {
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

    // 5. Check requested-period availability
    const availability =
        await availabilityService.checkResourceAvailability(
            resourceId,
            requestedStart,
            requestedEnd
        );

    if (availability === null) {
        throw new Error("RESOURCE_NOT_FOUND");
    }

    // Queue is intended for unavailable/conflicting periods
    if (availability.available) {
        throw new Error("RESOURCE_AVAILABLE");
    }

    // 6. Calculate the next period in which
    //    the resource can accommodate this request
    const nextAvailable =
        await availabilityService.getNextAvailableTime(
            resourceId,
            requestedStart,
            requestedEnd
        );

    if (
        !nextAvailable ||
        !nextAvailable.available ||
        !nextAvailable.next_available_start
    ) {
        throw new Error("NO_AVAILABLE_PERIOD");
    }

    // 7. Calculate schedule fit
    const scheduleFit =
        calculateScheduleFit(
            requestedStart,
            nextAvailable.next_available_start
        );

    // 8. Record when the user joined the queue
    const joinedAt = new Date();

    // 9. Calculate priority score
    const priorityScore =
        calculatePriorityScore(
            requestedStart,
            joinedAt,
            scheduleFit
        );

    // 10. Find the next queue position
    const [positionResult] = await db.query(
        `SELECT
            COALESCE(MAX(queue_position), 0) + 1
            AS next_position
         FROM reservation_queue
         WHERE resource_id = ?
           AND status = 'WAITING'`,
        [resourceId]
    );

    const queuePosition =
        positionResult[0].next_position;

    // 11. Create queue entry
    const [result] = await db.query(
        `INSERT INTO reservation_queue
        (
            resource_id,
            user_id,
            requested_start,
            requested_end,
            priority_score,
            queue_position,
            status,
            joined_at
        )
        VALUES (?, ?, ?, ?, ?, ?, 'WAITING', ?)`,
        [
            resourceId,
            userId,
            requestedStart,
            requestedEnd,
            priorityScore,
            queuePosition,
            joinedAt
        ]
    );
// Mark expired waiting entries
await expireOldQueueEntries(resourceId);

// Recalculate priority scores for all waiting entries
await recalculatePriorityScores(resourceId);

// Recalculate queue positions based on updated priorities
await recalculateQueuePositions(resourceId);

// 12. Get the final updated queue entry
const [updatedQueueRows] = await db.query(
    `SELECT
        queue_id,
        resource_id,
        user_id,
        requested_start,
        requested_end,
        priority_score,
        queue_position,
        status,
        joined_at
     FROM reservation_queue
     WHERE queue_id = ?`,
    [result.insertId]
);

const updatedQueueEntry = updatedQueueRows[0];

// 13. Return the final queue entry
return {
    ...updatedQueueEntry,
    predicted_available_start:
        nextAvailable.next_available_start,
    predicted_available_end:
        nextAvailable.next_available_end
};
};

// Get all reservation queue entries
const getAllQueues = async () => {

    const [queueRows] = await db.query(
        `SELECT
            q.queue_id,
            q.resource_id,
            q.user_id,
            q.requested_start,
            q.requested_end,
            q.priority_score,
            q.queue_position,
            q.status,
            q.joined_at,
            r.name AS resource_name,
            u.name AS user_name
         FROM reservation_queue q
         INNER JOIN resources r
            ON q.resource_id = r.resource_id
         INNER JOIN users u
            ON q.user_id = u.user_id
         ORDER BY
            q.resource_id ASC,
            CASE
                WHEN q.status = 'WAITING' THEN 1
                ELSE 2
            END,
            q.queue_position ASC,
            q.joined_at ASC`
    );

    return queueRows;
};

// Get reservation queue entry by ID
const getQueueById = async (queueId) => {

    const [queueRows] = await db.query(
        `SELECT
            q.queue_id,
            q.resource_id,
            q.user_id,
            q.requested_start,
            q.requested_end,
            q.priority_score,
            q.queue_position,
            q.status,
            q.joined_at,
            r.name AS resource_name,
            u.name AS user_name
         FROM reservation_queue q
         INNER JOIN resources r
            ON q.resource_id = r.resource_id
         INNER JOIN users u
            ON q.user_id = u.user_id
         WHERE q.queue_id = ?`,
        [queueId]
    );

    if (queueRows.length === 0) {
        throw new Error("QUEUE_NOT_FOUND");
    }

    return queueRows[0];
};

module.exports = {
    joinQueue,
    getAllQueues,
    getQueueById,
};