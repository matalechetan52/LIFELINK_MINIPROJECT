const authService = require("../services/authService");

// Register user
const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            phone,
            role,
            address
        } = req.body;

        // Required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // Basic email validation
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Password validation
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });
        }

        // Validate role if provided
        const allowedRoles = [
            "USER",
            "OWNER",
            "ADMIN"
        ];

        if (role && !allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        const user =
            await authService.registerUser(
                name,
                email,
                password,
                phone,
                role,
                address
            );

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user
        });

    } catch (error) {

        if (error.message === "EMAIL_ALREADY_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Login user
const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        // Required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const result =
            await authService.loginUser(
                email,
                password
            );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        });

    } catch (error) {

        if (error.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get current logged-in user
const getCurrentUser = async (req, res) => {

    try {

        const user =
            await authService.getCurrentUser(req.user.user_id);

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {

        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Request a password reset
const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const resetToken =
            await authService.generatePasswordResetToken(email);

        // Do not reveal whether the email exists
        return res.status(200).json({
            success: true,
            message:
                "If the email is registered, a password reset request has been generated",
            reset_token: resetToken
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Reset user password
const resetPassword = async (req, res) => {

    try {

        const {
            reset_token,
            new_password
        } = req.body;

        // Validate required fields
        if (!reset_token || !new_password) {
            return res.status(400).json({
                success: false,
                message:
                    "reset_token and new_password are required"
            });
        }

        // Basic password validation
        if (new_password.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters long"
            });
        }

        const result =
            await authService.resetPassword(
                reset_token,
                new_password
            );

        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
            data: result
        });

    } catch (error) {

        if (
            error.message ===
            "INVALID_OR_EXPIRED_RESET_TOKEN"
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid or expired reset token"
            });
        }

        if (
            error.message ===
            "INVALID_RESET_TOKEN"
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid password reset token"
            });
        }

        if (
            error.message ===
            "USER_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    forgotPassword,
    resetPassword,
};