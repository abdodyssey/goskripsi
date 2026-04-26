"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const auth_schema_1 = require("../../schemas/auth.schema");
const router = (0, express_1.Router)();
// Public Routes
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/login",
    tags: ["Auth"],
    summary: "User Login",
    description: "Authentikasi user menggunakan NIP/NIM dan Password.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: auth_schema_1.loginSchema.shape.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Login berhasil",
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        message: zod_1.z.string().openapi({ example: "Login berhasil" }),
                        success: zod_1.z.boolean().openapi({ example: true }),
                        token_type: zod_1.z.string().openapi({ example: "Bearer" }),
                        user: zod_1.z.object({
                            id: zod_1.z.string().openapi({ example: "1" }),
                            nip_nim: zod_1.z.string().openapi({ example: "kaprodi_tif" }),
                            nama: zod_1.z.string().openapi({ example: "Dr. Budi (Kaprodi)" }),
                        }),
                    }),
                },
            },
        },
    },
});
router.post("/login", (0, validate_middleware_1.validate)(auth_schema_1.loginSchema), auth_controller_1.authController.login);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/logout",
    tags: ["Auth"],
    summary: "User Logout",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "Logout berhasil",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.post("/logout", auth_middleware_1.requireAuth, auth_controller_1.authController.logout);
// Protected Routes
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/change-password",
    tags: ["Auth"],
    summary: "Change Password",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: auth_schema_1.changePasswordSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Password berhasil diubah",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.post("/change-password", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(auth_schema_1.changePasswordSchema), auth_controller_1.authController.changePassword);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/me",
    tags: ["Auth"],
    summary: "Get Current User Profile",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "User profile details",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/user", auth_middleware_1.requireAuth, auth_controller_1.authController.getMe);
router.get("/me", auth_middleware_1.requireAuth, auth_controller_1.authController.getMe);
openapi_generator_1.registry.registerPath({
    method: "patch",
    path: "/api/profile",
    tags: ["Auth"],
    summary: "Update User Profile",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: auth_schema_1.updateProfileSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Profile updated successfully",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.patch("/profile", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(auth_schema_1.updateProfileSchema), auth_controller_1.authController.updateProfile);
exports.default = router;
