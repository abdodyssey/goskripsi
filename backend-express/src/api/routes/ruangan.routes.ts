import { Router } from "express";
import { z } from "zod";
import { registry } from "../../utils/openapi-generator";
import { ruanganController } from "../controllers/ruangan.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createRuanganSchema,
  updateRuanganSchema,
} from "../../schemas/ruangan.schema";

const router = Router();

registry.registerPath({
  method: "get",
  path: "/api/ruangan",
  tags: ["Ruangan"],
  summary: "Get All Ruangan",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of Ruangan",
      content: {
        "application/json": {
          schema: z.object({ data: z.array(z.any()), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/", requireAuth, ruanganController.index);

registry.registerPath({
  method: "post",
  path: "/api/ruangan",
  tags: ["Ruangan"],
  summary: "Create Ruangan",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: createRuanganSchema.shape.body },
      },
    },
  },
  responses: {
    201: {
      description: "Ruangan created",
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
  validate(createRuanganSchema),
  ruanganController.store,
);

registry.registerPath({
  method: "get",
  path: "/api/ruangan/{id}",
  tags: ["Ruangan"],
  summary: "Get Ruangan by ID",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Ruangan details",
      content: {
        "application/json": {
          schema: z.object({ data: z.any(), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/:id", requireAuth, ruanganController.show);

registry.registerPath({
  method: "put",
  path: "/api/ruangan/{id}",
  tags: ["Ruangan"],
  summary: "Update Ruangan",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  request: {
    body: {
      content: {
        "application/json": { schema: updateRuanganSchema.shape.body },
      },
    },
  },
  responses: {
    200: {
      description: "Ruangan updated",
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
  validate(updateRuanganSchema),
  ruanganController.update,
);

registry.registerPath({
  method: "delete",
  path: "/api/ruangan/{id}",
  tags: ["Ruangan"],
  summary: "Delete Ruangan",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Ruangan deleted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), success: z.boolean() }),
        },
      },
    },
  },
});
router.delete("/:id", requireAuth, ruanganController.destroy);

export default router;
