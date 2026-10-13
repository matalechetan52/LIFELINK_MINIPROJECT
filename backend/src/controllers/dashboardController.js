
const dashboardService = require("../services/dashboardService");

// GET /api/dashboard
const getDashboard = async (req, res) => {
    try {
        const data = await dashboardService.getDashboard(req.user);

        return res.status(200).json({
            success: true,
            message: "Dashboard retrieved successfully",
            data
        });
    } catch (error) {
        if (error.message === "UNSUPPORTED_DASHBOARD_ROLE") {
            return res.status(403).json({
                success: false,
                message: "Your role does not have dashboard access"
            });
        }

        console.error("Dashboard error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve dashboard"
        });
    }
};

module.exports = {
    getDashboard
};
