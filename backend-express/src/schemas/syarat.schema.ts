import { z } from "zod";
import { registry } from "../utils/openapi-generator";

export const createSyaratSchema = z.object({
  body: z
    .object({
      jenis_ujian_id: z.coerce.number().openapi({ example: 1 }),
      nama_syarat: z.string().openapi({ example: "Toefl" }),
      kategori: z.string().openapi({ example: "Administrasi" }),
      deskripsi: z
        .string()
        .openapi({ example: "Sertifikat Toefl skor min 400" }),
      wajib: z.coerce.boolean().openapi({ example: true }),
    })
    .openapi("CreateSyaratRequest"),
});

registry.register("CreateSyaratRequest", createSyaratSchema.shape.body);

export const updateSyaratSchema = z.object({
  body: z
    .object({
      jenis_ujian_id: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: 1 }),
      nama_syarat: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Toefl" }),
      kategori: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Administrasi" }),
      deskripsi: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Sertifikat Toefl skor min 400" }),
      wajib: z.coerce
        .boolean()
        .optional()
        .nullable()
        .openapi({ example: true }),
    })
    .openapi("UpdateSyaratRequest"),
  params: z.object({
    id: z.string().openapi({ example: "1" }),
  }),
});

registry.register("UpdateSyaratRequest", updateSyaratSchema.shape.body);

export type CreateSyaratInput = z.infer<typeof createSyaratSchema>["body"];
export type UpdateSyaratInput = z.infer<typeof updateSyaratSchema>["body"];
