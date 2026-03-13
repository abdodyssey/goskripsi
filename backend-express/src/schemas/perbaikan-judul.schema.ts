import { z } from "zod";
import { registry } from "../utils/openapi-generator";

export const createPerbaikanJudulSchema = z.object({
  body: z
    .object({
      ranpel_id: z.coerce
        .number()
        .min(1, "Ranpel ID is required")
        .openapi({ example: 1 }),
      mahasiswa_id: z.coerce
        .number()
        .min(1, "Mahasiswa ID is required")
        .openapi({ example: 1 }),
      judul_baru: z
        .string()
        .min(1, "Judul baru is required")
        .openapi({ example: "Analisis Algoritma XYZ" }),
      // berkas di-handle terpisah lewat parameter multer, karena Express JSON body parser tidak memparsing multipart form data file langsung ke schema zod.
    })
    .openapi("CreatePerbaikanJudulRequest"),
});

registry.register(
  "CreatePerbaikanJudulRequest",
  createPerbaikanJudulSchema.shape.body,
);

export const updatePerbaikanJudulSchema = z.object({
  body: z
    .object({
      judul_baru: z
        .string()
        .optional()
        .openapi({ example: "Analisis Algoritma XYZ v2" }),
      status: z
        .enum(["menunggu", "diterima", "ditolak"])
        .optional()
        .openapi({ example: "diterima" }),
    })
    .openapi("UpdatePerbaikanJudulRequest"),
  params: z.object({
    id: z.string().openapi({ example: "1" }),
  }),
});

registry.register(
  "UpdatePerbaikanJudulRequest",
  updatePerbaikanJudulSchema.shape.body,
);

export type CreatePerbaikanJudulInput = z.infer<
  typeof createPerbaikanJudulSchema
>["body"];
export type UpdatePerbaikanJudulInput = z.infer<
  typeof updatePerbaikanJudulSchema
>["body"];
