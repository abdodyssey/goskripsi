import { Router } from "express";
import { z } from "zod";
import { registry } from "../../utils/openapi-generator";
import { prodiController } from "../controllers/prodi.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createProdiSchema,
  updateProdiSchema,
} from "../../schemas/prodi.schema";

const router = Router();

registry.registerPath({
  method: "get",
  path: "/api/prodi",
  tags: ["Prodi"],
  summary: "Get All Prodi",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of Prodi",
      content: {
        "application/json": {
          schema: z.object({ data: z.array(z.any()), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/", requireAuth, prodiController.index);

registry.registerPath({
  method: "post",
  path: "/api/prodi",
  tags: ["Prodi"],
  summary: "Create Prodi",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: createProdiSchema.shape.body } },
    },
  },
  responses: {
    201: {
      description: "Prodi created",
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
  validate(createProdiSchema),
  prodiController.store,
);

registry.registerPath({
  method: "get",
  path: "/api/prodi/{id}",
  tags: ["Prodi"],
  summary: "Get Prodi by ID",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Prodi details",
      content: {
        "application/json": {
          schema: z.object({ data: z.any(), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/:id", requireAuth, prodiController.show);

registry.registerPath({
  method: "put",
  path: "/api/prodi/{id}",
  tags: ["Prodi"],
  summary: "Update Prodi",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  request: {
    body: {
      content: { "application/json": { schema: updateProdiSchema.shape.body } },
    },
  },
  responses: {
    200: {
      description: "Prodi updated",
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
  validate(updateProdiSchema),
  prodiController.update,
);

registry.registerPath({
  method: "delete",
  path: "/api/prodi/{id}",
  tags: ["Prodi"],
  summary: "Delete Prodi",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Prodi deleted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), success: z.boolean() }),
        },
      },
    },
  },
});
router.delete("/:id", requireAuth, prodiController.destroy);

export default router;
