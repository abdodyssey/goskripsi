"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../../services/auth.service");
require("../../middlewares/auth.middleware"); // Import for req.user typing
const isProduction = process.env.NODE_ENV === "production";
class AuthController {
    async login(req, res, next) {
        try {
            const result = await auth_service_1.authService.login(req.body);
            // Extract access_token to put in httpOnly cookie
            const { access_token, ...userData } = result;
            res.cookie("auth_token", access_token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000, // 1 Day
            });
            res.status(200).json({ ...userData, access_token });
        }
        catch (error) {
            if (error instanceof Error &&
                error.message === "User tidak ditemukan atau kredensial salah") {
                res.status(401).json({ message: error.message, success: false });
                return;
            }
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            res.clearCookie("auth_token", {
                httpOnly: true,
                secure: isProduction,
                sameSite: "strict",
            });
            res
                .status(200)
                .json({ message: "Successfully logged out", success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            if (!req.user || !req.user.id) {
                res.status(401).json({ message: "Unauthorized", success: false });
                return;
            }
            const result = await auth_service_1.authService.changePassword(req.user.id, req.body);
            res.status(200).json(result);
        }
        catch (error) {
            if (error instanceof Error && error.message === "Kata sandi lama salah") {
                res.status(400).json({ message: error.message, success: false });
                return;
            }
            next(error);
        }
    }
    async getMe(req, res, next) {
        // Used to check who is currently authenticated from the cookie
        // Assuming requireAuth middleware adds req.user
        try {
            if (!req.user || !req.user.id) {
                res.status(401).json({ message: "Unauthorized", success: false });
                return;
            }
            const profile = await auth_service_1.authService.getProfile(req.user.id);
            res.status(200).json(profile);
        }
        catch (error) {
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        try {
            if (!req.user || !req.user.id) {
                res.status(401).json({ message: "Unauthorized", success: false });
                return;
            }
            const result = await auth_service_1.authService.updateProfile(req.user.id, req.body);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
