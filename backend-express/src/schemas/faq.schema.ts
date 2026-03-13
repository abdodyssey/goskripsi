import { z } from "zod";
import { registry } from "../utils/openapi-generator";

export const createFaqSchema = z.object({
  body: z
    .object({
      question: z.string().openapi({ example: "Bagaimana cara bimbingan?" }),
      answer: z
        .string()
        .openapi({
          example: "Silahkan hubungi dosen pembimbing masing-masing.",
        }),
      is_active: z.coerce
        .boolean()
        .optional()
        .nullable()
        .openapi({ example: true }),
    })
    .openapi("CreateFaqRequest"),
});

registry.register("CreateFaqRequest", createFaqSchema.shape.body);

export const updateFaqSchema = z.object({
  body: z
    .object({
      question: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Bagaimana cara bimbingan?" }),
      answer: z
        .string()
        .optional()
        .nullable()
        .openapi({
          example: "Silahkan hubungi dosen pembimbing masing-masing.",
        }),
      is_active: z.coerce
        .boolean()
        .optional()
        .nullable()
        .openapi({ example: true }),
    })
    .openapi("UpdateFaqRequest"),
  params: z.object({
    id: z.string().openapi({ example: "1" }),
  }),
});

registry.register("UpdateFaqRequest", updateFaqSchema.shape.body);

export type CreateFaqInput = z.infer<typeof createFaqSchema>["body"];
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>["body"];
