"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTemplateSchema = exports.createTemplateSchema = void 0;
const zod_1 = require("zod");
exports.createTemplateSchema = zod_1.z.object({
    body: zod_1.z.object({
        jenis_ujian_id: zod_1.z.coerce.number(),
        nama_template: zod_1.z.string(),
        deskripsi: zod_1.z.string(),
        file_path: zod_1.z.string(),
    })
});
exports.updateTemplateSchema = zod_1.z.object({
    body: zod_1.z.object({
        jenis_ujian_id: zod_1.z.coerce.number().optional().nullable(),
        nama_template: zod_1.z.string().optional().nullable(),
        deskripsi: zod_1.z.string().optional().nullable(),
        file_path: zod_1.z.string().optional().nullable(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string()
    })
});
