import { z } from "zod";
import { registry } from "../utils/openapi-generator";

export const createMahasiswaSchema = z.object({
  body: z
    .object({
      nim: z
        .string()
        .min(1, "NIM is required")
        .openapi({ example: "12345678" }),
      nama: z
        .string()
        .min(1, "Nama is required")
        .openapi({ example: "Budi Santoso" }),
      no_hp: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "08123456789" }),
      alamat: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Jl. Merdeka No. 1" }),
      prodi_id: z.coerce.number().optional().default(1).openapi({ example: 1 }),
      peminatan_id: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: null }),
      semester: z.coerce.number().optional().default(1).openapi({ example: 1 }),
      ipk: z.coerce.number().optional().default(0).openapi({ example: 3.5 }),
      dosen_pa: z.coerce.number().optional().nullable().openapi({ example: 1 }),
      pembimbing_1: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: 2 }),
      pembimbing_2: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: 3 }),
      status: z
        .string()
        .optional()
        .default("aktif")
        .openapi({ example: "aktif" }),
      angkatan: z
        .string()
        .min(4, "Angkatan must be minimum 4 characters")
        .openapi({ example: "2020" }),
      user_id: z.coerce
        .number()
        .min(1, "User ID is required mapping")
        .openapi({ example: 10 }),
    })
    .openapi("CreateMahasiswaRequest"),
});

registry.register("CreateMahasiswaRequest", createMahasiswaSchema.shape.body);

export const updateMahasiswaSchema = z.object({
  body: z
    .object({
      nim: z.string().optional().openapi({ example: "12345678" }),
      nama: z.string().optional().openapi({ example: "Budi Santoso" }),
      no_hp: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "08123456789" }),
      alamat: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Jl. Merdeka No. 1" }),
      prodi_id: z.coerce.number().optional().openapi({ example: 1 }),
      peminatan_id: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: null }),
      dosen_pa: z.coerce.number().optional().nullable().openapi({ example: 1 }),
      pembimbing_1: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: 2 }),
      pembimbing_2: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: 3 }),
      status: z.string().optional().openapi({ example: "aktif" }),
      angkatan: z.string().optional().openapi({ example: "2020" }),
      semester: z.coerce.number().optional().openapi({ example: 2 }),
      ipk: z.coerce.number().optional().openapi({ example: 3.6 }),
    })
    .openapi("UpdateMahasiswaRequest"),
  params: z.object({
    id: z.string().openapi({ example: "1" }),
  }),
});

registry.register("UpdateMahasiswaRequest", updateMahasiswaSchema.shape.body);

export type CreateMahasiswaInput = z.infer<
  typeof createMahasiswaSchema
>["body"];
export type UpdateMahasiswaInput = z.infer<
  typeof updateMahasiswaSchema
>["body"];
