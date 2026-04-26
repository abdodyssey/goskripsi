import { Router } from "express";
import { z } from "zod";
import { registry } from "../../utils/openapi-generator";
import { dosenController } from "../controllers/dosen.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createDosenSchema,
  updateDosenSchema,
} from "../../schemas/dosen.schema";

const router = Router();

// Custom endpoints placed before variable params path

// apiResource pattern Dosen endpoints
registry.registerPath({
  method: "get",
  path: "/api/dosen",
  tags: ["Dosen"],
  summary: "Get All Dosen",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of Dosen",
      content: {
        "application/json": {
          schema: z.object({ data: z.array(z.any()), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/", requireAuth, dosenController.index);

registry.registerPath({
  method: "post",
  path: "/api/dosen",
  tags: ["Dosen"],
  summary: "Create Dosen",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: createDosenSchema.shape.body } },
    },
  },
  responses: {
    201: {
      description: "Dosen created",
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
  validate(createDosenSchema),
  dosenController.store,
);

registry.registerPath({
  method: "get",
  path: "/api/dosen/{id}",
  tags: ["Dosen"],
  summary: "Get Dosen by ID",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Dosen details",
      content: {
        "application/json": {
          schema: z.object({ data: z.any(), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/:id", requireAuth, dosenController.show);

registry.registerPath({
  method: "put",
  path: "/api/dosen/{id}",
  tags: ["Dosen"],
  summary: "Update Dosen",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  request: {
    body: {
      content: { "application/json": { schema: updateDosenSchema.shape.body } },
    },
  },
  responses: {
    200: {
      description: "Dosen updated",
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
  validate(updateDosenSchema),
  dosenController.update,
);

registry.registerPath({
  method: "delete",
  path: "/api/dosen/{id}",
  tags: ["Dosen"],
  summary: "Delete Dosen",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Dosen deleted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), success: z.boolean() }),
        },
      },
    },
  },
});
router.delete("/:id", requireAuth, dosenController.destroy);

export default router;
