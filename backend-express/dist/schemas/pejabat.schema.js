"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePejabatSchema = exports.createPejabatSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
exports.createPejabatSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        nama_pejabat: zod_1.z.string().openapi({ example: "Prof. Dr. Supono" }),
        jabatan: zod_1.z.string().openapi({ example: "Dekan" }),
        no_hp: zod_1.z.string().openapi({ example: "08123456789" }),
    })
        .openapi("CreatePejabatRequest"),
});
openapi_generator_1.registry.register("CreatePejabatRequest", exports.createPejabatSchema.shape.body);
exports.updatePejabatSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        nama_pejabat: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Prof. Dr. Supono" }),
        jabatan: zod_1.z.string().optional().nullable().openapi({ example: "Dekan" }),
        no_hp: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "08123456789" }),
    })
        .openapi("UpdatePejabatRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().openapi({ example: "1" }),
    }),
});
openapi_generator_1.registry.register("UpdatePejabatRequest", exports.updatePejabatSchema.shape.body);
