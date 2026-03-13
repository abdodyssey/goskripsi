"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const daftar_kehadiran_controller_1 = require("../controllers/daftar-kehadiran.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const daftar_kehadiran_schema_1 = require("../../schemas/daftar-kehadiran.schema");
const router = (0, express_1.Router)();
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/daftar-kehadiran",
    tags: ["Daftar Kehadiran"],
    summary: "Get All Daftar Kehadiran",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "List of Daftar Kehadiran",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, daftar_kehadiran_controller_1.daftarKehadiranController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/daftar-kehadiran",
    tags: ["Daftar Kehadiran"],
    summary: "Create Daftar Kehadiran",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: daftar_kehadiran_schema_1.createDaftarKehadiranSchema.shape.body },
            },
        },
    },
    responses: {
        201: {
            description: "Daftar Kehadiran created",
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        data: zod_1.z.any(),
                        message: zod_1.z.string(),
                        success: zod_1.z.boolean(),
                    }),
                },
            },
        },
    },
});
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(daftar_kehadiran_schema_1.createDaftarKehadiranSchema), daftar_kehadiran_controller_1.daftarKehadiranController.store);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/daftar-kehadiran/{id}",
    tags: ["Daftar Kehadiran"],
    summary: "Get Daftar Kehadiran by ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Daftar Kehadiran details",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/:id", auth_middleware_1.requireAuth, daftar_kehadiran_controller_1.daftarKehadiranController.show);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/daftar-kehadiran/{id}",
    tags: ["Daftar Kehadiran"],
    summary: "Update Daftar Kehadiran",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    request: {
        body: {
            content: {
                "application/json": { schema: daftar_kehadiran_schema_1.updateDaftarKehadiranSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Daftar Kehadiran updated",
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        data: zod_1.z.any(),
                        message: zod_1.z.string(),
                        success: zod_1.z.boolean(),
                    }),
                },
            },
        },
    },
});
router.put("/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(daftar_kehadiran_schema_1.updateDaftarKehadiranSchema), daftar_kehadiran_controller_1.daftarKehadiranController.update);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/daftar-kehadiran/{id}",
    tags: ["Daftar Kehadiran"],
    summary: "Delete Daftar Kehadiran",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Daftar Kehadiran deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, daftar_kehadiran_controller_1.daftarKehadiranController.destroy);
exports.default = router;
