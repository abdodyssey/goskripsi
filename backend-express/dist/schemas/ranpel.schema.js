"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePengajuanRanpelSchema = exports.updateRanpelSchema = exports.createRanpelSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
exports.createRanpelSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        judul_penelitian: zod_1.z
            .string()
            .min(1, "Judul penelitian is required")
            .openapi({ example: "Analisis Sentimen Twitter" }),
        masalah_dan_penyebab: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Data lambat diproses" }),
        alternatif_solusi: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Gunakan arsitektur baru" }),
        metode_penelitian: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Metode Kualitatif" }),
        hasil_yang_diharapkan: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Aplikasi yang efisien" }),
        kebutuhan_data: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "API Twitter" }),
        jurnal_referensi: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "http://example.com/jurnal" }),
        mahasiswa_id: zod_1.z.coerce.number().optional().openapi({ example: 1 }),
    })
        .openapi("CreateRanpelRequest"),
});
openapi_generator_1.registry.register("CreateRanpelRequest", exports.createRanpelSchema.shape.body);
exports.updateRanpelSchema = zod_1.z.object({
    body: zod_1.z.object({
        judul_penelitian: zod_1.z.string().optional(),
        masalah_dan_penyebab: zod_1.z.string().optional().nullable(),
        alternatif_solusi: zod_1.z.string().optional().nullable(),
        metode_penelitian: zod_1.z.string().optional().nullable(),
        hasil_yang_diharapkan: zod_1.z.string().optional().nullable(),
        kebutuhan_data: zod_1.z.string().optional().nullable(),
        jurnal_referensi: zod_1.z.string().optional().nullable(),
    }),
    params: zod_1.z.object({
        ranpelId: zod_1.z.string(),
    }),
});
// Skema untuk update spesifik PengajuanRanpel
exports.updatePengajuanRanpelSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        status: zod_1.z
            .enum(["menunggu", "diverifikasi", "diterima", "ditolak"])
            .optional()
            .openapi({ example: "diterima" }),
        keterangan: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Lanjutkan ke tahap berikutnya" }),
        catatan_kaprodi: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Sesuai dengan visi prodi" }),
    })
        .openapi("UpdatePengajuanRanpelRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().openapi({ example: "1" }),
    }),
});
openapi_generator_1.registry.register("UpdatePengajuanRanpelRequest", exports.updatePengajuanRanpelSchema.shape.body);
