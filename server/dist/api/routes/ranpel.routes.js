"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const ranpel_controller_1 = require("../controllers/ranpel.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const ranpel_schema_1 = require("../../schemas/ranpel.schema");
const router = (0, express_1.Router)();
// Pengajuan Ranpel Approval (Admin/Kaprodi)
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/ranpel/pengajuan",
    tags: ["Ranpel Pengajuan"],
    summary: "Get All Pengajuan Ranpel",
    description: "Mengambil semua daftar pengajuan rancangan penelitian (Admin/Kaprodi).",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "Daftar pengajuan ranpel",
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        data: zod_1.z.array(zod_1.z.any()),
                        success: zod_1.z.boolean().openapi({ example: true }),
                    }),
                },
            },
        },
    },
});
router.get("/pengajuan", auth_middleware_1.requireAuth, ranpel_controller_1.ranpelController.getAllPengajuan);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/ranpel/pengajuan/{id}",
    tags: ["Ranpel Pengajuan"],
    summary: "Update/Approve Pengajuan Ranpel",
    description: "Menyetujui, menolak, atau meminta revisi pada pengajuan ranpel.",
    security: [{ bearerAuth: [] }],
    request: {
        params: zod_1.z.object({ id: zod_1.z.string() }),
        body: {
            content: {
                "application/json": {
                    schema: ranpel_schema_1.updatePengajuanRanpelSchema.shape.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Status pengajuan berhasil diupdate",
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        data: zod_1.z.any(),
                        success: zod_1.z.boolean().openapi({ example: true }),
                    }),
                },
            },
        },
    },
});
router.put("/pengajuan/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(ranpel_schema_1.updatePengajuanRanpelSchema), ranpel_controller_1.ranpelController.updatePengajuan);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/ranpel/pengajuan/{id}",
    tags: ["Ranpel Pengajuan"],
    summary: "Delete Pengajuan Ranpel",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Pengajuan deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/pengajuan/:id", auth_middleware_1.requireAuth, ranpel_controller_1.ranpelController.destroyPengajuan);
// PDF Export
router.get("/export-pdf/:id", auth_middleware_1.requireAuth, ranpel_controller_1.ranpelController.exportPdf);
router.get("/export-surat-judul/:id", auth_middleware_1.requireAuth, ranpel_controller_1.ranpelController.exportSuratJudul);
// Mahasiswa specific ranpel handling
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/ranpel/mahasiswa/{id}",
    tags: ["Ranpel Pengajuan"],
    summary: "Submit Pengajuan Ranpel (Mahasiswa)",
    description: "Mahasiswa mengajukan rancangan penelitian baru.",
    security: [{ bearerAuth: [] }],
    request: {
        params: zod_1.z.object({
            id: zod_1.z.string().openapi({ description: "Mahasiswa ID" }),
        }),
        body: {
            content: {
                "application/json": {
                    schema: ranpel_schema_1.createRanpelSchema.shape.body,
                },
            },
        },
    },
    responses: {
        201: {
            description: "Pengajuan berhasil dikirim",
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        data: zod_1.z.any(),
                        success: zod_1.z.boolean().openapi({ example: true }),
                    }),
                },
            },
        },
    },
});
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/ranpel/mahasiswa/{id}",
    tags: ["Ranpel Pengajuan"],
    summary: "Get Ranpel by Mahasiswa ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Ranpel details for Mahasiswa",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/mahasiswa/:id", auth_middleware_1.requireAuth, ranpel_controller_1.ranpelController.getByMahasiswa);
router.post("/mahasiswa/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(ranpel_schema_1.createRanpelSchema), ranpel_controller_1.ranpelController.storeByMahasiswa);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/ranpel/mahasiswa/ranpel/{ranpelId}",
    tags: ["Ranpel Pengajuan"],
    summary: "Update Ranpel by Mahasiswa",
    security: [{ bearerAuth: [] }],
    parameters: [
        {
            name: "ranpelId",
            in: "path",
            required: true,
            schema: { type: "string" },
        },
    ],
    request: {
        body: {
            content: {
                "application/json": { schema: ranpel_schema_1.updateRanpelSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Ranpel updated",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.put("/mahasiswa/ranpel/:ranpelId", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(ranpel_schema_1.updateRanpelSchema), ranpel_controller_1.ranpelController.updateRanpelByMahasiswa);
// Core Ranpel APIs
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/ranpel",
    tags: ["Ranpel"],
    summary: "Get All Ranpel",
    description: "Mengambil semua data rancangan penelitian.",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "List Ranpel",
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        data: zod_1.z.array(zod_1.z.any()),
                        success: zod_1.z.boolean().openapi({ example: true }),
                    }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, ranpel_controller_1.ranpelController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/ranpel",
    tags: ["Ranpel"],
    summary: "Create New Ranpel",
    description: "Memasukkan data rancangan penelitian baru.",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: ranpel_schema_1.createRanpelSchema.shape.body,
                },
            },
        },
    },
    responses: {
        201: {
            description: "Ranpel berhasil dibuat",
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        data: zod_1.z.any(),
                        success: zod_1.z.boolean().openapi({ example: true }),
                    }),
                },
            },
        },
    },
});
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(ranpel_schema_1.createRanpelSchema), ranpel_controller_1.ranpelController.store);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/ranpel/{id}",
    tags: ["Ranpel"],
    summary: "Delete Ranpel",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Ranpel deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, ranpel_controller_1.ranpelController.destroyRanpel);
exports.default = router;
