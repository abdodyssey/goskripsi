"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const prodi_controller_1 = require("../controllers/prodi.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const prodi_schema_1 = require("../../schemas/prodi.schema");
const router = (0, express_1.Router)();
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/prodi",
    tags: ["Prodi"],
    summary: "Get All Prodi",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "List of Prodi",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, prodi_controller_1.prodiController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/prodi",
    tags: ["Prodi"],
    summary: "Create Prodi",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: { "application/json": { schema: prodi_schema_1.createProdiSchema.shape.body } },
        },
    },
    responses: {
        201: {
            description: "Prodi created",
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
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(prodi_schema_1.createProdiSchema), prodi_controller_1.prodiController.store);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/prodi/{id}",
    tags: ["Prodi"],
    summary: "Get Prodi by ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Prodi details",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/:id", auth_middleware_1.requireAuth, prodi_controller_1.prodiController.show);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/prodi/{id}",
    tags: ["Prodi"],
    summary: "Update Prodi",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    request: {
        body: {
            content: { "application/json": { schema: prodi_schema_1.updateProdiSchema.shape.body } },
        },
    },
    responses: {
        200: {
            description: "Prodi updated",
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
router.put("/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(prodi_schema_1.updateProdiSchema), prodi_controller_1.prodiController.update);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/prodi/{id}",
    tags: ["Prodi"],
    summary: "Delete Prodi",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Prodi deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, prodi_controller_1.prodiController.destroy);
exports.default = router;
