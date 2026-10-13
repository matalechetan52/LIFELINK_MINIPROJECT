
const express = require("express");
const router = express.Router();

const reportController =
    require("../controllers/reportController");

const authenticateToken =
    require("../middleware/authMiddleware");

const authorizeRole =
    require("../middleware/roleMiddleware");

// OWNER sees reports for owned resources; ADMIN sees all resources.
router.get(
    "/reports/resources",
    authenticateToken,
    authorizeRole("OWNER", "ADMIN"),
    reportController.getResourceReport
);

router.get(
    "/reports/bookings",
    authenticateToken,
    authorizeRole("OWNER", "ADMIN"),
    reportController.getBookingReport
);

router.get(
    "/reports/queue",
    authenticateToken,
    authorizeRole("OWNER", "ADMIN"),
    reportController.getQueueReport
);

// Platform-wide payment analytics are ADMIN-only.
router.get(
    "/reports/payments",
    authenticateToken,
    authorizeRole("ADMIN"),
    reportController.getPaymentReport
);

module.exports = router;
