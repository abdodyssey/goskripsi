import { z } from "zod";
import { registry } from "../utils/openapi-generator";

export const createRanpelSchema = z.object({
  body: z
    .object({
      judul_penelitian: z
        .string()
        .min(1, "Judul penelitian is required")
        .openapi({ example: "Analisis Sentimen Twitter" }),
      masalah_dan_penyebab: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Data lambat diproses" }),
      alternatif_solusi: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Gunakan arsitektur baru" }),
      metode_penelitian: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Metode Kualitatif" }),
      hasil_yang_diharapkan: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Aplikasi yang efisien" }),
      kebutuhan_data: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "API Twitter" }),
      jurnal_referensi: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "http://example.com/jurnal" }),
      mahasiswa_id: z.coerce.number().optional().openapi({ example: 1 }),
    })
    .openapi("CreateRanpelRequest"),
});

registry.register("CreateRanpelRequest", createRanpelSchema.shape.body);

export const updateRanpelSchema = z.object({
  body: z.object({
    judul_penelitian: z.string().optional(),
    masalah_dan_penyebab: z.string().optional().nullable(),
    alternatif_solusi: z.string().optional().nullable(),
    metode_penelitian: z.string().optional().nullable(),
    hasil_yang_diharapkan: z.string().optional().nullable(),
    kebutuhan_data: z.string().optional().nullable(),
    jurnal_referensi: z.string().optional().nullable(),
  }),
  params: z.object({
    ranpelId: z.string(),
  }),
});

// Skema untuk update spesifik PengajuanRanpel
export const updatePengajuanRanpelSchema = z.object({
  body: z
    .object({
      status: z
        .enum(["menunggu", "diverifikasi", "diterima", "ditolak"])
        .optional()
        .openapi({ example: "diterima" }), // legacy support
      status_dosen_pa: z
        .enum(["menunggu", "diverifikasi", "diterima", "ditolak"])
        .optional(),
      status_kaprodi: z
        .enum(["menunggu", "diverifikasi", "diterima", "ditolak"])
        .optional(),
      keterangan: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Lanjutkan ke tahap berikutnya" }), // legacy/dosen_pa
      catatan_dosen_pa: z.string().optional().nullable(),
      catatan_kaprodi: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Sesuai dengan visi prodi" }),
      
      // Section comments
      komen_pa_masalah: z.string().optional().nullable(),
      komen_pa_solusi: z.string().optional().nullable(),
      komen_pa_hasil: z.string().optional().nullable(),
      komen_pa_data: z.string().optional().nullable(),
      komen_pa_metode: z.string().optional().nullable(),

      komen_kpr_masalah: z.string().optional().nullable(),
      komen_kpr_solusi: z.string().optional().nullable(),
      komen_kpr_hasil: z.string().optional().nullable(),
      komen_kpr_data: z.string().optional().nullable(),
      komen_kpr_metode: z.string().optional().nullable(),
    })
    .openapi("UpdatePengajuanRanpelRequest"),
  params: z.object({
    id: z.string().openapi({ example: "1" }),
  }),
});

registry.register(
  "UpdatePengajuanRanpelRequest",
  updatePengajuanRanpelSchema.shape.body,
);

export type CreateRanpelInput = z.infer<typeof createRanpelSchema>["body"];
export type UpdateRanpelInput = z.infer<typeof updateRanpelSchema>["body"];
export type UpdatePengajuanRanpelInput = z.infer<
  typeof updatePengajuanRanpelSchema
>["body"];
