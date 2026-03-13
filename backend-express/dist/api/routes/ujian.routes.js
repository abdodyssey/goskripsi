"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const ujian_controller_1 = require("../controllers/ujian.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const ujian_schema_1 = require("../../schemas/ujian.schema");
const router = (0, express_1.Router)();
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/ujian/mahasiswa/{id}",
    tags: ["Ujian"],
    summary: "Get Ujian by Mahasiswa ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "List of Ujian for Mahasiswa",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/mahasiswa/:id", auth_middleware_1.requireAuth, ujian_controller_1.ujianController.getByMahasiswa);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/ujian",
    tags: ["Ujian"],
    summary: "Get All Ujian",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "List of Ujian",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, ujian_controller_1.ujianController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/ujian",
    tags: ["Ujian"],
    summary: "Create Ujian",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: { "application/json": { schema: ujian_schema_1.createUjianSchema.shape.body } },
        },
    },
    responses: {
        201: {
            description: "Ujian created",
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
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(ujian_schema_1.createUjianSchema), ujian_controller_1.ujianController.store);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/ujian/{id}",
    tags: ["Ujian"],
    summary: "Get Ujian by ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Ujian details",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/:id", auth_middleware_1.requireAuth, ujian_controller_1.ujianController.show);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/ujian/{id}",
    tags: ["Ujian"],
    summary: "Update Ujian",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    request: {
        body: {
            content: { "application/json": { schema: ujian_schema_1.updateUjianSchema.shape.body } },
        },
    },
    responses: {
        200: {
            description: "Ujian updated",
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
router.put("/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(ujian_schema_1.updateUjianSchema), ujian_controller_1.ujianController.update);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/ujian/{id}",
    tags: ["Ujian"],
    summary: "Delete Ujian",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Ujian deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, ujian_controller_1.ujianController.destroy);
exports.default = router;
