
const reportService = require("../services/reportService");

const handleReportError = (res, error) => {
    if (error.message === "REPORT_ACCESS_DENIED") {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to access this report"
        });
    }

    console.error("Report error:", error.message);

    return res.status(500).json({
        success: false,
        message: "Failed to generate report"
    });
};

// GET /api/reports/resources
const getResourceReport = async (req, res) => {
    try {
        const data = await reportService.getResourceReport(req.user);

        return res.status(200).json({
            success: true,
            message: "Resource report retrieved successfully",
            data
        });
    } catch (error) {
        return handleReportError(res, error);
    }
};

// GET /api/reports/bookings
const getBookingReport = async (req, res) => {
    try {
        const data = await reportService.getBookingReport(req.user);

        return res.status(200).json({
            success: true,
            message: "Booking report retrieved successfully",
            data
        });
    } catch (error) {
        return handleReportError(res, error);
    }
};

// GET /api/reports/queue
const getQueueReport = async (req, res) => {
    try {
        const data = await reportService.getQueueReport(req.user);

        return res.status(200).json({
            success: true,
            message: "Queue report retrieved successfully",
            data
        });
    } catch (error) {
        return handleReportError(res, error);
    }
};

// GET /api/reports/payments
const getPaymentReport = async (req, res) => {
    try {
        const data = await reportService.getPaymentReport(req.user);

        return res.status(200).json({
            success: true,
            message: "Payment report retrieved successfully",
            data
        });
    } catch (error) {
        return handleReportError(res, error);
    }
};

module.exports = {
    getResourceReport,
    getBookingReport,
    getQueueReport,
    getPaymentReport
};
