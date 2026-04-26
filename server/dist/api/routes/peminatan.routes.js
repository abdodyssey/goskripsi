"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const peminatan_controller_1 = require("../controllers/peminatan.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const peminatan_schema_1 = require("../../schemas/peminatan.schema");
const router = (0, express_1.Router)();
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/peminatan",
    tags: ["Peminatan"],
    summary: "Get All Peminatan",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "List of Peminatan",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, peminatan_controller_1.peminatanController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/peminatan",
    tags: ["Peminatan"],
    summary: "Create Peminatan",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: peminatan_schema_1.createPeminatanSchema.shape.body },
            },
        },
    },
    responses: {
        201: {
            description: "Peminatan created",
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
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(peminatan_schema_1.createPeminatanSchema), peminatan_controller_1.peminatanController.store);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/peminatan/{id}",
    tags: ["Peminatan"],
    summary: "Get Peminatan by ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Peminatan details",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/:id", auth_middleware_1.requireAuth, peminatan_controller_1.peminatanController.show);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/peminatan/{id}",
    tags: ["Peminatan"],
    summary: "Update Peminatan",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    request: {
        body: {
            content: {
                "application/json": { schema: peminatan_schema_1.updatePeminatanSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Peminatan updated",
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
router.put("/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(peminatan_schema_1.updatePeminatanSchema), peminatan_controller_1.peminatanController.update);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/peminatan/{id}",
    tags: ["Peminatan"],
    summary: "Delete Peminatan",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Peminatan deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, peminatan_controller_1.peminatanController.destroy);
exports.default = router;
