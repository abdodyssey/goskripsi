"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePeminatanSchema = exports.createPeminatanSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
exports.createPeminatanSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        nama_peminatan: zod_1.z.string().openapi({ example: "Software Engineering" }),
        prodi_id: zod_1.z.coerce.number().openapi({ example: 1 }),
    })
        .openapi("CreatePeminatanRequest"),
});
openapi_generator_1.registry.register("CreatePeminatanRequest", exports.createPeminatanSchema.shape.body);
exports.updatePeminatanSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        nama_peminatan: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Software Engineering" }),
        prodi_id: zod_1.z.coerce.number().optional().nullable().openapi({ example: 1 }),
    })
        .openapi("UpdatePeminatanRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().openapi({ example: "1" }),
    }),
});
openapi_generator_1.registry.register("UpdatePeminatanRequest", exports.updatePeminatanSchema.shape.body);
