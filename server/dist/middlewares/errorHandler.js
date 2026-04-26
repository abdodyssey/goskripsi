"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.logger = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const winston_1 = __importDefault(require("winston"));
const http_error_1 = require("../utils/http-error");
exports.logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
        }),
        new winston_1.default.transports.File({ filename: "error.log", level: "error" }),
    ],
});
const errorHandler = (err, req, res, next) => {
    console.error("Unhandled Error:", err);
    exports.logger.error(err.message, { stack: err.stack });
    if (err instanceof http_error_1.HttpError) {
        res.status(err.statusCode).json({
            status: "error",
            message: err.message,
        });
        return;
    }
    if (err instanceof zod_1.ZodError) {
        console.log("ZOD ERROR DETAILS:", JSON.stringify(err.issues, null, 2));
        res.status(400).json({
            status: "error",
            message: "Validation failed",
            errors: err.issues.map((e) => ({
                path: e.path.join("."),
                message: e.message,
            })),
        });
        return;
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            res.status(409).json({
                status: "error",
                message: "A record with this value already exists",
            });
            return;
        }
    }
    if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        res.status(400).json({
            status: "error",
            message: "Database validation error",
            error: process.env.NODE_ENV === "development" ? err.message : undefined,
        });
        return;
    }
    res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
};
exports.errorHandler = errorHandler;
