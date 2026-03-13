import { z } from "zod";
import { registry } from "../utils/openapi-generator";

const PenilaianCreateItemSchema = z.object({
  id: z.coerce.number().optional().openapi({ example: 1 }), // For update
  ujian_id: z.coerce.number().openapi({ example: 1 }),
  dosen_id: z.coerce.number().openapi({ example: 2 }),
  komponen_penilaian_id: z.coerce.number().openapi({ example: 1 }),
  nilai: z.coerce.number().openapi({ example: 85 }),
  komentar: z
    .string()
    .optional()
    .nullable()
    .openapi({ example: "Bagus sekali" }),
});

const PenilaianUpdateItemSchema = z.object({
  id: z.coerce.number().openapi({ example: 1 }),
  ujian_id: z.coerce.number().optional().openapi({ example: 1 }),
  nilai: z.coerce.number().openapi({ example: 90 }),
  komentar: z
    .string()
    .optional()
    .nullable()
    .openapi({ example: "Ada perbaikan sedikit" }),
});

export const createPenilaianSchema = z.object({
  body: z
    .union([
      PenilaianCreateItemSchema,
      z.object({ data: z.array(PenilaianCreateItemSchema) }), // Batch insert support
    ])
    .openapi("CreatePenilaianRequest"),
});

registry.register("CreatePenilaianRequest", PenilaianCreateItemSchema);

export const updatePenilaianSchema = z.object({
  body: z
    .union([
      PenilaianUpdateItemSchema,
      z.object({ data: z.array(PenilaianUpdateItemSchema) }), // Batch update support
    ])
    .openapi("UpdatePenilaianRequest"),
  params: z.object({
    id: z.string().optional().openapi({ example: "1" }), // Make optional for batch updates
  }),
});

registry.register("UpdatePenilaianRequest", PenilaianUpdateItemSchema);

export type CreatePenilaianInput = z.infer<
  typeof createPenilaianSchema
>["body"];
export type UpdatePenilaianInput = z.infer<
  typeof updatePenilaianSchema
>["body"];
