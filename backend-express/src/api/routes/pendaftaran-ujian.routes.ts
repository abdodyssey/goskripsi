import { Router } from "express";
import { z } from "zod";
import { registry } from "../../utils/openapi-generator";
import { pendaftaranUjianController } from "../controllers/pendaftaran-ujian.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createPendaftaranUjianSchema,
  updatePendaftaranUjianSchema,
} from "../../schemas/pendaftaran-ujian.schema";

import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

registry.registerPath({
  method: "get",
  path: "/api/pendaftaran-ujian/mahasiswa/{id}",
  tags: ["Pendaftaran Ujian"],
  summary: "Get Pendaftaran Ujian by Mahasiswa ID",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "List of Pendaftaran Ujian for Mahasiswa",
      content: {
        "application/json": {
          schema: z.object({ data: z.array(z.any()), success: z.boolean() }),
        },
      },
    },
  },
});
router.get(
  "/mahasiswa/:id",
  requireAuth,
  pendaftaranUjianController.getByMahasiswa,
);

registry.registerPath({
  method: "get",
  path: "/api/pendaftaran-ujian",
  tags: ["Pendaftaran Ujian"],
  summary: "Get All Pendaftaran Ujian",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of Pendaftaran Ujian",
      content: {
        "application/json": {
          schema: z.object({ data: z.array(z.any()), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/", requireAuth, pendaftaranUjianController.index);

registry.registerPath({
  method: "post",
  path: "/api/pendaftaran-ujian",
  tags: ["Pendaftaran Ujian"],
  summary: "Create Pendaftaran Ujian",
  description: "Uplod multiple files with 'berkas' field name.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: createPendaftaranUjianSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Pendaftaran Ujian created",
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
  upload.array("berkas", 25),
  validate(createPendaftaranUjianSchema),
  pendaftaranUjianController.store,
);

registry.registerPath({
  method: "get",
  path: "/api/pendaftaran-ujian/{id}",
  tags: ["Pendaftaran Ujian"],
  summary: "Get Pendaftaran Ujian by ID",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Pendaftaran Ujian details",
      content: {
        "application/json": {
          schema: z.object({ data: z.any(), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/:id", requireAuth, pendaftaranUjianController.show);

registry.registerPath({
  method: "put",
  path: "/api/pendaftaran-ujian/{id}",
  tags: ["Pendaftaran Ujian"],
  summary: "Update Pendaftaran Ujian",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: updatePendaftaranUjianSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Pendaftaran Ujian updated",
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
  upload.array("berkas", 25),
  validate(updatePendaftaranUjianSchema),
  pendaftaranUjianController.update,
);

registry.registerPath({
  method: "delete",
  path: "/api/pendaftaran-ujian/{id}",
  tags: ["Pendaftaran Ujian"],
  summary: "Delete Pendaftaran Ujian",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Pendaftaran Ujian deleted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), success: z.boolean() }),
        },
      },
    },
  },
});
router.delete("/:id", requireAuth, pendaftaranUjianController.destroy);

router.post("/:id/submit", requireAuth, pendaftaranUjianController.submit);
router.post("/:id/review", requireAuth, pendaftaranUjianController.review);
router.post(
  "/:id/upload-revisi",
  requireAuth,
  upload.array("berkas", 25),
  pendaftaranUjianController.uploadRevisi,
);

export default router;
