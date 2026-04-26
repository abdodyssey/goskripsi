"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const upload_controller_1 = require("../controllers/upload.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() }); // In-memory buffer for small files
/**
 * Route: POST /api/upload
 * Secured by token verification. Handles multipart form-data.
 */
router.post("/", auth_middleware_1.requireAuth, upload.single("file"), // Key must be 'file'
upload_controller_1.uploadController.uploadFile);
/**
 * Route: POST /api/upload/signed-url
 * Secured via backend-to-backend createSignedUrl call.
 */
router.post("/signed-url", auth_middleware_1.requireAuth, upload_controller_1.uploadController.getSignedUrl);
exports.default = router;
