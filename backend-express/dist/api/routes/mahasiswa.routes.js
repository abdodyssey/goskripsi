"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const mahasiswa_controller_1 = require("../controllers/mahasiswa.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const mahasiswa_schema_1 = require("../../schemas/mahasiswa.schema");
const router = (0, express_1.Router)();
// To be like Laravel apiResource, but properly hooked with our schema validation
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/mahasiswa",
    tags: ["Mahasiswa"],
    summary: "Get All Mahasiswa",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "List of Mahasiswa",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, mahasiswa_controller_1.mahasiswaController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/mahasiswa",
    tags: ["Mahasiswa"],
    summary: "Create Mahasiswa",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: mahasiswa_schema_1.createMahasiswaSchema.shape.body },
            },
        },
    },
    responses: {
        201: {
            description: "Mahasiswa created",
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
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(mahasiswa_schema_1.createMahasiswaSchema), mahasiswa_controller_1.mahasiswaController.store);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/mahasiswa/{id}",
    tags: ["Mahasiswa"],
    summary: "Get Mahasiswa by ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Mahasiswa details",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/:id", auth_middleware_1.requireAuth, mahasiswa_controller_1.mahasiswaController.show);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/mahasiswa/{id}",
    tags: ["Mahasiswa"],
    summary: "Update Mahasiswa",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    request: {
        body: {
            content: {
                "application/json": { schema: mahasiswa_schema_1.updateMahasiswaSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Mahasiswa updated",
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
router.put("/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(mahasiswa_schema_1.updateMahasiswaSchema), mahasiswa_controller_1.mahasiswaController.update);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/mahasiswa/{id}",
    tags: ["Mahasiswa"],
    summary: "Delete Mahasiswa",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Mahasiswa deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, mahasiswa_controller_1.mahasiswaController.destroy);
exports.default = router;
