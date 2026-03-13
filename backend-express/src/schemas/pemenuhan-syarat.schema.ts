import { z } from "zod";
import { registry } from "../utils/openapi-generator";

export const createPemenuhanSyaratSchema = z.object({
  body: z
    .object({
      pendaftaran_ujian_id: z.coerce.number().openapi({ example: 1 }),
      syarat_id: z.coerce.number().openapi({ example: 1 }),
      status: z.string().openapi({ example: "pending" }),
      file_path: z.string().openapi({ example: "uploads/syarat/toefl.pdf" }),
      file_name: z.string().openapi({ example: "toefl.pdf" }),
      file_size: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: 1024 }),
      mime_type: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "application/pdf" }),
      keterangan: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Sertifikat asli" }),
    })
    .openapi("CreatePemenuhanSyaratRequest"),
});

registry.register(
  "CreatePemenuhanSyaratRequest",
  createPemenuhanSyaratSchema.shape.body,
);

export const updatePemenuhanSyaratSchema = z.object({
  body: z
    .object({
      pendaftaran_ujian_id: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: 1 }),
      syarat_id: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: 1 }),
      status: z.string().optional().nullable().openapi({ example: "approved" }),
      file_path: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "uploads/syarat/toefl.pdf" }),
      file_name: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "toefl.pdf" }),
      file_size: z.coerce
        .number()
        .optional()
        .nullable()
        .openapi({ example: 1024 }),
      mime_type: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "application/pdf" }),
      keterangan: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Sertifikat asli" }),
    })
    .openapi("UpdatePemenuhanSyaratRequest"),
  params: z.object({
    id: z.string().openapi({ example: "1" }),
  }),
});

registry.register(
  "UpdatePemenuhanSyaratRequest",
  updatePemenuhanSyaratSchema.shape.body,
);

export type CreatePemenuhanSyaratInput = z.infer<
  typeof createPemenuhanSyaratSchema
>["body"];
export type UpdatePemenuhanSyaratInput = z.infer<
  typeof updatePemenuhanSyaratSchema
>["body"];
