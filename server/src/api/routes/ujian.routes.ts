import { Router } from "express";
import { z } from "zod";
import { registry } from "../../utils/openapi-generator";
import { ujianController } from "../controllers/ujian.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createUjianSchema,
  updateUjianSchema,
} from "../../schemas/ujian.schema";

const router = Router();

registry.registerPath({
  method: "get",
  path: "/api/ujian/mahasiswa/{id}",
  tags: ["Ujian"],
  summary: "Get Ujian by Mahasiswa ID",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "List of Ujian for Mahasiswa",
      content: {
        "application/json": {
          schema: z.object({ data: z.array(z.any()), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/mahasiswa/:id", requireAuth, ujianController.getByMahasiswa);

registry.registerPath({
  method: "get",
  path: "/api/ujian",
  tags: ["Ujian"],
  summary: "Get All Ujian",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of Ujian",
      content: {
        "application/json": {
          schema: z.object({ data: z.array(z.any()), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/", requireAuth, ujianController.index);

registry.registerPath({
  method: "post",
  path: "/api/ujian",
  tags: ["Ujian"],
  summary: "Create Ujian",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: createUjianSchema.shape.body } },
    },
  },
  responses: {
    201: {
      description: "Ujian created",
      content: {
        "application/json": {
          schema: z.object({
            data: z.any(),
            message: z.string(),
            success: z.boolean(),
          }),
        },
      },
    },
  },
});
router.post(
  "/",
  requireAuth,
  validate(createUjianSchema),
  ujianController.store,
);

registry.registerPath({
  method: "get",
  path: "/api/ujian/{id}",
  tags: ["Ujian"],
  summary: "Get Ujian by ID",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Ujian details",
      content: {
        "application/json": {
          schema: z.object({ data: z.any(), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/:id", requireAuth, ujianController.show);

registry.registerPath({
  method: "put",
  path: "/api/ujian/{id}",
  tags: ["Ujian"],
  summary: "Update Ujian",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  request: {
    body: {
      content: { "application/json": { schema: updateUjianSchema.shape.body } },
    },
  },
  responses: {
    200: {
      description: "Ujian updated",
      content: {
        "application/json": {
          schema: z.object({
            data: z.any(),
            message: z.string(),
            success: z.boolean(),
          }),
        },
      },
    },
  },
});
router.put(
  "/:id",
  requireAuth,
  validate(updateUjianSchema),
  ujianController.update,
);

registry.registerPath({
  method: "delete",
  path: "/api/ujian/{id}",
  tags: ["Ujian"],
  summary: "Delete Ujian",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Ujian deleted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), success: z.boolean() }),
        },
      },
    },
  },
});
router.delete("/:id", requireAuth, ujianController.destroy);

registry.registerPath({
  method: "get",
  path: "/api/ujian/scheduling/{pendaftaranId}/form",
  tags: ["Ujian"],
  summary: "Get scheduling form data",
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "pendaftaranId",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: {
      description: "Form data",
      content: { "application/json": { schema: z.any() } },
    },
  },
});
router.get(
  "/scheduling/:pendaftaranId/form",
  requireAuth,
  requireRole(["sekprodi", "admin"]),
  ujianController.getSchedulingForm,
);

registry.registerPath({
  method: "post",
  path: "/api/ujian/scheduling",
  tags: ["Ujian"],
  summary: "Create exam scheduling",
  security: [{ bearerAuth: [] }],
  responses: {
    201: {
      description: "Scheduled",
      content: { "application/json": { schema: z.any() } },
    },
  },
});
router.post(
  "/scheduling",
  requireAuth,
  requireRole(["sekprodi", "admin"]),
  ujianController.createScheduling,
);

registry.registerPath({
  method: "put",
  path: "/api/ujian/scheduling/{id}",
  tags: ["Ujian"],
  summary: "Update exam scheduling",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Updated",
      content: { "application/json": { schema: z.any() } },
    },
  },
});
router.put(
  "/scheduling/:id",
  requireAuth,
  requireRole(["sekprodi", "admin"]),
  ujianController.updateScheduling,
);

// --- Execution Routes ---

router.post("/:id/absensi", requireAuth, ujianController.submitAbsensi);
router.get(
  "/:id/form-penilaian",
  requireAuth,
  ujianController.getFormInputNilai,
);
router.post("/:id/nilai-draft", requireAuth, ujianController.simpanDraftNilai);
router.post("/:id/nilai-final", requireAuth, ujianController.submitNilaiFinal);
router.post("/:id/finalisasi", requireAuth, ujianController.finalisasiNilai);
router.get(
  "/:id/keputusan-options",
  requireAuth,
  ujianController.getDataKeputusan,
);
router.post("/:id/keputusan", requireAuth, ujianController.submitKeputusan);
router.get("/:id/print", requireAuth, ujianController.generateBulkPdf);
router.get("/:id/pdf/bulk", requireAuth, ujianController.generateBulkPdf);
router.get("/pdf/jadwal", requireAuth, ujianController.printJadwal);

export default router;
