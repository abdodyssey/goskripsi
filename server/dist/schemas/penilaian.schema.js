"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePenilaianSchema = exports.createPenilaianSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
const PenilaianCreateItemSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().optional().openapi({ example: 1 }), // For update
    ujian_id: zod_1.z.coerce.number().openapi({ example: 1 }),
    dosen_id: zod_1.z.coerce.number().openapi({ example: 2 }),
    komponen_penilaian_id: zod_1.z.coerce.number().openapi({ example: 1 }),
    nilai: zod_1.z.coerce.number().openapi({ example: 85 }),
    komentar: zod_1.z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Bagus sekali" }),
});
const PenilaianUpdateItemSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().openapi({ example: 1 }),
    ujian_id: zod_1.z.coerce.number().optional().openapi({ example: 1 }),
    nilai: zod_1.z.coerce.number().openapi({ example: 90 }),
    komentar: zod_1.z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Ada perbaikan sedikit" }),
});
exports.createPenilaianSchema = zod_1.z.object({
    body: zod_1.z
        .union([
        PenilaianCreateItemSchema,
        zod_1.z.object({ data: zod_1.z.array(PenilaianCreateItemSchema) }), // Batch insert support
    ])
        .openapi("CreatePenilaianRequest"),
});
openapi_generator_1.registry.register("CreatePenilaianRequest", PenilaianCreateItemSchema);
exports.updatePenilaianSchema = zod_1.z.object({
    body: zod_1.z
        .union([
        PenilaianUpdateItemSchema,
        zod_1.z.object({ data: zod_1.z.array(PenilaianUpdateItemSchema) }), // Batch update support
    ])
        .openapi("UpdatePenilaianRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().optional().openapi({ example: "1" }), // Make optional for batch updates
    }),
});
openapi_generator_1.registry.register("UpdatePenilaianRequest", PenilaianUpdateItemSchema);
