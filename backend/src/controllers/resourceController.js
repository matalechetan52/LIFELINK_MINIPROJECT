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
//createResource

const createResource = async (req, res) => {
    try {
        const {
            owner_id,
            category_id,
            name,
            description,
            location,
            price_per_hour
        } = req.body;

        // Validate owner ID
        const ownerId = Number(owner_id);

        if (!Number.isInteger(ownerId) || ownerId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid owner ID"
            });
        }

        // Validate category ID
        const categoryId = Number(category_id);

        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        // Validate resource name
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Resource name is required"
            });
        }

        // Validate price
        const price = Number(price_per_hour);

        if (!Number.isFinite(price) || price < 0) {
            return res.status(400).json({
                success: false,
                message: "Price per hour must be a valid non-negative number"
            });
        }

        // Check owner
        const owner = await resourceService.getOwnerById(ownerId);

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: "Owner not found"
            });
        }

        // Only OWNER or ADMIN can register resources
        if (owner.role !== "OWNER" && owner.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "User is not authorized to own a resource"
            });
        }

        // Check category
        const category =
            await resourceService.getCategoryById(categoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const resourceId = await resourceService.createResource(
            ownerId,
            categoryId,
            name.trim(),
            description ? description.trim() : null,
            location ? location.trim() : null,
            price
        );

        // Fetch the newly created resource
        const resource =
            await resourceService.getResourceById(resourceId);

        res.status(201).json({
            success: true,
            message: "Resource created successfully",
            data: resource
        });

    } catch (error) {
        console.error("Error creating resource:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create resource"
        });
    }
};

//update resource by resourceID
const updateResource = async (req, res) => {
    try {
        const resourceId = Number(req.params.id);

        if (!Number.isInteger(resourceId) || resourceId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource ID"
            });
        }

        const existingResource =
            await resourceService.getResourceById(resourceId);

        if (!existingResource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        const {
            owner_id,
            category_id,
            name,
            description,
            location,
            price_per_hour
        } = req.body;

        const ownerId = Number(owner_id);

        if (!Number.isInteger(ownerId) || ownerId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid owner ID"
            });
        }

        const categoryId = Number(category_id);

        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Resource name is required"
            });
        }

        const price = Number(price_per_hour);

        if (!Number.isFinite(price) || price < 0) {
            return res.status(400).json({
                success: false,
                message: "Price per hour must be a valid non-negative number"
            });
        }

        const owner = await resourceService.getOwnerById(ownerId);

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: "Owner not found"
            });
        }

        if (owner.role !== "OWNER" && owner.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "User is not authorized to own a resource"
            });
        }

        const category =
            await resourceService.getCategoryById(categoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        await resourceService.updateResource(
            resourceId,
            ownerId,
            categoryId,
            name.trim(),
            description ? description.trim() : null,
            location ? location.trim() : null,
            price
        );

        const updatedResource =
            await resourceService.getResourceById(resourceId);

        res.status(200).json({
            success: true,
            message: "Resource updated successfully",
            data: updatedResource
        });

    } catch (error) {
        console.error("Error updating resource:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update resource"
        });
    }
};


//deleteResourceById.
const deleteResource = async (req, res) => {
    try {
        const resourceId = Number(req.params.id);

        // Validate resource ID
        if (!Number.isInteger(resourceId) || resourceId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource ID"
            });
        }

        // Check resource exists
        const resource =
            await resourceService.getResourceById(resourceId);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        // Check existing bookings
        const bookingCount =
            await resourceService.getBookingCountByResource(resourceId);

        if (bookingCount > 0) {
            return res.status(409).json({
                success: false,
                message: "Resource cannot be deleted because bookings are associated with it"
            });
        }

        const maintenanceCount =
    await resourceService.getMaintenanceCountByResource(resourceId);

     if (maintenanceCount > 0) {
    return res.status(409).json({
        success: false,
        message: "Resource cannot be deleted because maintenance records are associated with it"
       });
      }

        // Delete resource
        await resourceService.deleteResource(resourceId);

        res.status(200).json({
            success: true,
            message: "Resource deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting resource:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to delete resource"
        });
    }
};



module.exports = {
    getResources,
    getResourceById,
    createResource,
    updateResource,
    deleteResource,
   
};