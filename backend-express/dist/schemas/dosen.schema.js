"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDosenSchema = exports.createDosenSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
exports.createDosenSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        nidn: zod_1.z.string().optional().nullable().openapi({ example: "00112233" }),
        nip: zod_1.z.string().optional().nullable().openapi({ example: "19900101" }),
        nama: zod_1.z
            .string()
            .min(1, "Nama is required")
            .openapi({ example: "Dr. Jane Doe" }),
        no_hp: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "08123456789" }),
        alamat: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Jl. Pendidikan No. 5" }),
        tempat_tanggal_lahir: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Jakarta, 01-01-1980" }),
        pangkat: zod_1.z.string().optional().nullable().openapi({ example: "Penata" }),
        golongan: zod_1.z.string().optional().nullable().openapi({ example: "III/c" }),
        tmt_fst: zod_1.z
            .string()
            .datetime()
            .optional()
            .nullable()
            .openapi({ example: "2020-01-01T00:00:00Z" }),
        jabatan: zod_1.z.string().optional().nullable().openapi({ example: "Lektor" }),
        status: zod_1.z
            .enum(["aktif", "tidak_aktif", "tidak aktif"])
            .optional()
            .default("aktif")
            .openapi({ example: "aktif" }),
        prodi_id: zod_1.z.coerce
            .number()
            .min(1, "Prodi ID is required")
            .openapi({ example: 1 }),
        email: zod_1.z
            .string()
            .email()
            .optional()
            .nullable()
            .openapi({ example: "jane.doe@univ.edu" }),
        user_id: zod_1.z.coerce.number().optional().nullable().openapi({ example: 5 }),
    })
        .openapi("CreateDosenRequest"),
});
openapi_generator_1.registry.register("CreateDosenRequest", exports.createDosenSchema.shape.body);
exports.updateDosenSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        nidn: zod_1.z.string().optional().nullable().openapi({ example: "00112233" }),
        nip: zod_1.z.string().optional().nullable().openapi({ example: "19900101" }),
        nama: zod_1.z.string().optional().openapi({ example: "Dr. Jane Doe" }),
        no_hp: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "08123456789" }),
        alamat: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Jl. Pendidikan No. 5" }),
        tempat_tanggal_lahir: zod_1.z
            .string()
            .optional()
            .nullable()
            .openapi({ example: "Jakarta, 01-01-1980" }),
        pangkat: zod_1.z.string().optional().nullable().openapi({ example: "Penata" }),
        golongan: zod_1.z.string().optional().nullable().openapi({ example: "III/c" }),
        tmt_fst: zod_1.z
            .string()
            .datetime()
            .optional()
            .nullable()
            .openapi({ example: "2020-01-01T00:00:00Z" }),
        jabatan: zod_1.z.string().optional().nullable().openapi({ example: "Lektor" }),
        status: zod_1.z
            .enum(["aktif", "tidak_aktif", "tidak aktif"])
            .optional()
            .openapi({ example: "aktif" }),
        prodi_id: zod_1.z.coerce.number().optional().openapi({ example: 1 }),
        email: zod_1.z
            .string()
            .email()
            .optional()
            .nullable()
            .openapi({ example: "jane.doe@univ.edu" }),
        user_id: zod_1.z.coerce.number().optional().nullable().openapi({ example: 5 }),
    })
        .openapi("UpdateDosenRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().openapi({ example: "1" }),
    }),
});
openapi_generator_1.registry.register("UpdateDosenRequest", exports.updateDosenSchema.shape.body);
