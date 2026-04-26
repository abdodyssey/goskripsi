"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const pemenuhan_syarat_controller_1 = require("../controllers/pemenuhan-syarat.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const pemenuhan_syarat_schema_1 = require("../../schemas/pemenuhan-syarat.schema");
const router = (0, express_1.Router)();
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/pemenuhan-syarat",
    tags: ["Pemenuhan Syarat"],
    summary: "Get All Pemenuhan Syarat",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "List of Pemenuhan Syarat",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, pemenuhan_syarat_controller_1.pemenuhanSyaratController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/pemenuhan-syarat",
    tags: ["Pemenuhan Syarat"],
    summary: "Create Pemenuhan Syarat",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: pemenuhan_syarat_schema_1.createPemenuhanSyaratSchema.shape.body },
            },
        },
    },
    responses: {
        201: {
            description: "Pemenuhan Syarat created",
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
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(pemenuhan_syarat_schema_1.createPemenuhanSyaratSchema), pemenuhan_syarat_controller_1.pemenuhanSyaratController.store);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/pemenuhan-syarat/{id}",
    tags: ["Pemenuhan Syarat"],
    summary: "Get Pemenuhan Syarat by ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Pemenuhan Syarat details",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/:id", auth_middleware_1.requireAuth, pemenuhan_syarat_controller_1.pemenuhanSyaratController.show);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/pemenuhan-syarat/{id}",
    tags: ["Pemenuhan Syarat"],
    summary: "Update Pemenuhan Syarat",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    request: {
        body: {
            content: {
                "application/json": { schema: pemenuhan_syarat_schema_1.updatePemenuhanSyaratSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Pemenuhan Syarat updated",
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
router.put("/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(pemenuhan_syarat_schema_1.updatePemenuhanSyaratSchema), pemenuhan_syarat_controller_1.pemenuhanSyaratController.update);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/pemenuhan-syarat/{id}",
    tags: ["Pemenuhan Syarat"],
    summary: "Delete Pemenuhan Syarat",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Pemenuhan Syarat deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, pemenuhan_syarat_controller_1.pemenuhanSyaratController.destroy);
exports.default = router;
