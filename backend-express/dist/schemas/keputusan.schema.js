"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKeputusanSchema = exports.createKeputusanSchema = void 0;
const zod_1 = require("zod");
exports.createKeputusanSchema = zod_1.z.object({
    body: zod_1.z.object({
        kode: zod_1.z.string().min(1, "Kode wajib diisi"),
        nama_keputusan: zod_1.z.string().min(1, "Nama keputusan wajib diisi"),
        jenis_ujian_id: zod_1.z.coerce.number().optional().nullable(),
        aktif: zod_1.z.coerce.boolean().optional().default(true),
    }),
});
exports.updateKeputusanSchema = zod_1.z.object({
    body: zod_1.z.object({
        kode: zod_1.z.string().optional(),
        nama_keputusan: zod_1.z.string().optional(),
        jenis_ujian_id: zod_1.z.coerce.number().optional().nullable(),
        aktif: zod_1.z.coerce.boolean().optional(),
    }),
});
