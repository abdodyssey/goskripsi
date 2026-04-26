"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMahasiswaSchema = exports.createMahasiswaSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
exports.createMahasiswaSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        nim: zod_1.z
            .string()
            .min(1, "NIM is required")
            .openapi({ example: "12345678" }),
        nama: zod_1.z
            .string()
            .min(1, "Nama is required")
            .openapi({ example: "Budi Santoso" }),
        no_hp: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "08123456789" }),
        alamat: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Jl. Merdeka No. 1" }),
        prodi_id: zod_1.z.coerce.number().optional().default(1).openapi({ example: 1 }),
        peminatan_id: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: null }),
        semester: zod_1.z.coerce.number().optional().default(1).openapi({ example: 1 }),
        ipk: zod_1.z.coerce.number().optional().default(0).openapi({ example: 3.5 }),
        dosen_pa: zod_1.z.coerce.number().optional().nullable().openapi({ example: 1 }),
        pembimbing_1: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: 2 }),
        pembimbing_2: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: 3 }),
        status: zod_1.z
            .string()
            .optional()
            .default("aktif")
            .openapi({ example: "aktif" }),
        angkatan: zod_1.z
            .string()
            .min(4, "Angkatan must be minimum 4 characters")
            .openapi({ example: "2020" }),
        user_id: zod_1.z.coerce
            .number()
            .min(1, "User ID is required mapping")
            .openapi({ example: 10 }),
    })
        .openapi("CreateMahasiswaRequest"),
});
openapi_generator_1.registry.register("CreateMahasiswaRequest", exports.createMahasiswaSchema.shape.body);
exports.updateMahasiswaSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        nim: zod_1.z.string().optional().openapi({ example: "12345678" }),
        nama: zod_1.z.string().optional().openapi({ example: "Budi Santoso" }),
        no_hp: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "08123456789" }),
        alamat: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Jl. Merdeka No. 1" }),
        prodi_id: zod_1.z.coerce.number().optional().openapi({ example: 1 }),
        peminatan_id: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: null }),
        dosen_pa: zod_1.z.coerce.number().optional().nullable().openapi({ example: 1 }),
        pembimbing_1: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: 2 }),
        pembimbing_2: zod_1.z.coerce
            .number()
            .optional()
            .nullable()
            .openapi({ example: 3 }),
        status: zod_1.z.string().optional().openapi({ example: "aktif" }),
        angkatan: zod_1.z.string().optional().openapi({ example: "2020" }),
        semester: zod_1.z.coerce.number().optional().openapi({ example: 2 }),
        ipk: zod_1.z.coerce.number().optional().openapi({ example: 3.6 }),
    })
        .openapi("UpdateMahasiswaRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().openapi({ example: "1" }),
    }),
});
openapi_generator_1.registry.register("UpdateMahasiswaRequest", exports.updateMahasiswaSchema.shape.body);
