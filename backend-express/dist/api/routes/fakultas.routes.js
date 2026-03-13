"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const fakultas_controller_1 = require("../controllers/fakultas.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const fakultas_schema_1 = require("../../schemas/fakultas.schema");
const router = (0, express_1.Router)();
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/fakultas",
    tags: ["Fakultas"],
    summary: "Get All Fakultas",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "List of Fakultas",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, fakultas_controller_1.fakultasController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/fakultas",
    tags: ["Fakultas"],
    summary: "Create Fakultas",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: fakultas_schema_1.createFakultasSchema.shape.body },
            },
        },
    },
    responses: {
        201: {
            description: "Fakultas created",
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
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(fakultas_schema_1.createFakultasSchema), fakultas_controller_1.fakultasController.store);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/fakultas/{id}",
    tags: ["Fakultas"],
    summary: "Get Fakultas by ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Fakultas details",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/:id", auth_middleware_1.requireAuth, fakultas_controller_1.fakultasController.show);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/fakultas/{id}",
    tags: ["Fakultas"],
    summary: "Update Fakultas",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    request: {
        body: {
            content: {
                "application/json": { schema: fakultas_schema_1.updateFakultasSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Fakultas updated",
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
router.put("/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(fakultas_schema_1.updateFakultasSchema), fakultas_controller_1.fakultasController.update);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/fakultas/{id}",
    tags: ["Fakultas"],
    summary: "Delete Fakultas",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Fakultas deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, fakultas_controller_1.fakultasController.destroy);
exports.default = router;
