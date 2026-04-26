"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRuanganSchema = exports.createRuanganSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
exports.createRuanganSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        nama_ruangan: zod_1.z.string().openapi({ example: "Ruang Rapat A" }),
        deskripsi: zod_1.z.string().openapi({ example: "Gedung A, Lantai 2" }),
        prodi_id: zod_1.z.coerce.number().openapi({ example: 1 }),
    })
        .openapi("CreateRuanganRequest"),
});
openapi_generator_1.registry.register("CreateRuanganRequest", exports.createRuanganSchema.shape.body);
exports.updateRuanganSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        nama_ruangan: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Ruang Rapat A" }),
        deskripsi: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Gedung A, Lantai 2" }),
        prodi_id: zod_1.z.coerce.number().optional().nullable().openapi({ example: 1 }),
    })
        .openapi("UpdateRuanganRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().openapi({ example: "1" }),
    }),
});
openapi_generator_1.registry.register("UpdateRuanganRequest", exports.updateRuanganSchema.shape.body);
