import { Router } from "express";
import { z } from "zod";
import { registry } from "../../utils/openapi-generator";
import { penilaianController } from "../controllers/penilaian.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createPenilaianSchema,
  updatePenilaianSchema,
} from "../../schemas/penilaian.schema";

const router = Router();

registry.registerPath({
  method: "get",
  path: "/api/penilaian",
  tags: ["Penilaian"],
  summary: "Get All Penilaian",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of Penilaian",
      content: {
        "application/json": {
          schema: z.object({ data: z.array(z.any()), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/", requireAuth, penilaianController.index);

registry.registerPath({
  method: "post",
  path: "/api/penilaian",
  tags: ["Penilaian"],
  summary: "Create Penilaian",
  description: "Supports single object or batch array in 'data' field.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: createPenilaianSchema.shape.body },
      },
    },
  },
  responses: {
    201: {
      description: "Penilaian created",
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
  validate(createPenilaianSchema),
  penilaianController.store,
);

registry.registerPath({
  method: "get",
  path: "/api/penilaian/{id}",
  tags: ["Penilaian"],
  summary: "Get Penilaian by ID",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Penilaian details",
      content: {
        "application/json": {
          schema: z.object({ data: z.any(), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/:id", requireAuth, penilaianController.show);

registry.registerPath({
  method: "put",
  path: "/api/penilaian",
  tags: ["Penilaian"],
  summary: "Batch Update Penilaian",
  description: "Update multiple penilaian at once.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: updatePenilaianSchema.shape.body },
      },
    },
  },
  responses: {
    200: {
      description: "Penilaian updated",
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
  "/",
  requireAuth,
  validate(updatePenilaianSchema),
  penilaianController.update,
);

registry.registerPath({
  method: "put",
  path: "/api/penilaian/{id}",
  tags: ["Penilaian"],
  summary: "Update Penilaian",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  request: {
    body: {
      content: {
        "application/json": { schema: updatePenilaianSchema.shape.body },
      },
    },
  },
  responses: {
    200: {
      description: "Penilaian updated",
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
  validate(updatePenilaianSchema),
  penilaianController.update,
);

registry.registerPath({
  method: "delete",
  path: "/api/penilaian/{id}",
  tags: ["Penilaian"],
  summary: "Delete Penilaian",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Penilaian deleted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), success: z.boolean() }),
        },
      },
    },
  },
});
router.delete("/:id", requireAuth, penilaianController.destroy);

export default router;
