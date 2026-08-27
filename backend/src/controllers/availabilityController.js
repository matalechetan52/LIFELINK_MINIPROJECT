const availabilityService =
    require("../services/availabilityService");

//get availability by id
const getResourceAvailability = async (req, res) => {
    try {
        const resourceId = Number(req.params.id);

        // Validate resource ID
        if (!Number.isInteger(resourceId) || resourceId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource ID"
            });
        }

        const availability =
            await availabilityService.getResourceAvailability(
                resourceId
            );

        // Resource not found
        if (!availability) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        res.status(200).json({
            success: true,
            data: availability
        });

    } catch (error) {
        console.error(
            "Error checking resource availability:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to check resource availability"
        });
    }
};

//check availability by id and requested period.
const checkResourceAvailability = async (req, res) => {
    try {
        const resourceId = Number(req.params.id);

        // Validate resource ID
        if (!Number.isInteger(resourceId) || resourceId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource ID"
            });
        }

        // Get requested period
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({
                success: false,
                message: "Start and end dates are required"
            });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        // Validate dates
        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid start or end date"
            });
        }

        // End must be after start
        if (endDate <= startDate) {
            return res.status(400).json({
                success: false,
                message: "End date must be after start date"
            });
        }

        const availability =
            await availabilityService.checkResourceAvailability(
                resourceId,
                start,
                end
            );

        // Resource not found
        if (!availability) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        res.status(200).json({
            success: true,
            data: availability
        });

    } catch (error) {
        console.error(
            "Error checking period availability:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to check resource availability"
        });
    }
};
module.exports = {
    getResourceAvailability,
    checkResourceAvailability,
};