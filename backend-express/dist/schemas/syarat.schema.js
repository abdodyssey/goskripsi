"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSyaratSchema = exports.createSyaratSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
exports.createSyaratSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        jenis_ujian_id: zod_1.z.coerce.number().openapi({ example: 1 }),
        nama_syarat: zod_1.z.string().openapi({ example: "Toefl" }),
        kategori: zod_1.z.string().openapi({ example: "Administrasi" }),
        deskripsi: zod_1.z
            .string()
            .openapi({ example: "Sertifikat Toefl skor min 400" }),
        wajib: zod_1.z.coerce.boolean().openapi({ example: true }),
    })
        .openapi("CreateSyaratRequest"),
});
openapi_generator_1.registry.register("CreateSyaratRequest", exports.createSyaratSchema.shape.body);
exports.updateSyaratSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        jenis_ujian_id: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: 1 }),
        nama_syarat: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Toefl" }),
        kategori: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Administrasi" }),
        deskripsi: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Sertifikat Toefl skor min 400" }),
        wajib: zod_1.z.coerce
            .boolean()
            .optional()
            .nullable()
            .openapi({ example: true }),
    })
        .openapi("UpdateSyaratRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().openapi({ example: "1" }),
    }),
});
openapi_generator_1.registry.register("UpdateSyaratRequest", exports.updateSyaratSchema.shape.body);
