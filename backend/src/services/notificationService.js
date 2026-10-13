
const db = require("../utils/db");

// Get all notifications for a specific user
const getNotifications = async (userId) => {
    const [rows] = await db.query(
        `SELECT
            notification_id,
            user_id,
            type,
            message,
            is_read,
            created_at
         FROM notifications
         WHERE user_id = ?
         ORDER BY created_at DESC, notification_id DESC`,
        [userId]
    );

    return rows;
};

// Create a notification for a user
const createNotification = async (userId, type, message) => {
    const [result] = await db.query(
        `INSERT INTO notifications
            (user_id, type, message)
         VALUES (?, ?, ?)`,
        [userId, type, message]
    );

    return {
        notification_id: result.insertId,
        user_id: Number(userId),
        type,
        message,
        is_read: 0
    };
};

// Mark a user's notification as read
const markNotificationAsRead = async (
    notificationId,
    userId
) => {
    const [rows] = await db.query(
        `SELECT notification_id, is_read
         FROM notifications
         WHERE notification_id = ?
           AND user_id = ?`,
        [notificationId, userId]
    );

    if (rows.length === 0) {
        throw new Error("NOTIFICATION_NOT_FOUND");
    }

    if (Number(rows[0].is_read) === 1) {
        return {
            notification_id: Number(notificationId),
            is_read: 1,
            already_read: true
        };
    }

    await db.query(
        `UPDATE notifications
         SET is_read = 1
         WHERE notification_id = ?
           AND user_id = ?`,
        [notificationId, userId]
    );

    return {
        notification_id: Number(notificationId),
        is_read: 1,
        already_read: false
    };
};

module.exports = {
    getNotifications,
    createNotification,
    markNotificationAsRead
};
