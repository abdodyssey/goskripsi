import { Router } from "express";
import { z } from "zod";
import { registry } from "../../utils/openapi-generator";
import { mahasiswaController } from "../controllers/mahasiswa.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createMahasiswaSchema,
  updateMahasiswaSchema,
} from "../../schemas/mahasiswa.schema";

const router = Router();

// To be like Laravel apiResource, but properly hooked with our schema validation
registry.registerPath({
  method: "get",
  path: "/api/mahasiswa",
  tags: ["Mahasiswa"],
  summary: "Get All Mahasiswa",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of Mahasiswa",
      content: {
        "application/json": {
          schema: z.object({ data: z.array(z.any()), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/", requireAuth, mahasiswaController.index);

registry.registerPath({
  method: "post",
  path: "/api/mahasiswa",
  tags: ["Mahasiswa"],
  summary: "Create Mahasiswa",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: createMahasiswaSchema.shape.body },
      },
    },
  },
  responses: {
    201: {
      description: "Mahasiswa created",
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
  validate(createMahasiswaSchema),
  mahasiswaController.store,
);

// --- My Documents ---
router.get("/my/documents", requireAuth, mahasiswaController.getMyDocuments);
router.post("/my/documents", requireAuth, mahasiswaController.updateDocument);
router.delete(
  "/my/documents/:jenis",
  requireAuth,
  mahasiswaController.deleteDocument,
);

registry.registerPath({
  method: "get",
  path: "/api/mahasiswa/{id}",
  tags: ["Mahasiswa"],
  summary: "Get Mahasiswa by ID",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Mahasiswa details",
      content: {
        "application/json": {
          schema: z.object({ data: z.any(), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/:id", requireAuth, mahasiswaController.show);

registry.registerPath({
  method: "put",
  path: "/api/mahasiswa/{id}",
  tags: ["Mahasiswa"],
  summary: "Update Mahasiswa",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  request: {
    body: {
      content: {
        "application/json": { schema: updateMahasiswaSchema.shape.body },
      },
    },
  },
  responses: {
    200: {
      description: "Mahasiswa updated",
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
  validate(updateMahasiswaSchema),
  mahasiswaController.update,
);

registry.registerPath({
  method: "delete",
  path: "/api/mahasiswa/{id}",
  tags: ["Mahasiswa"],
  summary: "Delete Mahasiswa",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Mahasiswa deleted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), success: z.boolean() }),
        },
      },
    },
  },
});
router.delete("/:id", requireAuth, mahasiswaController.destroy);

export default router;
