"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const jenis_ujian_controller_1 = require("../controllers/jenis-ujian.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const jenis_ujian_schema_1 = require("../../schemas/jenis-ujian.schema");
const router = (0, express_1.Router)();
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/jenis-ujian",
    tags: ["Jenis Ujian"],
    summary: "Get All Jenis Ujian",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "List of Jenis Ujian",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, jenis_ujian_controller_1.jenisUjianController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/jenis-ujian",
    tags: ["Jenis Ujian"],
    summary: "Create Jenis Ujian",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: jenis_ujian_schema_1.createJenisUjianSchema.shape.body },
            },
        },
    },
    responses: {
        201: {
            description: "Jenis Ujian created",
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
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(jenis_ujian_schema_1.createJenisUjianSchema), jenis_ujian_controller_1.jenisUjianController.store);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/jenis-ujian/{id}",
    tags: ["Jenis Ujian"],
    summary: "Get Jenis Ujian by ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Jenis Ujian details",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/:id", auth_middleware_1.requireAuth, jenis_ujian_controller_1.jenisUjianController.show);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/jenis-ujian/{id}",
    tags: ["Jenis Ujian"],
    summary: "Update Jenis Ujian",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    request: {
        body: {
            content: {
                "application/json": { schema: jenis_ujian_schema_1.updateJenisUjianSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Jenis Ujian updated",
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
router.put("/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(jenis_ujian_schema_1.updateJenisUjianSchema), jenis_ujian_controller_1.jenisUjianController.update);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/jenis-ujian/{id}",
    tags: ["Jenis Ujian"],
    summary: "Delete Jenis Ujian",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Jenis Ujian deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, jenis_ujian_controller_1.jenisUjianController.destroy);
exports.default = router;
