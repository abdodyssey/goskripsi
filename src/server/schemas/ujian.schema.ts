import { z } from "zod";
import { registry } from "../utils/openapi-generator";

// ZOD enum based on Prisma schema
const PembimbingPeranEnum = z.enum([
  "ketua_penguji",
  "sekretaris_penguji",
  "penguji_1",
  "penguji_2",
]);

export const createUjianSchema = z.object({
  body: z
    .object({
      pendaftaran_ujian_id: z.coerce
        .number()
        .min(1, "Pendaftaran ujian ID is required")
        .openapi({ example: 1 }),
      mahasiswa_id: z.coerce
        .number()
        .min(1, "Mahasiswa ID is required")
        .openapi({ example: 1 }),
      jenis_ujian_id: z.coerce
        .number()
        .min(1, "Jenis ujian ID is required")
        .openapi({ example: 1 }),
      hari_ujian: z
        .enum(["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"])
        .optional()
        .nullable()
        .openapi({ example: "Senin" }),
      jadwal_ujian: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "2023-11-01" }),
      waktu_mulai: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "08:00" }),
      waktu_selesai: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "10:00" }),
      ruangan_id: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: 1 }),
      keputusan_id: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: 1 }),
      catatan: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Jadwal tentatif" }),
      status: z
        .enum(["belum_dijadwalkan", "dijadwalkan", "selesai"])
        .optional()
        .openapi({ example: "dijadwalkan" }),
      penguji: z
        .array(
          z.object({
            peran: PembimbingPeranEnum,
            dosen_id: z.coerce.number().min(1),
          }),
        )
        .optional()
        .openapi({ example: [{ peran: "ketua_penguji", dosen_id: 1 }] }),
    })
    .openapi("CreateUjianRequest"),
});

registry.register("CreateUjianRequest", createUjianSchema.shape.body);

export const updateUjianSchema = z.object({
  body: z
    .object({
      pendaftaran_ujian_id: z.coerce.number().optional().nullable(),
      hari_ujian: z
        .enum(["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"])
        .optional()
        .nullable()
        .openapi({ example: "Senin" }),
      jadwal_ujian: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "2023-11-01" }),
      waktu_mulai: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "08:00" }),
      waktu_selesai: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "10:00" }),
      ruangan_id: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: 1 }),
      hasil: z
        .enum(["lulus", "tidak lulus", ""])
        .optional()
        .nullable()
        .openapi({ example: "lulus" }),
      nilai_akhir: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: 85 }),
      keputusan_id: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: 1 }),
      catatan: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Lulus dengan revisi" }),
      status: z
        .enum(["belum_dijadwalkan", "dijadwalkan", "selesai"])
        .optional()
        .openapi({ example: "selesai" }),
      penguji: z
        .array(
          z.object({
            peran: PembimbingPeranEnum,
            dosen_id: z.coerce.number().min(1),
          }),
        )
        .optional()
        .openapi({ example: [{ peran: "ketua_penguji", dosen_id: 1 }] }),
    })
    .openapi("UpdateUjianRequest"),
  params: z.object({
    id: z.string().openapi({ example: "1" }),
  }),
});

registry.register("UpdateUjianRequest", updateUjianSchema.shape.body);

export type CreateUjianInput = z.infer<typeof createUjianSchema>["body"];
export type UpdateUjianInput = z.infer<typeof updateUjianSchema>["body"];
