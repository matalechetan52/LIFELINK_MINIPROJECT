const availabilityService =
    require("../services/availabilityService");

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

module.exports = {
    getResourceAvailability
};