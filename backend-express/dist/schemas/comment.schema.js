"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommentSchema = exports.createCommentSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
exports.createCommentSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        proposal_id: zod_1.z.coerce.number().openapi({ example: 1 }),
        section_id: zod_1.z.string().openapi({ example: "latar-belakang" }),
        user_id: zod_1.z.coerce.number().openapi({ example: 1 }),
        message: zod_1.z.string().openapi({ example: "Perbaiki tata bahasa" }),
        is_resolved: zod_1.z.coerce
            .boolean()
            .optional()
            .nullable()
            .openapi({ example: false }),
    })
        .openapi("CreateCommentRequest"),
});
openapi_generator_1.registry.register("CreateCommentRequest", exports.createCommentSchema.shape.body);
exports.updateCommentSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        proposal_id: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: 1 }),
        section_id: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "latar-belakang" }),
        user_id: zod_1.z.coerce.number().optional().nullable().openapi({ example: 1 }),
        message: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Perbaiki tata bahasa" }),
        is_resolved: zod_1.z.coerce
            .boolean()
            .optional()
            .nullable()
            .openapi({ example: true }),
    })
        .openapi("UpdateCommentRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().openapi({ example: "1" }),
    }),
});
openapi_generator_1.registry.register("UpdateCommentRequest", exports.updateCommentSchema.shape.body);
