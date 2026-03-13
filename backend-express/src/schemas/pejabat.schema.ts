import { z } from "zod";
import { registry } from "../utils/openapi-generator";

export const createPejabatSchema = z.object({
  body: z
    .object({
      nama_pejabat: z.string().openapi({ example: "Prof. Dr. Supono" }),
      jabatan: z.string().openapi({ example: "Dekan" }),
      no_hp: z.string().openapi({ example: "08123456789" }),
    })
    .openapi("CreatePejabatRequest"),
});

registry.register("CreatePejabatRequest", createPejabatSchema.shape.body);

export const updatePejabatSchema = z.object({
  body: z
    .object({
      nama_pejabat: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Prof. Dr. Supono" }),
      jabatan: z.string().optional().nullable().openapi({ example: "Dekan" }),
      no_hp: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "08123456789" }),
    })
    .openapi("UpdatePejabatRequest"),
  params: z.object({
    id: z.string().openapi({ example: "1" }),
  }),
});

registry.register("UpdatePejabatRequest", updatePejabatSchema.shape.body);

export type CreatePejabatInput = z.infer<typeof createPejabatSchema>["body"];
export type UpdatePejabatInput = z.infer<typeof updatePejabatSchema>["body"];
