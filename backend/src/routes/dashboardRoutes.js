
const express = require("express");
const router = express.Router();

const dashboardController =
    require("../controllers/dashboardController");

const authenticateToken =
    require("../middleware/authMiddleware");

// Role-specific dashboard
router.get(
    "/dashboard",
    authenticateToken,
    dashboardController.getDashboard
);

module.exports = router;
