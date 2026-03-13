"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFaqSchema = exports.createFaqSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
exports.createFaqSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        question: zod_1.z.string().openapi({ example: "Bagaimana cara bimbingan?" }),
        answer: zod_1.z
            .string()
            .openapi({
            example: "Silahkan hubungi dosen pembimbing masing-masing.",
        }),
        is_active: zod_1.z.coerce
            .boolean()
            .optional()
            .nullable()
            .openapi({ example: true }),
    })
        .openapi("CreateFaqRequest"),
});
openapi_generator_1.registry.register("CreateFaqRequest", exports.createFaqSchema.shape.body);
exports.updateFaqSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        question: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Bagaimana cara bimbingan?" }),
        answer: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({
            example: "Silahkan hubungi dosen pembimbing masing-masing.",
        }),
        is_active: zod_1.z.coerce
            .boolean()
            .optional()
            .nullable()
            .openapi({ example: true }),
    })
        .openapi("UpdateFaqRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().openapi({ example: "1" }),
    }),
});
openapi_generator_1.registry.register("UpdateFaqRequest", exports.updateFaqSchema.shape.body);
