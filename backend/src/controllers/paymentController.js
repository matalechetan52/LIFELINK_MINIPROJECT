
const paymentService = require("../services/paymentService");

// Map known service errors to HTTP responses
const handlePaymentError = (res, error) => {
    const errorResponses = {
        BOOKING_NOT_FOUND: [404, "Booking not found"],
        BOOKING_ACCESS_DENIED: [403, "You cannot pay for this booking"],
        BOOKING_NOT_PAYABLE: [400, "Cancelled bookings cannot be paid"],
        INVALID_PAYMENT_AMOUNT: [400, "Payment amount must match the booking amount"],
        PAYMENT_ALREADY_EXISTS: [409, "A pending or completed payment already exists for this booking"],
        PAYMENT_NOT_FOUND: [404, "Payment not found"],
        PAYMENT_ALREADY_CONFIRMED: [409, "Payment has already been confirmed"],
        PAYMENT_NOT_CONFIRMABLE: [409, "Only pending payments can be confirmed"]
    };

    const response = errorResponses[error.message];

    if (response) {
        return res.status(response[0]).json({
            success: false,
            message: response[1]
        });
    }

    console.error("Payment error:", error.message);

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
};

// POST /api/payments
const createPayment = async (req, res) => {
    try {
        const { booking_id, amount, payment_method } = req.body;

        if (
            booking_id === undefined ||
            !Number.isInteger(Number(booking_id)) ||
            Number(booking_id) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid booking_id is required"
            });
        }

        if (
            amount === undefined ||
            amount === null ||
            amount === "" ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid positive amount is required"
            });
        }

        if (
            typeof payment_method !== "string" ||
            !payment_method.trim() ||
            payment_method.trim().length > 50
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid payment_method is required"
            });
        }

        const payment = await paymentService.createPayment(
            Number(booking_id),
            req.user.user_id,
            Number(amount),
            payment_method.trim().toUpperCase()
        );

        return res.status(201).json({
            success: true,
            message: "Payment initiated successfully",
            data: payment
        });
    } catch (error) {
        return handlePaymentError(res, error);
    }
};

// GET /api/payments
const getUserPayments = async (req, res) => {
    try {
        const payments = await paymentService.getUserPayments(
            req.user.user_id
        );

        return res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        return handlePaymentError(res, error);
    }
};

// GET /api/payments/:id
const getPaymentById = async (req, res) => {
    try {
        const paymentId = Number(req.params.id);

        if (!Number.isInteger(paymentId) || paymentId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment ID"
            });
        }

        const payment = await paymentService.getPaymentById(
            paymentId,
            req.user.user_id
        );

        return res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        return handlePaymentError(res, error);
    }
};

// POST /api/payments/:id/confirm
const confirmPayment = async (req, res) => {
    try {
        const paymentId = Number(req.params.id);

        if (!Number.isInteger(paymentId) || paymentId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment ID"
            });
        }

        const payment = await paymentService.confirmPayment(
            paymentId,
            req.user.user_id
        );

        return res.status(200).json({
            success: true,
            message: "Payment confirmed successfully (MVP simulation)",
            data: payment
        });
    } catch (error) {
        return handlePaymentError(res, error);
    }
};

module.exports = {
    createPayment,
    getUserPayments,
    getPaymentById,
    confirmPayment
};
