"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePerbaikanJudulSchema = exports.createPerbaikanJudulSchema = void 0;
const zod_1 = require("zod");
const openapi_generator_1 = require("../utils/openapi-generator");
exports.createPerbaikanJudulSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        ranpel_id: zod_1.z.coerce
            .number()
            .min(1, "Ranpel ID is required")
            .openapi({ example: 1 }),
        mahasiswa_id: zod_1.z.coerce
            .number()
            .min(1, "Mahasiswa ID is required")
            .openapi({ example: 1 }),
        judul_baru: zod_1.z
            .string()
            .min(1, "Judul baru is required")
            .openapi({ example: "Analisis Algoritma XYZ" }),
        // berkas di-handle terpisah lewat parameter multer, karena Express JSON body parser tidak memparsing multipart form data file langsung ke schema zod.
    })
        .openapi("CreatePerbaikanJudulRequest"),
});
openapi_generator_1.registry.register("CreatePerbaikanJudulRequest", exports.createPerbaikanJudulSchema.shape.body);
exports.updatePerbaikanJudulSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        judul_baru: zod_1.z
            .string()
            .optional()
            .openapi({ example: "Analisis Algoritma XYZ v2" }),
        status: zod_1.z
            .enum(["menunggu", "diterima", "ditolak"])
            .optional()
            .openapi({ example: "diterima" }),
    })
        .openapi("UpdatePerbaikanJudulRequest"),
    params: zod_1.z.object({
        id: zod_1.z.string().openapi({ example: "1" }),
    }),
});
openapi_generator_1.registry.register("UpdatePerbaikanJudulRequest", exports.updatePerbaikanJudulSchema.shape.body);
