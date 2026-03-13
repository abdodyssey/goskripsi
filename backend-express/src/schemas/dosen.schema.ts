import { z } from "zod";
import { registry } from "../utils/openapi-generator";

export const createDosenSchema = z.object({
  body: z
    .object({
      nidn: z.string().optional().nullable().openapi({ example: "00112233" }),
      nip: z.string().optional().nullable().openapi({ example: "19900101" }),
      nama: z
        .string()
        .min(1, "Nama is required")
        .openapi({ example: "Dr. Jane Doe" }),
      no_hp: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "08123456789" }),
      alamat: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Jl. Pendidikan No. 5" }),
      tempat_tanggal_lahir: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Jakarta, 01-01-1980" }),
      pangkat: z.string().optional().nullable().openapi({ example: "Penata" }),
      golongan: z.string().optional().nullable().openapi({ example: "III/c" }),
      tmt_fst: z
        .string()
        .datetime()
        .optional()
        .nullable()
        .openapi({ example: "2020-01-01T00:00:00Z" }),
      jabatan: z.string().optional().nullable().openapi({ example: "Lektor" }),
      status: z
        .enum(["aktif", "tidak_aktif", "tidak aktif"])
        .optional()
        .default("aktif")
        .openapi({ example: "aktif" }),
      prodi_id: z.coerce
        .number()
        .min(1, "Prodi ID is required")
        .openapi({ example: 1 }),
      email: z
        .string()
        .email()
        .optional()
        .nullable()
        .openapi({ example: "jane.doe@univ.edu" }),
      user_id: z.coerce.number().optional().nullable().openapi({ example: 5 }),
    })
    .openapi("CreateDosenRequest"),
});

registry.register("CreateDosenRequest", createDosenSchema.shape.body);

export const updateDosenSchema = z.object({
  body: z
    .object({
      nidn: z.string().optional().nullable().openapi({ example: "00112233" }),
      nip: z.string().optional().nullable().openapi({ example: "19900101" }),
      nama: z.string().optional().openapi({ example: "Dr. Jane Doe" }),
      no_hp: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "08123456789" }),
      alamat: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Jl. Pendidikan No. 5" }),
      tempat_tanggal_lahir: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Jakarta, 01-01-1980" }),
      pangkat: z.string().optional().nullable().openapi({ example: "Penata" }),
      golongan: z.string().optional().nullable().openapi({ example: "III/c" }),
      tmt_fst: z
        .string()
        .datetime()
        .optional()
        .nullable()
        .openapi({ example: "2020-01-01T00:00:00Z" }),
      jabatan: z.string().optional().nullable().openapi({ example: "Lektor" }),
      status: z
        .enum(["aktif", "tidak_aktif", "tidak aktif"])
        .optional()
        .openapi({ example: "aktif" }),
      prodi_id: z.coerce.number().optional().openapi({ example: 1 }),
      email: z
        .string()
        .email()
        .optional()
        .nullable()
        .openapi({ example: "jane.doe@univ.edu" }),
      user_id: z.coerce.number().optional().nullable().openapi({ example: 5 }),
    })
    .openapi("UpdateDosenRequest"),
  params: z.object({
    id: z.string().openapi({ example: "1" }),
  }),
});

registry.register("UpdateDosenRequest", updateDosenSchema.shape.body);

export type CreateDosenInput = z.infer<typeof createDosenSchema>["body"];
export type UpdateDosenInput = z.infer<typeof updateDosenSchema>["body"];
