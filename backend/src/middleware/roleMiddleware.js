// Check whether the authenticated user has the required role
const authorizeRole = (...allowedRoles) => {

    return (req, res, next) => {

        // Authentication must already be completed
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Check user's role
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        next();
    };
};

module.exports = authorizeRole;