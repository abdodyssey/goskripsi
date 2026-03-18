"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const pendaftaran_ujian_controller_1 = require("../controllers/pendaftaran-ujian.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const pendaftaran_ujian_schema_1 = require("../../schemas/pendaftaran-ujian.schema");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = (0, express_1.Router)();
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/pendaftaran-ujian/mahasiswa/{id}",
    tags: ["Pendaftaran Ujian"],
    summary: "Get Pendaftaran Ujian by Mahasiswa ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "List of Pendaftaran Ujian for Mahasiswa",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/mahasiswa/:id", auth_middleware_1.requireAuth, pendaftaran_ujian_controller_1.pendaftaranUjianController.getByMahasiswa);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/pendaftaran-ujian",
    tags: ["Pendaftaran Ujian"],
    summary: "Get All Pendaftaran Ujian",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "List of Pendaftaran Ujian",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, pendaftaran_ujian_controller_1.pendaftaranUjianController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/pendaftaran-ujian",
    tags: ["Pendaftaran Ujian"],
    summary: "Create Pendaftaran Ujian",
    description: "Uplod multiple files with 'berkas' field name.",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: pendaftaran_ujian_schema_1.createPendaftaranUjianSchema.shape.body,
                },
            },
        },
    },
    responses: {
        201: {
            description: "Pendaftaran Ujian created",
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
router.post("/", auth_middleware_1.requireAuth, upload.array("berkas", 25), (0, validate_middleware_1.validate)(pendaftaran_ujian_schema_1.createPendaftaranUjianSchema), pendaftaran_ujian_controller_1.pendaftaranUjianController.store);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/pendaftaran-ujian/{id}",
    tags: ["Pendaftaran Ujian"],
    summary: "Get Pendaftaran Ujian by ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Pendaftaran Ujian details",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/:id", auth_middleware_1.requireAuth, pendaftaran_ujian_controller_1.pendaftaranUjianController.show);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/pendaftaran-ujian/{id}",
    tags: ["Pendaftaran Ujian"],
    summary: "Update Pendaftaran Ujian",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: pendaftaran_ujian_schema_1.updatePendaftaranUjianSchema.shape.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Pendaftaran Ujian updated",
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
router.put("/:id", auth_middleware_1.requireAuth, upload.array("berkas", 25), (0, validate_middleware_1.validate)(pendaftaran_ujian_schema_1.updatePendaftaranUjianSchema), pendaftaran_ujian_controller_1.pendaftaranUjianController.update);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/pendaftaran-ujian/{id}",
    tags: ["Pendaftaran Ujian"],
    summary: "Delete Pendaftaran Ujian",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Pendaftaran Ujian deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, pendaftaran_ujian_controller_1.pendaftaranUjianController.destroy);
router.post("/:id/submit", auth_middleware_1.requireAuth, pendaftaran_ujian_controller_1.pendaftaranUjianController.submit);
router.post("/:id/review", auth_middleware_1.requireAuth, pendaftaran_ujian_controller_1.pendaftaranUjianController.review);
router.post("/:id/upload-revisi", auth_middleware_1.requireAuth, upload.array("berkas", 25), pendaftaran_ujian_controller_1.pendaftaranUjianController.uploadRevisi);
exports.default = router;
