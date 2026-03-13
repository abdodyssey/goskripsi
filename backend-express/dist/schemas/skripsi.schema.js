"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSkripsiSchema = exports.createSkripsiSchema = void 0;
const zod_1 = require("zod");
exports.createSkripsiSchema = zod_1.z.object({
    body: zod_1.z.object({
        mahasiswa_id: zod_1.z.coerce.number().min(1, "Mahasiswa ID required"),
        ranpel_id: zod_1.z.coerce.number().min(1, "Ranpel ID required"),
        judul: zod_1.z.string().min(1, "Judul required"),
        pembimbing_1: zod_1.z.coerce.number().min(1),
        pembimbing_2: zod_1.z.coerce.number().optional().nullable(),
    }),
});
exports.updateSkripsiSchema = zod_1.z.object({
    body: zod_1.z.object({
        mahasiswa_id: zod_1.z.coerce.number().optional(),
        ranpel_id: zod_1.z.coerce.number().optional(),
        judul: zod_1.z.string().optional(),
        pembimbing_1: zod_1.z.coerce.number().optional(),
        pembimbing_2: zod_1.z.coerce.number().optional().nullable(),
        status: zod_1.z.enum(["berjalan", "selesai", "dibatalkan"]).optional().nullable(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
});
