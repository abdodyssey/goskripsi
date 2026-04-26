"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const keputusan_controller_1 = require("../controllers/keputusan.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const keputusan_schema_1 = require("../../schemas/keputusan.schema");
const router = (0, express_1.Router)();
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/keputusan",
    tags: ["Keputusan"],
    summary: "Get All Keputusan",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "List of Keputusan",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, keputusan_controller_1.keputusanController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/keputusan",
    tags: ["Keputusan"],
    summary: "Create Keputusan",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: keputusan_schema_1.createKeputusanSchema.shape.body },
            },
        },
    },
    responses: {
        201: {
            description: "Keputusan created",
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
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(keputusan_schema_1.createKeputusanSchema), keputusan_controller_1.keputusanController.store);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/keputusan/{id}",
    tags: ["Keputusan"],
    summary: "Get Keputusan by ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Keputusan details",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/:id", auth_middleware_1.requireAuth, keputusan_controller_1.keputusanController.show);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/keputusan/{id}",
    tags: ["Keputusan"],
    summary: "Update Keputusan",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    request: {
        body: {
            content: {
                "application/json": { schema: keputusan_schema_1.updateKeputusanSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Keputusan updated",
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
router.put("/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(keputusan_schema_1.updateKeputusanSchema), keputusan_controller_1.keputusanController.update);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/keputusan/{id}",
    tags: ["Keputusan"],
    summary: "Delete Keputusan",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Keputusan deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, keputusan_controller_1.keputusanController.destroy);
exports.default = router;
