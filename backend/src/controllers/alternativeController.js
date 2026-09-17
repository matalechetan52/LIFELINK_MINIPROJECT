const alternativeService =
    require("../services/alternativeService");

// Get available alternative resources
const getAlternativeResources = async (req, res) => {

    try {

        const resourceId =
            Number(req.params.resourceId);

        const {
            start_time,
            end_time
        } = req.query;

        // Validate resource ID
        if (
            !Number.isInteger(resourceId) ||
            resourceId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Resource ID must be a positive integer"
            });
        }

        // Validate required query parameters
        if (!start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message:
                    "start_time and end_time are required"
            });
        }

        // Validate requested time
        const start = new Date(start_time);
        const end = new Date(end_time);

        if (
            isNaN(start.getTime()) ||
            isNaN(end.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid start_time or end_time"
            });
        }

        if (end <= start) {
            return res.status(400).json({
                success: false,
                message:
                    "end_time must be after start_time"
            });
        }

        const alternatives =
            await alternativeService.getAlternativeResources(
                resourceId,
                start_time,
                end_time
            );

        return res.status(200).json({
            success: true,
            message:
                "Alternative resources retrieved successfully",
            data: alternatives
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

// Search alternative resources using filters
const searchAlternativeResources = async (req, res) => {

    try {

        const {
            category_id,
            location,
            start_time,
            end_time,
            max_price
        } = req.query;

        // Validate category ID
        if (category_id !== undefined) {

            const categoryId = Number(category_id);

            if (
                !Number.isInteger(categoryId) ||
                categoryId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "category_id must be a positive integer"
                });
            }
        }

        // Validate max price
        if (max_price !== undefined) {

            const maxPrice = Number(max_price);

            if (
                isNaN(maxPrice) ||
                maxPrice < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "max_price must be a valid non-negative number"
                });
            }
        }

        // start_time and end_time must be provided together
        if (
            (start_time && !end_time) ||
            (!start_time && end_time)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "start_time and end_time must be provided together"
            });
        }

        // Validate requested time
        if (start_time && end_time) {

            const start = new Date(start_time);
            const end = new Date(end_time);

            if (
                isNaN(start.getTime()) ||
                isNaN(end.getTime())
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid start_time or end_time"
                });
            }

            if (end <= start) {
                return res.status(400).json({
                    success: false,
                    message:
                        "end_time must be after start_time"
                });
            }
        }

        const alternatives =
            await alternativeService.searchAlternativeResources(
                category_id
                    ? Number(category_id)
                    : null,
                location || null,
                start_time || null,
                end_time || null,
                max_price !== undefined
                    ? Number(max_price)
                    : null
            );

        return res.status(200).json({
            success: true,
            message:
                "Alternative resources searched successfully",
            data: alternatives
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
    getAlternativeResources,
    searchAlternativeResources
};