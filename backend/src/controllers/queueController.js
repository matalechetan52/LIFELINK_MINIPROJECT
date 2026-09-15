const queueService = require("../services/queueService");

// Join a resource reservation queue
const joinQueue = async (req, res) => {

    try {

        const {
            resource_id,
            user_id,
            requested_start,
            requested_end
        } = req.body;

        // Basic required-field validation
        if (
            resource_id === undefined ||
            user_id === undefined ||
            !requested_start ||
            !requested_end
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "resource_id, user_id, requested_start and requested_end are required"
            });
        }

        // ID validation
        if (
            !Number.isInteger(Number(resource_id)) ||
            Number(resource_id) <= 0 ||
            !Number.isInteger(Number(user_id)) ||
            Number(user_id) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "resource_id and user_id must be positive integers"
            });
        }

        const queueEntry =
            await queueService.joinQueue(
                Number(resource_id),
                Number(user_id),
                requested_start,
                requested_end
            );

        return res.status(201).json({
            success: true,
            message: "Successfully joined the reservation queue",
            data: queueEntry
        });

    } catch (error) {

        if (error.message === "RESOURCE_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (error.message === "INVALID_DATE") {
            return res.status(400).json({
                success: false,
                message: "Invalid requested date/time"
            });
        }

        if (error.message === "INVALID_TIME_RANGE") {
            return res.status(400).json({
                success: false,
                message: "requested_end must be after requested_start"
            });
        }

        if (error.message === "ALREADY_IN_QUEUE") {
            return res.status(409).json({
                success: false,
                message: "User is already in the queue for this requested period"
            });

        }
        if (error.message === "RESOURCE_AVAILABLE") {
            return res.status(409).json({
                success: false,
                message: "Resource is available for the requested period. Queue entry is not required"
            });
        }

        if (error.message === "NO_AVAILABLE_PERIOD") {
            return res.status(409).json({
                success: false,
                message: "No suitable available period could be predicted for this request"
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
// Get all reservation queue entries
const getAllQueues = async (req, res) => {

    try {

        const queues =
            await queueService.getAllQueues();

        return res.status(200).json({
            success: true,
            message: "Reservation queues retrieved successfully",
            data: queues
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


module.exports = {
    joinQueue,
    getAllQueues
    
};