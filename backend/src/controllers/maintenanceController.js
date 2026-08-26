const maintenanceService = require("../services/maintenanceService");

//get all maintenance
const getMaintenance = async (req, res) => {
    try {
        const maintenance =
            await maintenanceService.getAllMaintenance();

        res.status(200).json({
            success: true,
            data: maintenance
        });

    } catch (error) {
        console.error(
            "Error fetching maintenance:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch maintenance records"
        });
    }
};
//get maintenance by id
const getMaintenanceById = async (req, res) => {
    try {
        const maintenanceId = Number(req.params.id);

        if (!Number.isInteger(maintenanceId) || maintenanceId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid maintenance ID"
            });
        }

        const maintenance =
            await maintenanceService.getMaintenanceById(maintenanceId);

        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: "Maintenance record not found"
            });
        }

        res.status(200).json({
            success: true,
            data: maintenance
        });

    } catch (error) {
        console.error(
            "Error fetching maintenance:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch maintenance record"
        });
    }
};

//create maintenance;
const createMaintenance = async (req, res) => {
    try {
        const {
            resource_id,
            start_date,
            end_date,
            reason
        } = req.body;

        // Validate resource ID
        const resourceId = Number(resource_id);

        if (!Number.isInteger(resourceId) || resourceId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource ID"
            });
        }

        // Validate dates
        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: "Start date and end date are required"
            });
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid start date or end date"
            });
        }

        // End must be after start
        if (endDate <= startDate) {
            return res.status(400).json({
                success: false,
                message: "End date must be after start date"
            });
        }

        // Check resource
        const resource =
            await maintenanceService.getResourceById(resourceId);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        // Check booking conflict
        const bookingConflict =
            await maintenanceService.getBookingConflict(
                resourceId,
                start_date,
                end_date
            );

        if (bookingConflict) {
            return res.status(409).json({
                success: false,
                message: "Maintenance period conflicts with an existing booking",
                data: {
                    booking_id: bookingConflict.booking_id,
                    start_time: bookingConflict.start_time,
                    end_time: bookingConflict.end_time
                }
            });
        }

        // Check maintenance conflict
        const maintenanceConflict =
            await maintenanceService.getMaintenanceConflict(
                resourceId,
                start_date,
                end_date
            );

        if (maintenanceConflict) {
            return res.status(409).json({
                success: false,
                message: "Maintenance period conflicts with an existing maintenance schedule",
                data: {
                    maintenance_id:
                        maintenanceConflict.maintenance_id,
                    start_date:
                        maintenanceConflict.start_date,
                    end_date:
                        maintenanceConflict.end_date
                }
            });
        }

        // Create maintenance
        const maintenanceId =
            await maintenanceService.createMaintenance(
                resourceId,
                start_date,
                end_date,
                reason ? reason.trim() : null
            );

        // Fetch newly created record
        const maintenance =
            await maintenanceService.getMaintenanceById(
                maintenanceId
            );

        res.status(201).json({
            success: true,
            message: "Maintenance scheduled successfully",
            data: maintenance
        });

    } catch (error) {
        console.error(
            "Error creating maintenance:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to schedule maintenance"
        });
    }
};

//update maintenance.
const updateMaintenance = async (req, res) => {
    try {
        const maintenanceId = Number(req.params.id);

        if (!Number.isInteger(maintenanceId) || maintenanceId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid maintenance ID"
            });
        }

        const existingMaintenance =
            await maintenanceService.getMaintenanceById(
                maintenanceId
            );

        if (!existingMaintenance) {
            return res.status(404).json({
                success: false,
                message: "Maintenance record not found"
            });
        }

        const {
            start_date,
            end_date,
            reason,
            status
        } = req.body;

        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: "Start date and end date are required"
            });
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid start date or end date"
            });
        }

        if (endDate <= startDate) {
            return res.status(400).json({
                success: false,
                message: "End date must be after start date"
            });
        }

        const allowedStatuses = [
            "SCHEDULED",
            "ONGOING",
            "COMPLETED",
            "CANCELLED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid maintenance status"
            });
        }

        // Validate status transition
        const currentStatus = existingMaintenance.status;

        const validTransitions = {
            SCHEDULED: ["SCHEDULED", "ONGOING", "CANCELLED"],
            ONGOING: ["ONGOING", "COMPLETED"],
            COMPLETED: ["COMPLETED"],
            CANCELLED: ["CANCELLED"]
        };

        if (!validTransitions[currentStatus].includes(status)) {
            return res.status(409).json({
                success: false,
                message:
                    `Invalid status transition from ${currentStatus} to ${status}`
            });
        }

        // Check booking conflict
        const bookingConflict =
            await maintenanceService.getBookingConflict(
                existingMaintenance.resource_id,
                start_date,
                end_date
            );

        if (bookingConflict) {
            return res.status(409).json({
                success: false,
                message:
                    "Maintenance period conflicts with an existing booking"
            });
        }

        // Check maintenance conflict
        const maintenanceConflict =
            await maintenanceService.getMaintenanceConflict(
                existingMaintenance.resource_id,
                start_date,
                end_date
            );

        if (
            maintenanceConflict &&
            maintenanceConflict.maintenance_id !== maintenanceId
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "Maintenance period conflicts with another maintenance schedule"
            });
        }

        await maintenanceService.updateMaintenance(
            maintenanceId,
            start_date,
            end_date,
            reason ? reason.trim() : null,
            status
        );

        const updatedMaintenance =
            await maintenanceService.getMaintenanceById(
                maintenanceId
            );

        res.status(200).json({
            success: true,
            message: "Maintenance updated successfully",
            data: updatedMaintenance
        });

    } catch (error) {
        console.error(
            "Error updating maintenance:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to update maintenance"
        });
    }
};

//deleteMaintenance.
const deleteMaintenance = async (req, res) => {
    try {
        const maintenanceId = Number(req.params.id);

        if (!Number.isInteger(maintenanceId) || maintenanceId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid maintenance ID"
            });
        }

        const maintenance =
            await maintenanceService.getMaintenanceById(
                maintenanceId
            );

        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: "Maintenance record not found"
            });
        }

        // Completed maintenance records are part of
        // the resource's historical record.
        if (maintenance.status === "COMPLETED") {
            return res.status(409).json({
                success: false,
                message:
                    "Completed maintenance records cannot be deleted"
            });
        }

        await maintenanceService.deleteMaintenance(
            maintenanceId
        );

        res.status(200).json({
            success: true,
            message: "Maintenance record deleted successfully"
        });

    } catch (error) {
        console.error(
            "Error deleting maintenance:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to delete maintenance record"
        });
    }
};
module.exports = {
    getMaintenance,
    getMaintenanceById,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
};