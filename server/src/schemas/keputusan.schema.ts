import { z } from "zod";

export const createKeputusanSchema = z.object({
  body: z.object({
    kode: z.string().min(1, "Kode wajib diisi"),
    nama_keputusan: z.string().min(1, "Nama keputusan wajib diisi"),
    jenis_ujian_id: z.coerce.number().optional().nullable(),
    aktif: z.coerce.boolean().optional().default(true),
  }),
});

export const updateKeputusanSchema = z.object({
  body: z.object({
    kode: z.string().optional(),
    nama_keputusan: z.string().optional(),
    jenis_ujian_id: z.coerce.number().optional().nullable(),
    aktif: z.coerce.boolean().optional(),
  }),
});

export type CreateKeputusanInput = z.infer<
  typeof createKeputusanSchema
>["body"];
export type UpdateKeputusanInput = z.infer<
  typeof updateKeputusanSchema
>["body"];
