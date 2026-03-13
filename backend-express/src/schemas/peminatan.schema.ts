import { z } from "zod";
import { registry } from "../utils/openapi-generator";

export const createPeminatanSchema = z.object({
  body: z
    .object({
      nama_peminatan: z.string().openapi({ example: "Software Engineering" }),
      prodi_id: z.coerce.number().openapi({ example: 1 }),
    })
    .openapi("CreatePeminatanRequest"),
});

registry.register("CreatePeminatanRequest", createPeminatanSchema.shape.body);

export const updatePeminatanSchema = z.object({
  body: z
    .object({
      nama_peminatan: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Software Engineering" }),
      prodi_id: z.coerce.number().optional().nullable().openapi({ example: 1 }),
    })
    .openapi("UpdatePeminatanRequest"),
  params: z.object({
    id: z.string().openapi({ example: "1" }),
  }),
});

registry.register("UpdatePeminatanRequest", updatePeminatanSchema.shape.body);

export type CreatePeminatanInput = z.infer<
  typeof createPeminatanSchema
>["body"];
export type UpdatePeminatanInput = z.infer<
  typeof updatePeminatanSchema
>["body"];
