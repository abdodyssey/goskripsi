"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const penilaian_controller_1 = require("../controllers/penilaian.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const penilaian_schema_1 = require("../../schemas/penilaian.schema");
const router = (0, express_1.Router)();
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/penilaian",
    tags: ["Penilaian"],
    summary: "Get All Penilaian",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "List of Penilaian",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, penilaian_controller_1.penilaianController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/penilaian",
    tags: ["Penilaian"],
    summary: "Create Penilaian",
    description: "Supports single object or batch array in 'data' field.",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: penilaian_schema_1.createPenilaianSchema.shape.body },
            },
        },
    },
    responses: {
        201: {
            description: "Penilaian created",
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
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(penilaian_schema_1.createPenilaianSchema), penilaian_controller_1.penilaianController.store);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/penilaian/{id}",
    tags: ["Penilaian"],
    summary: "Get Penilaian by ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Penilaian details",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/:id", auth_middleware_1.requireAuth, penilaian_controller_1.penilaianController.show);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/penilaian",
    tags: ["Penilaian"],
    summary: "Batch Update Penilaian",
    description: "Update multiple penilaian at once.",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: penilaian_schema_1.updatePenilaianSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Penilaian updated",
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
router.put("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(penilaian_schema_1.updatePenilaianSchema), penilaian_controller_1.penilaianController.update);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/penilaian/{id}",
    tags: ["Penilaian"],
    summary: "Update Penilaian",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    request: {
        body: {
            content: {
                "application/json": { schema: penilaian_schema_1.updatePenilaianSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Penilaian updated",
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
router.put("/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(penilaian_schema_1.updatePenilaianSchema), penilaian_controller_1.penilaianController.update);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/penilaian/{id}",
    tags: ["Penilaian"],
    summary: "Delete Penilaian",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Penilaian deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, penilaian_controller_1.penilaianController.destroy);
exports.default = router;
