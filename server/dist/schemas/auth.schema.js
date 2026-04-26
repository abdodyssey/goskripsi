"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.changePasswordSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
exports.loginSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        username: zod_1.z
            .string()
            .min(1, "Username is required")
            .openapi({ example: "kaprodi_tif" }),
        password: zod_1.z.string().min(1, "Password is required").openapi({
            example: "password123",
            type: "string",
            format: "password",
        }),
    })
        .openapi("LoginRequest"),
});
openapi_generator_1.registry.register("LoginRequest", exports.loginSchema.shape.body);
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        current_password: zod_1.z.string().min(1, "Current password is required"),
        new_password: zod_1.z
            .string()
            .min(8, "New password must be at least 8 characters"),
        new_password_confirmation: zod_1.z
            .string()
            .min(8, "Confirmation must be at least 8 characters"),
    })
        .refine((data) => data.new_password === data.new_password_confirmation, {
        message: "Passwords don't match",
        path: ["new_password_confirmation"],
    }),
});
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        nama: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        no_hp: zod_1.z.string().optional().nullable(),
        alamat: zod_1.z.string().optional().nullable(),
        url_ttd: zod_1.z.string().url().optional().nullable(),
        foto: zod_1.z.string().optional().nullable(),
        ipk: zod_1.z.number().optional().nullable(),
        semester: zod_1.z.number().int().optional().nullable(),
    }),
});
