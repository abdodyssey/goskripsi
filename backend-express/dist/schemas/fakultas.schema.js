"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFakultasSchema = exports.createFakultasSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
exports.createFakultasSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        nama_fakultas: zod_1.z.string().openapi({ example: "Sains dan Teknologi" }),
    })
        .openapi("CreateFakultasRequest"),
});
openapi_generator_1.registry.register("CreateFakultasRequest", exports.createFakultasSchema.shape.body);
exports.updateFakultasSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        nama_fakultas: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Sains dan Teknologi" }),
    })
        .openapi("UpdateFakultasRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().openapi({ example: "1" }),
    }),
});
openapi_generator_1.registry.register("UpdateFakultasRequest", exports.updateFakultasSchema.shape.body);
