const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieOptions = require("../config/cookieOptions");
const { UnauthorizedError } = require("../utils/errors");

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @route POST /api/auth/login
const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new UnauthorizedError("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new UnauthorizedError("Invalid credentials");
    }

    const token = generateToken(user._id);

    res.cookie("token", token, cookieOptions);

    res.json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};

// @route POST /api/auth/logout
const logout = async (req, res) => {
    res.clearCookie("token", cookieOptions);
    res.json({ success: true, message: "Logged out" });
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
};

module.exports = { login, logout, getMe };
