import { Router } from "express";
import { z } from "zod";
import { registry } from "../../utils/openapi-generator";
import { fakultasController } from "../controllers/fakultas.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createFakultasSchema,
  updateFakultasSchema,
} from "../../schemas/fakultas.schema";

const router = Router();

registry.registerPath({
  method: "get",
  path: "/api/fakultas",
  tags: ["Fakultas"],
  summary: "Get All Fakultas",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of Fakultas",
      content: {
        "application/json": {
          schema: z.object({ data: z.array(z.any()), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/", requireAuth, fakultasController.index);

registry.registerPath({
  method: "post",
  path: "/api/fakultas",
  tags: ["Fakultas"],
  summary: "Create Fakultas",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: createFakultasSchema.shape.body },
      },
    },
  },
  responses: {
    201: {
      description: "Fakultas created",
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
  validate(createFakultasSchema),
  fakultasController.store,
);

registry.registerPath({
  method: "get",
  path: "/api/fakultas/{id}",
  tags: ["Fakultas"],
  summary: "Get Fakultas by ID",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Fakultas details",
      content: {
        "application/json": {
          schema: z.object({ data: z.any(), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/:id", requireAuth, fakultasController.show);

registry.registerPath({
  method: "put",
  path: "/api/fakultas/{id}",
  tags: ["Fakultas"],
  summary: "Update Fakultas",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  request: {
    body: {
      content: {
        "application/json": { schema: updateFakultasSchema.shape.body },
      },
    },
  },
  responses: {
    200: {
      description: "Fakultas updated",
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
  validate(updateFakultasSchema),
  fakultasController.update,
);

registry.registerPath({
  method: "delete",
  path: "/api/fakultas/{id}",
  tags: ["Fakultas"],
  summary: "Delete Fakultas",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Fakultas deleted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), success: z.boolean() }),
        },
      },
    },
  },
});
router.delete("/:id", requireAuth, fakultasController.destroy);

export default router;
