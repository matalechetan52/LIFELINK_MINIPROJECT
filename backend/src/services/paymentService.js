
const db = require("../utils/db");
const crypto = require("crypto");

// Create a payment for a booking
const createPayment = async (
    bookingId,
    userId,
    amount,
    paymentMethod
) => {
    const [bookingRows] = await db.query(
        `SELECT booking_id, user_id, status, total_amount
         FROM bookings
         WHERE booking_id = ?`,
        [bookingId]
    );

    if (bookingRows.length === 0) {
        throw new Error("BOOKING_NOT_FOUND");
    }

    const booking = bookingRows[0];

    if (Number(booking.user_id) !== Number(userId)) {
        throw new Error("BOOKING_ACCESS_DENIED");
    }

    if (booking.status === "CANCELLED") {
        throw new Error("BOOKING_NOT_PAYABLE");
    }

    if (Number(amount) !== Number(booking.total_amount)) {
        throw new Error("INVALID_PAYMENT_AMOUNT");
    }

    const [existingPayments] = await db.query(
        `SELECT payment_id, status
         FROM payments
         WHERE booking_id = ?
           AND status IN ('PENDING', 'PAID')
         LIMIT 1`,
        [bookingId]
    );

    if (existingPayments.length > 0) {
        throw new Error("PAYMENT_ALREADY_EXISTS");
    }

    const [result] = await db.query(
        `INSERT INTO payments
            (booking_id, amount, payment_method, status)
         VALUES (?, ?, ?, 'PENDING')`,
        [bookingId, amount, paymentMethod]
    );

    return {
        payment_id: result.insertId,
        booking_id: Number(bookingId),
        amount: Number(amount),
        payment_method: paymentMethod,
        status: "PENDING"
    };
};

// Get payments belonging to the logged-in user
const getUserPayments = async (userId) => {
    const [paymentRows] = await db.query(
        `SELECT
            p.payment_id,
            p.booking_id,
            p.amount,
            p.payment_method,
            p.transaction_id,
            p.status,
            p.paid_at
         FROM payments p
         INNER JOIN bookings b
            ON p.booking_id = b.booking_id
         WHERE b.user_id = ?
         ORDER BY p.payment_id DESC`,
        [userId]
    );

    return paymentRows;
};

// Get one payment, only if it belongs to the logged-in user
const getPaymentById = async (paymentId, userId) => {
    const [paymentRows] = await db.query(
        `SELECT
            p.payment_id,
            p.booking_id,
            p.amount,
            p.payment_method,
            p.transaction_id,
            p.status,
            p.paid_at
         FROM payments p
         INNER JOIN bookings b
            ON p.booking_id = b.booking_id
         WHERE p.payment_id = ?
           AND b.user_id = ?
         LIMIT 1`,
        [paymentId, userId]
    );

    if (paymentRows.length === 0) {
        throw new Error("PAYMENT_NOT_FOUND");
    }

    return paymentRows[0];
};

// Confirm a pending payment (MVP development simulation)
const confirmPayment = async (paymentId, userId) => {
    try {
        await db.beginTransaction();

        const [paymentRows] = await db.query(
            `SELECT
                p.payment_id,
                p.booking_id,
                p.amount,
                p.payment_method,
                p.transaction_id,
                p.status
             FROM payments p
             INNER JOIN bookings b
                ON p.booking_id = b.booking_id
             WHERE p.payment_id = ?
               AND b.user_id = ?
             FOR UPDATE`,
            [paymentId, userId]
        );

        if (paymentRows.length === 0) {
            throw new Error("PAYMENT_NOT_FOUND");
        }

        const payment = paymentRows[0];

        if (payment.status === "PAID") {
            throw new Error("PAYMENT_ALREADY_CONFIRMED");
        }

        if (payment.status !== "PENDING") {
            throw new Error("PAYMENT_NOT_CONFIRMABLE");
        }

        const transactionId = `DEV-${crypto.randomUUID()}`;

        await db.query(
            `UPDATE payments
             SET status = 'PAID',
                 transaction_id = ?,
                 paid_at = NOW()
             WHERE payment_id = ?`,
            [transactionId, paymentId]
        );

        await db.commit();

        return {
            payment_id: Number(payment.payment_id),
            booking_id: Number(payment.booking_id),
            amount: Number(payment.amount),
            payment_method: payment.payment_method,
            transaction_id: transactionId,
            status: "PAID"
        };
    } catch (error) {
        await db.rollback();
        throw error;
    }
};


module.exports = {
    createPayment,
    getUserPayments,
    getPaymentById,
    confirmPayment
};
