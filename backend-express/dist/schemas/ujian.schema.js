"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUjianSchema = exports.createUjianSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
// ZOD enum based on Prisma schema
const PembimbingPeranEnum = zod_1.z.enum([
    "ketua_penguji",
    "sekretaris_penguji",
    "penguji_1",
    "penguji_2",
]);
exports.createUjianSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        pendaftaran_ujian_id: zod_1.z.coerce
            .number()
            .min(1, "Pendaftaran ujian ID is required")
            .openapi({ example: 1 }),
        mahasiswa_id: zod_1.z.coerce
            .number()
            .min(1, "Mahasiswa ID is required")
            .openapi({ example: 1 }),
        jenis_ujian_id: zod_1.z.coerce
            .number()
            .min(1, "Jenis ujian ID is required")
            .openapi({ example: 1 }),
        hari_ujian: zod_1.z
            .enum(["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"])
            .optional()
            .nullable()
            .openapi({ example: "Senin" }),
        jadwal_ujian: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "2023-11-01" }),
        waktu_mulai: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "08:00" }),
        waktu_selesai: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "10:00" }),
        ruangan_id: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: 1 }),
        keputusan_id: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: 1 }),
        catatan: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Jadwal tentatif" }),
        penguji: zod_1.z
            .array(zod_1.z.object({
            peran: PembimbingPeranEnum,
            dosen_id: zod_1.z.coerce.number().min(1),
        }))
            .optional()
            .openapi({ example: [{ peran: "ketua_penguji", dosen_id: 1 }] }),
    })
        .openapi("CreateUjianRequest"),
});
openapi_generator_1.registry.register("CreateUjianRequest", exports.createUjianSchema.shape.body);
exports.updateUjianSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        hari_ujian: zod_1.z
            .enum(["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"])
            .optional()
            .nullable()
            .openapi({ example: "Senin" }),
        jadwal_ujian: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "2023-11-01" }),
        waktu_mulai: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "08:00" }),
        waktu_selesai: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "10:00" }),
        ruangan_id: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: 1 }),
        hasil: zod_1.z
            .enum(["lulus", "tidak lulus", ""])
            .optional()
            .nullable()
            .openapi({ example: "lulus" }),
        nilai_akhir: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: 85 }),
        keputusan_id: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: 1 }),
        catatan: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Lulus dengan revisi" }),
        penguji: zod_1.z
            .array(zod_1.z.object({
            peran: PembimbingPeranEnum,
            dosen_id: zod_1.z.coerce.number().min(1),
        }))
            .optional()
            .openapi({ example: [{ peran: "ketua_penguji", dosen_id: 1 }] }),
    })
        .openapi("UpdateUjianRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().openapi({ example: "1" }),
    }),
});
openapi_generator_1.registry.register("UpdateUjianRequest", exports.updateUjianSchema.shape.body);
