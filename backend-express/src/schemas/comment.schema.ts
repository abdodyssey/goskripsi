import { z } from "zod";
import { registry } from "../utils/openapi-generator";

export const createCommentSchema = z.object({
  body: z
    .object({
      proposal_id: z.coerce.number().openapi({ example: 1 }),
      section_id: z.string().openapi({ example: "latar-belakang" }),
      user_id: z.coerce.number().openapi({ example: 1 }),
      message: z.string().openapi({ example: "Perbaiki tata bahasa" }),
      is_resolved: z.coerce
        .boolean()
        .optional()
        .nullable()
        .openapi({ example: false }),
    })
    .openapi("CreateCommentRequest"),
});

registry.register("CreateCommentRequest", createCommentSchema.shape.body);

export const updateCommentSchema = z.object({
  body: z
    .object({
      proposal_id: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: 1 }),
      section_id: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "latar-belakang" }),
      user_id: z.coerce.number().optional().nullable().openapi({ example: 1 }),
      message: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Perbaiki tata bahasa" }),
      is_resolved: z.coerce
        .boolean()
        .optional()
        .nullable()
        .openapi({ example: true }),
    })
    .openapi("UpdateCommentRequest"),
  params: z.object({
    id: z.string().openapi({ example: "1" }),
  }),
});

registry.register("UpdateCommentRequest", updateCommentSchema.shape.body);

export type CreateCommentInput = z.infer<typeof createCommentSchema>["body"];
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>["body"];
