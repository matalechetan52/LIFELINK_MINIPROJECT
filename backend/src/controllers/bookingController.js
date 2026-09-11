const bookingService = require("../services/bookingService");

//createBooking if no active booking and no maintenance conflict.
const createBooking = async (req, res) => {
    try {
        const {
            resource_id,
            user_id,
            start_time,
            end_time
        } = req.body;

        // 1. Validate required fields
        if (
            !resource_id ||
            !user_id ||
            !start_time ||
            !end_time
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "resource_id, user_id, start_time and end_time are required"
            });
        }

        // 2. Validate IDs
        const resourceId = Number(resource_id);
        const userId = Number(user_id);

        if (
            !Number.isInteger(resourceId) ||
            resourceId <= 0 ||
            !Number.isInteger(userId) ||
            userId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource_id or user_id"
            });
        }

        // 3. Validate dates
        const startDate = new Date(start_time);
        const endDate = new Date(end_time);

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid start_time or end_time"
            });
        }

        // 4. End must be after start
        if (endDate <= startDate) {
            return res.status(400).json({
                success: false,
                message: "end_time must be after start_time"
            });
        }

        // 5. Call service
        const result = await bookingService.createBooking(
            resourceId,
            userId,
            start_time,
            end_time
        );

        // 6. Handle business errors

        if (result.error === "RESOURCE_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        if (result.error === "USER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (result.error === "RESOURCE_UNAVAILABLE") {
            return res.status(409).json({
                success: false,
                message: "Resource is currently unavailable"
            });
        }

        if (result.error === "BOOKING_CONFLICT") {
            return res.status(409).json({
                success: false,
                message: "Resource is already booked during this period",
                conflict: result.conflict
            });
        }

        if (result.error === "MAINTENANCE_CONFLICT") {
            return res.status(409).json({
                success: false,
                message:
                    "Resource is under maintenance during this period",
                conflict: result.conflict
            });
        }

        // 7. Success
        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: result
        });

    } catch (error) {
        console.error(
            "Error creating booking:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create booking"
        });
    }
};

//getAllBookings.
const getAllBookings = async (req, res) => {
    try {
        const bookings = await bookingService.getAllBookings();

        return res.status(200).json({
            success: true,
            data: bookings
        });

    } catch (error) {
        console.error(
            "Error fetching bookings:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch bookings"
        });
    }
};

// Get booking by ID
const getBookingById = async (req, res) => {

    try {

        const bookingId = parseInt(req.params.id);

        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID"
            });
        }

        const booking =
            await bookingService.getBookingById(bookingId);

        return res.status(200).json({
            success: true,
            data: booking
        });

    } catch (error) {

        if (error.message === "BOOKING_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Cancel booking
const cancelBooking = async (req, res) => {

    try {

        const bookingId = parseInt(req.params.id);

        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID"
            });
        }

        const result =
            await bookingService.cancelBooking(bookingId);

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            data: result
        });

    } catch (error) {

        if (error.message === "BOOKING_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (error.message === "BOOKING_ALREADY_CANCELLED") {
            return res.status(409).json({
                success: false,
                message: "Booking is already cancelled"
            });
        }

        if (error.message === "BOOKING_ALREADY_COMPLETED") {
            return res.status(409).json({
                success: false,
                message: "Completed booking cannot be cancelled"
            });
        }

        if (error.message === "ACTIVE_BOOKING_CANNOT_BE_CANCELLED") {
            return res.status(409).json({
                success: false,
                message: "Active booking cannot be cancelled"
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Update booking
const updateBooking = async (req, res) => {

    try {

        const bookingId = parseInt(req.params.id);

        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID"
            });
        }

        const {
            start_time,
            end_time,
            status
        } = req.body;

        if (
            start_time === undefined &&
            end_time === undefined &&
            status === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "At least one field is required for update"
            });
        }

        if (start_time !== undefined) {

            if (isNaN(Date.parse(start_time))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid start_time"
                });
            }
        }

        if (end_time !== undefined) {

            if (isNaN(Date.parse(end_time))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid end_time"
                });
            }
        }

        const updatedBooking =
            await bookingService.updateBooking(
                bookingId,
                start_time,
                end_time,
                status
            );

        return res.status(200).json({
            success: true,
            message: "Booking updated successfully",
            data: updatedBooking
        });

    } catch (error) {

        if (error.message === "BOOKING_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (error.message === "BOOKING_CANNOT_BE_UPDATED") {
            return res.status(409).json({
                success: false,
                message: "Completed or cancelled booking cannot be updated"
            });
        }

        if (error.message === "INVALID_BOOKING_STATUS") {
            return res.status(400).json({
                success: false,
                message: "Invalid booking status"
            });
        }

        if (error.message === "INVALID_BOOKING_TIME") {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time"
            });
        }

        if (error.message === "BOOKING_CONFLICT") {
            return res.status(409).json({
                success: false,
                message: "Resource is already booked for the requested period"
            });
        }

        if (error.message === "MAINTENANCE_CONFLICT") {
            return res.status(409).json({
                success: false,
                message: "Resource is under maintenance for the requested period"
            });
        }

        if (error.message === "NO_UPDATE_FIELDS") {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update"
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get bookings for a specific resource
const getResourceBookings = async (req, res) => {

    try {

        const resourceId = parseInt(req.params.resourceId);

        if (!Number.isInteger(resourceId) || resourceId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource ID"
            });
        }

        const bookings =
            await bookingService.getResourceBookings(resourceId);

        return res.status(200).json({
            success: true,
            data: bookings
        });

    } catch (error) {

        if (error.message === "RESOURCE_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    cancelBooking,
    updateBooking,
    getResourceBookings,
};