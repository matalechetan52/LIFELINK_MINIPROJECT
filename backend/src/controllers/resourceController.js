const resourceService = require("../services/resourceService");

const getResources = async (req, res) => {
    try {
        const resources = await resourceService.getAllResources();

        res.status(200).json({
            success: true,
            data: resources
        });

    } catch (error) {
        console.error("Error fetching resources:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch resources"
        });
    }
};

//get resource by id;
const getResourceById = async (req, res) => {
    try {
        const resourceId = Number(req.params.id);

        if (!Number.isInteger(resourceId) || resourceId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource ID"
            });
        }

        const resource =
            await resourceService.getResourceById(resourceId);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        res.status(200).json({
            success: true,
            data: resource
        });

    } catch (error) {
        console.error("Error fetching resource:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch resource"
        });
    }
};

module.exports = {
    getResources,
    getResourceById
};