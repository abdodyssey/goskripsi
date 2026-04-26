import { Router } from "express";
import { z } from "zod";
import { registry } from "../../utils/openapi-generator";
import { keputusanController } from "../controllers/keputusan.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createKeputusanSchema,
  updateKeputusanSchema,
} from "../../schemas/keputusan.schema";

const router = Router();

registry.registerPath({
  method: "get",
  path: "/api/keputusan",
  tags: ["Keputusan"],
  summary: "Get All Keputusan",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of Keputusan",
      content: {
        "application/json": {
          schema: z.object({ data: z.array(z.any()), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/", requireAuth, keputusanController.index);

registry.registerPath({
  method: "post",
  path: "/api/keputusan",
  tags: ["Keputusan"],
  summary: "Create Keputusan",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: createKeputusanSchema.shape.body },
      },
    },
  },
  responses: {
    201: {
      description: "Keputusan created",
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
  validate(createKeputusanSchema),
  keputusanController.store,
);

registry.registerPath({
  method: "get",
  path: "/api/keputusan/{id}",
  tags: ["Keputusan"],
  summary: "Get Keputusan by ID",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Keputusan details",
      content: {
        "application/json": {
          schema: z.object({ data: z.any(), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/:id", requireAuth, keputusanController.show);

registry.registerPath({
  method: "put",
  path: "/api/keputusan/{id}",
  tags: ["Keputusan"],
  summary: "Update Keputusan",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  request: {
    body: {
      content: {
        "application/json": { schema: updateKeputusanSchema.shape.body },
      },
    },
  },
  responses: {
    200: {
      description: "Keputusan updated",
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
  validate(updateKeputusanSchema),
  keputusanController.update,
);

registry.registerPath({
  method: "delete",
  path: "/api/keputusan/{id}",
  tags: ["Keputusan"],
  summary: "Delete Keputusan",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Keputusan deleted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), success: z.boolean() }),
        },
      },
    },
  },
});
router.delete("/:id", requireAuth, keputusanController.destroy);

export default router;
