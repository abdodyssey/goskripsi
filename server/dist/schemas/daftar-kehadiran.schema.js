"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDaftarKehadiranSchema = exports.createDaftarKehadiranSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
exports.createDaftarKehadiranSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        ujian_id: zod_1.z.coerce.number().openapi({ example: 1 }),
        dosen_id: zod_1.z.coerce.number().openapi({ example: 1 }),
        status_kehadiran: zod_1.z.string().openapi({ example: "hadir" }),
        catatan: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Hadir tepat waktu" }),
    })
        .openapi("CreateDaftarKehadiranRequest"),
});
openapi_generator_1.registry.register("CreateDaftarKehadiranRequest", exports.createDaftarKehadiranSchema.shape.body);
exports.updateDaftarKehadiranSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        ujian_id: zod_1.z.coerce.number().optional().nullable().openapi({ example: 1 }),
        dosen_id: zod_1.z.coerce.number().optional().nullable().openapi({ example: 1 }),
        status_kehadiran: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "hadir" }),
        catatan: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Hadir tepat waktu" }),
    })
        .openapi("UpdateDaftarKehadiranRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().openapi({ example: "1" }),
    }),
});
openapi_generator_1.registry.register("UpdateDaftarKehadiranRequest", exports.updateDaftarKehadiranSchema.shape.body);
