import { z } from "zod";
import { registry } from "../utils/openapi-generator";

export const createDaftarKehadiranSchema = z.object({
  body: z
    .object({
      ujian_id: z.coerce.number().openapi({ example: 1 }),
      dosen_id: z.coerce.number().openapi({ example: 1 }),
      status_kehadiran: z.string().openapi({ example: "hadir" }),
      catatan: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Hadir tepat waktu" }),
    })
    .openapi("CreateDaftarKehadiranRequest"),
});

registry.register(
  "CreateDaftarKehadiranRequest",
  createDaftarKehadiranSchema.shape.body,
);

export const updateDaftarKehadiranSchema = z.object({
  body: z
    .object({
      ujian_id: z.coerce.number().optional().nullable().openapi({ example: 1 }),
      dosen_id: z.coerce.number().optional().nullable().openapi({ example: 1 }),
      status_kehadiran: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "hadir" }),
      catatan: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Hadir tepat waktu" }),
    })
    .openapi("UpdateDaftarKehadiranRequest"),
  params: z.object({
    id: z.string().openapi({ example: "1" }),
  }),
});

registry.register(
  "UpdateDaftarKehadiranRequest",
  updateDaftarKehadiranSchema.shape.body,
);

export type CreateDaftarKehadiranInput = z.infer<
  typeof createDaftarKehadiranSchema
>["body"];
export type UpdateDaftarKehadiranInput = z.infer<
  typeof updateDaftarKehadiranSchema
>["body"];
