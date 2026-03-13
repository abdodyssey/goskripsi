"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const perbaikan_judul_controller_1 = require("../controllers/perbaikan-judul.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const perbaikan_judul_schema_1 = require("../../schemas/perbaikan-judul.schema");
// Mock multer temporarily because handling file in JSON parsing requires form-data handling middleware.
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ dest: "public/storage/perbaikan_judul" });
const router = (0, express_1.Router)();
// Relation queries
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/perbaikan-judul/mahasiswa/{id}",
    tags: ["Perbaikan Judul"],
    summary: "Get Perbaikan Judul by Mahasiswa ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "List of Perbaikan Judul for Mahasiswa",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/mahasiswa/:id", auth_middleware_1.requireAuth, perbaikan_judul_controller_1.perbaikanJudulController.getByMahasiswa);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/perbaikan-judul/pembimbing/{id}",
    tags: ["Perbaikan Judul"],
    summary: "Get Perbaikan Judul by Pembimbing ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "List of Perbaikan Judul for Pembimbing",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/pembimbing/:id", auth_middleware_1.requireAuth, perbaikan_judul_controller_1.perbaikanJudulController.getByPembimbing);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/perbaikan-judul/dosen-pa/{id}",
    tags: ["Perbaikan Judul"],
    summary: "Get Perbaikan Judul by Dosen PA ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "List of Perbaikan Judul for Dosen PA",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/dosen-pa/:id", auth_middleware_1.requireAuth, perbaikan_judul_controller_1.perbaikanJudulController.getByDosenPa);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/perbaikan-judul",
    tags: ["Perbaikan Judul"],
    summary: "Get All Perbaikan Judul",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "List of Perbaikan Judul",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, perbaikan_judul_controller_1.perbaikanJudulController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/perbaikan-judul",
    tags: ["Perbaikan Judul"],
    summary: "Create Perbaikan Judul",
    description: "Uplod berkas with 'berkas' field name.",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: perbaikan_judul_schema_1.createPerbaikanJudulSchema.shape.body,
                },
            },
        },
    },
    responses: {
        201: {
            description: "Perbaikan Judul created",
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
router.post("/", auth_middleware_1.requireAuth, upload.array("berkas", 1), (0, validate_middleware_1.validate)(perbaikan_judul_schema_1.createPerbaikanJudulSchema), perbaikan_judul_controller_1.perbaikanJudulController.store);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/perbaikan-judul/{id}",
    tags: ["Perbaikan Judul"],
    summary: "Update Perbaikan Judul",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: perbaikan_judul_schema_1.updatePerbaikanJudulSchema.shape.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Perbaikan Judul updated",
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
router.put("/:id", auth_middleware_1.requireAuth, upload.array("berkas", 1), (0, validate_middleware_1.validate)(perbaikan_judul_schema_1.updatePerbaikanJudulSchema), perbaikan_judul_controller_1.perbaikanJudulController.update);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/perbaikan-judul/{id}",
    tags: ["Perbaikan Judul"],
    summary: "Delete Perbaikan Judul",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Perbaikan Judul deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, perbaikan_judul_controller_1.perbaikanJudulController.destroy);
exports.default = router;
