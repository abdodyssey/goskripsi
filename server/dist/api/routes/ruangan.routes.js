"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const ruangan_controller_1 = require("../controllers/ruangan.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const ruangan_schema_1 = require("../../schemas/ruangan.schema");
const router = (0, express_1.Router)();
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/ruangan",
    tags: ["Ruangan"],
    summary: "Get All Ruangan",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "List of Ruangan",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, ruangan_controller_1.ruanganController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/ruangan",
    tags: ["Ruangan"],
    summary: "Create Ruangan",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: ruangan_schema_1.createRuanganSchema.shape.body },
            },
        },
    },
    responses: {
        201: {
            description: "Ruangan created",
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
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(ruangan_schema_1.createRuanganSchema), ruangan_controller_1.ruanganController.store);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/ruangan/{id}",
    tags: ["Ruangan"],
    summary: "Get Ruangan by ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Ruangan details",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/:id", auth_middleware_1.requireAuth, ruangan_controller_1.ruanganController.show);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/ruangan/{id}",
    tags: ["Ruangan"],
    summary: "Update Ruangan",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    request: {
        body: {
            content: {
                "application/json": { schema: ruangan_schema_1.updateRuanganSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Ruangan updated",
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
router.put("/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(ruangan_schema_1.updateRuanganSchema), ruangan_controller_1.ruanganController.update);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/ruangan/{id}",
    tags: ["Ruangan"],
    summary: "Delete Ruangan",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Ruangan deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, ruangan_controller_1.ruanganController.destroy);
exports.default = router;
