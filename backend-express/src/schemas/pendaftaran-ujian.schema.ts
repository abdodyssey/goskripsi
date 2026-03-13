import { z } from "zod";
import { registry } from "../utils/openapi-generator";

export const createPendaftaranUjianSchema = z.object({
  body: z
    .object({
      mahasiswa_id: z.coerce
        .number()
        .min(1, "Mahasiswa ID is required")
        .openapi({ example: 1 }),
      ranpel_id: z.coerce
        .number()
        .min(1, "Ranpel ID is required")
        .openapi({ example: 1 }),
      jenis_ujian_id: z.coerce
        .number()
        .min(1, "Jenis Ujian ID is required")
        .openapi({ example: 1 }),
      keterangan: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Mohon segera diproses" }),
    })
    .openapi("CreatePendaftaranUjianRequest"),
});

registry.register(
  "CreatePendaftaranUjianRequest",
  createPendaftaranUjianSchema.shape.body,
);

export const updatePendaftaranUjianSchema = z.object({
  body: z
    .object({
      ranpel_id: z.coerce.number().optional().openapi({ example: 1 }),
      jenis_ujian_id: z.coerce.number().optional().openapi({ example: 1 }),
      status: z
        .enum(["draft", "menunggu", "revisi", "diterima", "ditolak"])
        .optional()
        .openapi({ example: "menunggu" }),
      keterangan: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: "Mohon segera diproses" }),
    })
    .openapi("UpdatePendaftaranUjianRequest"),
  params: z.object({
    id: z.string().openapi({ example: "1" }),
  }),
});

registry.register(
  "UpdatePendaftaranUjianRequest",
  updatePendaftaranUjianSchema.shape.body,
);

export type CreatePendaftaranUjianInput = z.infer<
  typeof createPendaftaranUjianSchema
>["body"];
export type UpdatePendaftaranUjianInput = z.infer<
  typeof updatePendaftaranUjianSchema
>["body"];
