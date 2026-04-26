"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const dosen_controller_1 = require("../controllers/dosen.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const dosen_schema_1 = require("../../schemas/dosen.schema");
const router = (0, express_1.Router)();
// Custom endpoints placed before variable params path
// apiResource pattern Dosen endpoints
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/dosen",
    tags: ["Dosen"],
    summary: "Get All Dosen",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "List of Dosen",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, dosen_controller_1.dosenController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/dosen",
    tags: ["Dosen"],
    summary: "Create Dosen",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: { "application/json": { schema: dosen_schema_1.createDosenSchema.shape.body } },
        },
    },
    responses: {
        201: {
            description: "Dosen created",
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
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(dosen_schema_1.createDosenSchema), dosen_controller_1.dosenController.store);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/dosen/{id}",
    tags: ["Dosen"],
    summary: "Get Dosen by ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Dosen details",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/:id", auth_middleware_1.requireAuth, dosen_controller_1.dosenController.show);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/dosen/{id}",
    tags: ["Dosen"],
    summary: "Update Dosen",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    request: {
        body: {
            content: { "application/json": { schema: dosen_schema_1.updateDosenSchema.shape.body } },
        },
    },
    responses: {
        200: {
            description: "Dosen updated",
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
router.put("/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(dosen_schema_1.updateDosenSchema), dosen_controller_1.dosenController.update);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/dosen/{id}",
    tags: ["Dosen"],
    summary: "Delete Dosen",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Dosen deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, dosen_controller_1.dosenController.destroy);
exports.default = router;
