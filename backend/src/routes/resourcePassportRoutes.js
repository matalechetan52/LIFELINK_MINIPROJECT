
const express = require("express");
const router = express.Router();

const resourcePassportController =
    require("../controllers/resourcePassportController");

const authenticateToken =
    require("../middleware/authMiddleware");

// Resource lifecycle history
router.get(
    "/resources/:resourceId/history",
    authenticateToken,
    resourcePassportController.getResourceHistory
);

// Consolidated Resource Passport
router.get(
    "/resources/:resourceId/passport",
    authenticateToken,
    resourcePassportController.getResourcePassport
);

// Resource booking history
router.get(
    "/resources/:resourceId/passport/bookings",
    authenticateToken,
    resourcePassportController.getPassportBookings
);

// Resource maintenance history
router.get(
    "/resources/:resourceId/passport/maintenance",
    authenticateToken,
    resourcePassportController.getPassportMaintenance
);

// Resource review history
router.get(
    "/resources/:resourceId/passport/reviews",
    authenticateToken,
    resourcePassportController.getPassportReviews
);

module.exports = router;
