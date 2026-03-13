import { Router } from "express";
import { z } from "zod";
import { registry } from "../../utils/openapi-generator";
import { jenisUjianController } from "../controllers/jenis-ujian.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createJenisUjianSchema,
  updateJenisUjianSchema,
} from "../../schemas/jenis-ujian.schema";

const router = Router();

registry.registerPath({
  method: "get",
  path: "/api/jenis-ujian",
  tags: ["Jenis Ujian"],
  summary: "Get All Jenis Ujian",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of Jenis Ujian",
      content: {
        "application/json": {
          schema: z.object({ data: z.array(z.any()), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/", requireAuth, jenisUjianController.index);

registry.registerPath({
  method: "post",
  path: "/api/jenis-ujian",
  tags: ["Jenis Ujian"],
  summary: "Create Jenis Ujian",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: createJenisUjianSchema.shape.body },
      },
    },
  },
  responses: {
    201: {
      description: "Jenis Ujian created",
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
  validate(createJenisUjianSchema),
  jenisUjianController.store,
);

registry.registerPath({
  method: "get",
  path: "/api/jenis-ujian/{id}",
  tags: ["Jenis Ujian"],
  summary: "Get Jenis Ujian by ID",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Jenis Ujian details",
      content: {
        "application/json": {
          schema: z.object({ data: z.any(), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/:id", requireAuth, jenisUjianController.show);

registry.registerPath({
  method: "put",
  path: "/api/jenis-ujian/{id}",
  tags: ["Jenis Ujian"],
  summary: "Update Jenis Ujian",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  request: {
    body: {
      content: {
        "application/json": { schema: updateJenisUjianSchema.shape.body },
      },
    },
  },
  responses: {
    200: {
      description: "Jenis Ujian updated",
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
  validate(updateJenisUjianSchema),
  jenisUjianController.update,
);

registry.registerPath({
  method: "delete",
  path: "/api/jenis-ujian/{id}",
  tags: ["Jenis Ujian"],
  summary: "Delete Jenis Ujian",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Jenis Ujian deleted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), success: z.boolean() }),
        },
      },
    },
  },
});
router.delete("/:id", requireAuth, jenisUjianController.destroy);

export default router;
