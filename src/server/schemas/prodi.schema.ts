import { z } from "zod";
import { registry } from "../utils/openapi-generator";

export const createProdiSchema = z.object({
  body: z
    .object({
      nama_prodi: z.string().openapi({ example: "Teknik Informatika" }),
      fakultas_id: z.coerce.number().openapi({ example: 1 }),
    })
    .openapi("CreateProdiRequest"),
});

registry.register("CreateProdiRequest", createProdiSchema.shape.body);

export const updateProdiSchema = z.object({
  body: z
    .object({
      nama_prodi: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Teknik Informatika" }),
      fakultas_id: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: 1 }),
    })
    .openapi("UpdateProdiRequest"),
  params: z.object({
    id: z.string().openapi({ example: "1" }),
  }),
});

registry.register("UpdateProdiRequest", updateProdiSchema.shape.body);

export type CreateProdiInput = z.infer<typeof createProdiSchema>["body"];
export type UpdateProdiInput = z.infer<typeof updateProdiSchema>["body"];
