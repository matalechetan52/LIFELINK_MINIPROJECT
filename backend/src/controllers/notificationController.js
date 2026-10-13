
const notificationService = require("../services/notificationService");

// GET /api/notifications
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const notifications =
            await notificationService.getNotifications(userId);

        return res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        console.error("Get notifications error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve notifications"
        });
    }
};

// POST /api/notifications
const createNotification = async (req, res) => {
    try {
        const { user_id, type, message } = req.body;

        if (
            user_id === undefined ||
            !Number.isInteger(Number(user_id)) ||
            Number(user_id) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid user_id is required"
            });
        }

        if (
            typeof type !== "string" ||
            !type.trim() ||
            type.trim().length > 50
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid type is required (maximum 50 characters)"
            });
        }

        if (
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "A non-empty message is required"
            });
        }

        const notification =
            await notificationService.createNotification(
                Number(user_id),
                type.trim(),
                message.trim()
            );

        return res.status(201).json({
            success: true,
            message: "Notification created successfully",
            data: notification
        });
    } catch (error) {
        console.error("Create notification error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to create notification"
        });
    }
};

// PATCH /api/notifications/:id/read
const markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = Number(req.params.id);

        if (
            !Number.isInteger(notificationId) ||
            notificationId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID"
            });
        }

        const result =
            await notificationService.markNotificationAsRead(
                notificationId,
                req.user.user_id
            );

        return res.status(200).json({
            success: true,
            message: result.already_read
                ? "Notification was already read"
                : "Notification marked as read",
            data: result
        });
    } catch (error) {
        if (error.message === "NOTIFICATION_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        console.error("Mark notification read error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to update notification"
        });
    }
};

module.exports = {
    getNotifications,
    createNotification,
    markNotificationAsRead
};
