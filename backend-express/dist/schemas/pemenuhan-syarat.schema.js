"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePemenuhanSyaratSchema = exports.createPemenuhanSyaratSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
exports.createPemenuhanSyaratSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        pendaftaran_ujian_id: zod_1.z.coerce.number().openapi({ example: 1 }),
        syarat_id: zod_1.z.coerce.number().openapi({ example: 1 }),
        status: zod_1.z.string().openapi({ example: "pending" }),
        file_path: zod_1.z.string().openapi({ example: "uploads/syarat/toefl.pdf" }),
        file_name: zod_1.z.string().openapi({ example: "toefl.pdf" }),
        file_size: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: 1024 }),
        mime_type: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "application/pdf" }),
        keterangan: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Sertifikat asli" }),
    })
        .openapi("CreatePemenuhanSyaratRequest"),
});
openapi_generator_1.registry.register("CreatePemenuhanSyaratRequest", exports.createPemenuhanSyaratSchema.shape.body);
exports.updatePemenuhanSyaratSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        pendaftaran_ujian_id: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: 1 }),
        syarat_id: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: 1 }),
        status: zod_1.z.string().optional().nullable().openapi({ example: "approved" }),
        file_path: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "uploads/syarat/toefl.pdf" }),
        file_name: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "toefl.pdf" }),
        file_size: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: 1024 }),
        mime_type: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "application/pdf" }),
        keterangan: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Sertifikat asli" }),
    })
        .openapi("UpdatePemenuhanSyaratRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().openapi({ example: "1" }),
    }),
});
openapi_generator_1.registry.register("UpdatePemenuhanSyaratRequest", exports.updatePemenuhanSyaratSchema.shape.body);
