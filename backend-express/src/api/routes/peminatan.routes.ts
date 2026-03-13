import { Router } from "express";
import { z } from "zod";
import { registry } from "../../utils/openapi-generator";
import { peminatanController } from "../controllers/peminatan.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createPeminatanSchema,
  updatePeminatanSchema,
} from "../../schemas/peminatan.schema";

const router = Router();

registry.registerPath({
  method: "get",
  path: "/api/peminatan",
  tags: ["Peminatan"],
  summary: "Get All Peminatan",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of Peminatan",
      content: {
        "application/json": {
          schema: z.object({ data: z.array(z.any()), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/", requireAuth, peminatanController.index);

registry.registerPath({
  method: "post",
  path: "/api/peminatan",
  tags: ["Peminatan"],
  summary: "Create Peminatan",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: createPeminatanSchema.shape.body },
      },
    },
  },
  responses: {
    201: {
      description: "Peminatan created",
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
  validate(createPeminatanSchema),
  peminatanController.store,
);

registry.registerPath({
  method: "get",
  path: "/api/peminatan/{id}",
  tags: ["Peminatan"],
  summary: "Get Peminatan by ID",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Peminatan details",
      content: {
        "application/json": {
          schema: z.object({ data: z.any(), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/:id", requireAuth, peminatanController.show);

registry.registerPath({
  method: "put",
  path: "/api/peminatan/{id}",
  tags: ["Peminatan"],
  summary: "Update Peminatan",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  request: {
    body: {
      content: {
        "application/json": { schema: updatePeminatanSchema.shape.body },
      },
    },
  },
  responses: {
    200: {
      description: "Peminatan updated",
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
  validate(updatePeminatanSchema),
  peminatanController.update,
);

registry.registerPath({
  method: "delete",
  path: "/api/peminatan/{id}",
  tags: ["Peminatan"],
  summary: "Delete Peminatan",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Peminatan deleted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), success: z.boolean() }),
        },
      },
    },
  },
});
router.delete("/:id", requireAuth, peminatanController.destroy);

export default router;
