import { z } from "zod";
import { registry } from "../utils/openapi-generator";

export const createJenisUjianSchema = z.object({
  body: z
    .object({
      nama_jenis: z.string().openapi({ example: "Seminar Proposal" }),
      deskripsi: z
        .string()
        .openapi({
          example: "Ujian untuk mempresentasikan proposal penelitian.",
        }),
    })
    .openapi("CreateJenisUjianRequest"),
});

registry.register("CreateJenisUjianRequest", createJenisUjianSchema.shape.body);

export const updateJenisUjianSchema = z.object({
  body: z
    .object({
      nama_jenis: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Seminar Proposal" }),
      deskripsi: z
        .string()
        .optional()
        .nullable()
        .openapi({
          example: "Ujian untuk mempresentasikan proposal penelitian.",
        }),
    })
    .openapi("UpdateJenisUjianRequest"),
  params: z.object({
    id: z.string().openapi({ example: "1" }),
  }),
});

registry.register("UpdateJenisUjianRequest", updateJenisUjianSchema.shape.body);

export type CreateJenisUjianInput = z.infer<
  typeof createJenisUjianSchema
>["body"];
export type UpdateJenisUjianInput = z.infer<
  typeof updateJenisUjianSchema
>["body"];
