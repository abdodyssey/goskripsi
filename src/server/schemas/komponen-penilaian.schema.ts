import { z } from "zod";
import { registry } from "../utils/openapi-generator";

export const createKomponenPenilaianSchema = z.object({
  body: z
    .object({
      jenis_ujian_id: z.coerce.number().openapi({ example: 1 }),
      nama_komponen: z.string().openapi({ example: "Presentasi" }),
      bobot: z.coerce.number().openapi({ example: 30 }),
    })
    .openapi("CreateKomponenPenilaianRequest"),
});

registry.register(
  "CreateKomponenPenilaianRequest",
  createKomponenPenilaianSchema.shape.body,
);

export const updateKomponenPenilaianSchema = z.object({
  body: z
    .object({
      jenis_ujian_id: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: 1 }),
      nama_komponen: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Presentasi" }),
      bobot: z.coerce.number().optional().nullable().openapi({ example: 30 }),
    })
    .openapi("UpdateKomponenPenilaianRequest"),
  params: z.object({
    id: z.string().openapi({ example: "1" }),
  }),
});

registry.register(
  "UpdateKomponenPenilaianRequest",
  updateKomponenPenilaianSchema.shape.body,
);

export type CreateKomponenPenilaianInput = z.infer<
  typeof createKomponenPenilaianSchema
>["body"];
export type UpdateKomponenPenilaianInput = z.infer<
  typeof updateKomponenPenilaianSchema
>["body"];
