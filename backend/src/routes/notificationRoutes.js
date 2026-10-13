
const express = require("express");
const router = express.Router();

const notificationController =
    require("../controllers/notificationController");

const authenticateToken =
    require("../middleware/authMiddleware");

const authorizeRole =
    require("../middleware/roleMiddleware");

// Get notifications for the authenticated user
router.get(
    "/notifications",
    authenticateToken,
    notificationController.getNotifications
);

// Create notifications — ADMIN only
router.post(
    "/notifications",
    authenticateToken,
    authorizeRole("ADMIN"),
    notificationController.createNotification
);

// Mark the authenticated user's notification as read
router.patch(
    "/notifications/:id/read",
    authenticateToken,
    notificationController.markNotificationAsRead
);

module.exports = router;
