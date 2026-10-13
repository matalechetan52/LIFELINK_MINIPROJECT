
const resourcePassportService =
    require("../services/resourcePassportService");

const handleError = (res, error) => {
    if (error.message === "RESOURCE_NOT_FOUND") {
        return res.status(404).json({
            success: false,
            message: "Resource not found"
        });
    }

    if (error.message === "RESOURCE_ACCESS_DENIED") {
        return res.status(403).json({
            success: false,
            message: "You are not allowed to access this resource"
        });
    }

    console.error("Resource Passport error:", error.message);

    return res.status(500).json({
        success: false,
        message: "Failed to retrieve resource information"
    });
};

const validateResourceId = (value) =>
    /^\d+$/.test(value) && Number(value) > 0;

const getRequestAccess = (req) => ({
    resourceId: Number(req.params.resourceId),
    userId: req.user.user_id,
    userRole: req.user.role
});

// GET /api/resources/:resourceId/history
const getResourceHistory = async (req, res) => {
    try {
        if (!validateResourceId(req.params.resourceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource ID"
            });
        }

        const { resourceId, userId, userRole } =
            getRequestAccess(req);

        const history =
            await resourcePassportService.getResourceHistory(
                resourceId,
                userId,
                userRole
            );

        return res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/resources/:resourceId/passport
const getResourcePassport = async (req, res) => {
    try {
        if (!validateResourceId(req.params.resourceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource ID"
            });
        }

        const { resourceId, userId, userRole } =
            getRequestAccess(req);

        const passport =
            await resourcePassportService.getResourcePassport(
                resourceId,
                userId,
                userRole
            );

        return res.status(200).json({
            success: true,
            data: passport
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/resources/:resourceId/passport/bookings
const getPassportBookings = async (req, res) => {
    try {
        if (!validateResourceId(req.params.resourceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource ID"
            });
        }

        const { resourceId, userId, userRole } =
            getRequestAccess(req);

        const bookings =
            await resourcePassportService.getPassportBookings(
                resourceId,
                userId,
                userRole
            );

        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/resources/:resourceId/passport/maintenance
const getPassportMaintenance = async (req, res) => {
    try {
        if (!validateResourceId(req.params.resourceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource ID"
            });
        }

        const { resourceId, userId, userRole } =
            getRequestAccess(req);

        const maintenance =
            await resourcePassportService.getPassportMaintenance(
                resourceId,
                userId,
                userRole
            );

        return res.status(200).json({
            success: true,
            count: maintenance.length,
            data: maintenance
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/resources/:resourceId/passport/reviews
const getPassportReviews = async (req, res) => {
    try {
        if (!validateResourceId(req.params.resourceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource ID"
            });
        }

        const { resourceId, userId, userRole } =
            getRequestAccess(req);

        const reviews =
            await resourcePassportService.getPassportReviews(
                resourceId,
                userId,
                userRole
            );

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        return handleError(res, error);
    }
};

module.exports = {
    getResourceHistory,
    getResourcePassport,
    getPassportBookings,
    getPassportMaintenance,
    getPassportReviews
};
