import { z } from "zod";
import { registry } from "../utils/openapi-generator";

export const createFakultasSchema = z.object({
  body: z
    .object({
      nama_fakultas: z.string().openapi({ example: "Sains dan Teknologi" }),
    })
    .openapi("CreateFakultasRequest"),
});

registry.register("CreateFakultasRequest", createFakultasSchema.shape.body);

export const updateFakultasSchema = z.object({
  body: z
    .object({
      nama_fakultas: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Sains dan Teknologi" }),
    })
    .openapi("UpdateFakultasRequest"),
  params: z.object({
    id: z.string().openapi({ example: "1" }),
  }),
});

registry.register("UpdateFakultasRequest", updateFakultasSchema.shape.body);

export type CreateFakultasInput = z.infer<typeof createFakultasSchema>["body"];
export type UpdateFakultasInput = z.infer<typeof updateFakultasSchema>["body"];
