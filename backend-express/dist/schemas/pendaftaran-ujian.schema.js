"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePendaftaranUjianSchema = exports.createPendaftaranUjianSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
exports.createPendaftaranUjianSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        mahasiswa_id: zod_1.z.coerce
            .number()
            .min(1, "Mahasiswa ID is required")
            .openapi({ example: 1 }),
        ranpel_id: zod_1.z.coerce
            .number()
            .min(1, "Ranpel ID is required")
            .openapi({ example: 1 }),
        jenis_ujian_id: zod_1.z.coerce
            .number()
            .min(1, "Jenis Ujian ID is required")
            .openapi({ example: 1 }),
        keterangan: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Mohon segera diproses" }),
    })
        .openapi("CreatePendaftaranUjianRequest"),
});
openapi_generator_1.registry.register("CreatePendaftaranUjianRequest", exports.createPendaftaranUjianSchema.shape.body);
exports.updatePendaftaranUjianSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        ranpel_id: zod_1.z.coerce.number().optional().openapi({ example: 1 }),
        jenis_ujian_id: zod_1.z.coerce.number().optional().openapi({ example: 1 }),
        status: zod_1.z
            .enum(["draft", "menunggu", "revisi", "diterima", "ditolak"])
            .optional()
            .openapi({ example: "menunggu" }),
        keterangan: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Mohon segera diproses" }),
    })
        .openapi("UpdatePendaftaranUjianRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().openapi({ example: "1" }),
    }),
});
openapi_generator_1.registry.register("UpdatePendaftaranUjianRequest", exports.updatePendaftaranUjianSchema.shape.body);
