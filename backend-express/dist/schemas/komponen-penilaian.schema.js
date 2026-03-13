"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKomponenPenilaianSchema = exports.createKomponenPenilaianSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
exports.createKomponenPenilaianSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        jenis_ujian_id: zod_1.z.coerce.number().openapi({ example: 1 }),
        nama_komponen: zod_1.z.string().openapi({ example: "Presentasi" }),
        bobot: zod_1.z.coerce.number().openapi({ example: 30 }),
    })
        .openapi("CreateKomponenPenilaianRequest"),
});
openapi_generator_1.registry.register("CreateKomponenPenilaianRequest", exports.createKomponenPenilaianSchema.shape.body);
exports.updateKomponenPenilaianSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        jenis_ujian_id: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: 1 }),
        nama_komponen: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Presentasi" }),
        bobot: zod_1.z.coerce.number().optional().nullable().openapi({ example: 30 }),
    })
        .openapi("UpdateKomponenPenilaianRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().openapi({ example: "1" }),
    }),
});
openapi_generator_1.registry.register("UpdateKomponenPenilaianRequest", exports.updateKomponenPenilaianSchema.shape.body);
