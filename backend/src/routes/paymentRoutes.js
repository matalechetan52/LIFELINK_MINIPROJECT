
const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");
const authenticateToken = require("../middleware/authMiddleware");

// All payment endpoints require authentication
router.get(
    "/payments",
    authenticateToken,
    paymentController.getUserPayments
);

router.post(
    "/payments",
    authenticateToken,
    paymentController.createPayment
);

router.get(
    "/payments/:id",
    authenticateToken,
    paymentController.getPaymentById
);

router.post(
    "/payments/:id/confirm",
    authenticateToken,
    paymentController.confirmPayment
);

module.exports = router;
