"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJenisUjianSchema = exports.createJenisUjianSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
exports.createJenisUjianSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        nama_jenis: zod_1.z.string().openapi({ example: "Seminar Proposal" }),
        deskripsi: zod_1.z
            .string()
            .openapi({
            example: "Ujian untuk mempresentasikan proposal penelitian.",
        }),
    })
        .openapi("CreateJenisUjianRequest"),
});
openapi_generator_1.registry.register("CreateJenisUjianRequest", exports.createJenisUjianSchema.shape.body);
exports.updateJenisUjianSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        nama_jenis: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Seminar Proposal" }),
        deskripsi: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({
            example: "Ujian untuk mempresentasikan proposal penelitian.",
        }),
    })
        .openapi("UpdateJenisUjianRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().openapi({ example: "1" }),
    }),
});
openapi_generator_1.registry.register("UpdateJenisUjianRequest", exports.updateJenisUjianSchema.shape.body);
