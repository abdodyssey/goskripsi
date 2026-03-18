"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const requireAuth = (req, res, next) => {
    try {
        const token = req.cookies.auth_token ||
            (req.headers.authorization?.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : null);
        if (!token) {
            res.status(401).json({
                message: "Unauthorized, no auth_token cookie or Bearer token provided",
                success: false,
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res
            .status(401)
            .json({ message: "Unauthorized, invalid token", success: false });
    }
};
exports.requireAuth = requireAuth;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized", success: false });
            return;
        }
        const hasRole = req.user.roles.some((role) => allowedRoles.includes(role.toLowerCase()));
        if (!hasRole) {
            res.status(403).json({
                message: "Forbidden, insufficient permissions",
                success: false,
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
