import { Router } from "express";
import { z } from "zod";
import { registry } from "../../utils/openapi-generator";
import { pemenuhanSyaratController } from "../controllers/pemenuhan-syarat.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createPemenuhanSyaratSchema,
  updatePemenuhanSyaratSchema,
} from "../../schemas/pemenuhan-syarat.schema";

const router = Router();

registry.registerPath({
  method: "get",
  path: "/api/pemenuhan-syarat",
  tags: ["Pemenuhan Syarat"],
  summary: "Get All Pemenuhan Syarat",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of Pemenuhan Syarat",
      content: {
        "application/json": {
          schema: z.object({ data: z.array(z.any()), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/", requireAuth, pemenuhanSyaratController.index);

registry.registerPath({
  method: "post",
  path: "/api/pemenuhan-syarat",
  tags: ["Pemenuhan Syarat"],
  summary: "Create Pemenuhan Syarat",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: createPemenuhanSyaratSchema.shape.body },
      },
    },
  },
  responses: {
    201: {
      description: "Pemenuhan Syarat created",
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
  validate(createPemenuhanSyaratSchema),
  pemenuhanSyaratController.store,
);

registry.registerPath({
  method: "get",
  path: "/api/pemenuhan-syarat/{id}",
  tags: ["Pemenuhan Syarat"],
  summary: "Get Pemenuhan Syarat by ID",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Pemenuhan Syarat details",
      content: {
        "application/json": {
          schema: z.object({ data: z.any(), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/:id", requireAuth, pemenuhanSyaratController.show);

registry.registerPath({
  method: "put",
  path: "/api/pemenuhan-syarat/{id}",
  tags: ["Pemenuhan Syarat"],
  summary: "Update Pemenuhan Syarat",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  request: {
    body: {
      content: {
        "application/json": { schema: updatePemenuhanSyaratSchema.shape.body },
      },
    },
  },
  responses: {
    200: {
      description: "Pemenuhan Syarat updated",
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
  validate(updatePemenuhanSyaratSchema),
  pemenuhanSyaratController.update,
);

registry.registerPath({
  method: "delete",
  path: "/api/pemenuhan-syarat/{id}",
  tags: ["Pemenuhan Syarat"],
  summary: "Delete Pemenuhan Syarat",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Pemenuhan Syarat deleted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), success: z.boolean() }),
        },
      },
    },
  },
});
router.delete("/:id", requireAuth, pemenuhanSyaratController.destroy);

export default router;
