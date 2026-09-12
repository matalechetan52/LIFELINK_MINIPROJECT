const db = require("../utils/db");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
require("dotenv").config();

// Register a new user
const registerUser = async (
    name,
    email,
    password,
    phone,
    role,
    address
) => {

    // Check whether email already exists
    const [existingUsers] = await db.query(
        `SELECT user_id
         FROM users
         WHERE email = ?`,
        [email]
    );

    if (existingUsers.length > 0) {
        throw new Error("EMAIL_ALREADY_EXISTS");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use USER as default role
    const userRole = role || "USER";

    // Insert user
    const [result] = await db.query(
        `INSERT INTO users
        (name, email, password, phone, role, address)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            name,
            email,
            hashedPassword,
            phone || null,
            userRole,
            address || null
        ]
    );

    return {
        user_id: result.insertId,
        name,
        email,
        phone: phone || null,
        role: userRole,
        address: address || null
    };
};

// Login user
const loginUser = async (email, password) => {

    // Find user by email
    const [rows] = await db.query(
        `SELECT
            user_id,
            name,
            email,
            password,
            phone,
            role,
            address,
            created_at
        FROM users
        WHERE email = ?`,
        [email]
    );

    if (rows.length === 0) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const user = rows[0];

    // Compare password with stored hash
    const passwordMatch =
        await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        throw new Error("INVALID_CREDENTIALS");
    }

    // Create JWT token
    const token = jwt.sign(
        {
            user_id: user.user_id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    return {
        token,
        user: {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            address: user.address,
            created_at: user.created_at
        }
    };
};

// Get current logged-in user
const getCurrentUser = async (userId) => {

    const [rows] = await db.query(
        `SELECT
            user_id,
            name,
            email,
            phone,
            role,
            address,
            created_at
        FROM users
        WHERE user_id = ?`,
        [userId]
    );

    if (rows.length === 0) {
        throw new Error("USER_NOT_FOUND");
    }

    return rows[0];
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
};