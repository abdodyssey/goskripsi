import { z } from "zod";
import { registry } from "../utils/openapi-generator";

export const createRuanganSchema = z.object({
  body: z
    .object({
      nama_ruangan: z.string().openapi({ example: "Ruang Rapat A" }),
      deskripsi: z.string().openapi({ example: "Gedung A, Lantai 2" }),
      prodi_id: z.coerce.number().openapi({ example: 1 }),
    })
    .openapi("CreateRuanganRequest"),
});

registry.register("CreateRuanganRequest", createRuanganSchema.shape.body);

export const updateRuanganSchema = z.object({
  body: z
    .object({
      nama_ruangan: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Ruang Rapat A" }),
      deskripsi: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Gedung A, Lantai 2" }),
      prodi_id: z.coerce.number().optional().nullable().openapi({ example: 1 }),
    })
    .openapi("UpdateRuanganRequest"),
  params: z.object({
    id: z.string().openapi({ example: "1" }),
  }),
});

registry.register("UpdateRuanganRequest", updateRuanganSchema.shape.body);

export type CreateRuanganInput = z.infer<typeof createRuanganSchema>["body"];
export type UpdateRuanganInput = z.infer<typeof updateRuanganSchema>["body"];
