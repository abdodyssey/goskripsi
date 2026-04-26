"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProdiSchema = exports.createProdiSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
exports.createProdiSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        nama_prodi: zod_1.z.string().openapi({ example: "Teknik Informatika" }),
        fakultas_id: zod_1.z.coerce.number().openapi({ example: 1 }),
    })
        .openapi("CreateProdiRequest"),
});
openapi_generator_1.registry.register("CreateProdiRequest", exports.createProdiSchema.shape.body);
exports.updateProdiSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        nama_prodi: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Teknik Informatika" }),
        fakultas_id: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: 1 }),
    })
        .openapi("UpdateProdiRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().openapi({ example: "1" }),
    }),
});
openapi_generator_1.registry.register("UpdateProdiRequest", exports.updateProdiSchema.shape.body);
