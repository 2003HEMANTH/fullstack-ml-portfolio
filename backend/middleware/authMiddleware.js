const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { UnauthorizedError, ForbiddenError } = require("../utils/errors");

const protect = async (req, _res, next) => {
    const token = req.cookies.token;

    if (!token) {
        throw new UnauthorizedError("Not authorized, no token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
        throw new UnauthorizedError("Not authorized, user not found");
    }

    next();
};

const adminOnly = (req, _res, next) => {
    if (req.user && req.user.role === "admin") {
        return next();
    }
    throw new ForbiddenError("Admin access only");
};

module.exports = { protect, adminOnly };

