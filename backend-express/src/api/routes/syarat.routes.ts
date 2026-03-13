import { Router } from "express";
import { z } from "zod";
import { registry } from "../../utils/openapi-generator";
import { syaratController } from "../controllers/syarat.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createSyaratSchema,
  updateSyaratSchema,
} from "../../schemas/syarat.schema";

const router = Router();

registry.registerPath({
  method: "get",
  path: "/api/syarat",
  tags: ["Syarat"],
  summary: "Get All Syarat",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of Syarat",
      content: {
        "application/json": {
          schema: z.object({ data: z.array(z.any()), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/", requireAuth, syaratController.index);

registry.registerPath({
  method: "get",
  path: "/api/syarat/jenis-ujian/{jenisUjianId}",
  tags: ["Syarat"],
  summary: "Get Syarat by Jenis Ujian ID",
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "jenisUjianId",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: {
      description: "List of Syarat for a specific Jenis Ujian",
      content: {
        "application/json": {
          schema: z.object({ data: z.array(z.any()), success: z.boolean() }),
        },
      },
    },
  },
});
router.get(
  "/jenis-ujian/:jenisUjianId",
  requireAuth,
  syaratController.getByJenisUjian,
);

registry.registerPath({
  method: "post",
  path: "/api/syarat",
  tags: ["Syarat"],
  summary: "Create Syarat",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: createSyaratSchema.shape.body },
      },
    },
  },
  responses: {
    201: {
      description: "Syarat created",
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
  validate(createSyaratSchema),
  syaratController.store,
);

registry.registerPath({
  method: "get",
  path: "/api/syarat/{id}",
  tags: ["Syarat"],
  summary: "Get Syarat by ID",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Syarat details",
      content: {
        "application/json": {
          schema: z.object({ data: z.any(), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/:id", requireAuth, syaratController.show);

registry.registerPath({
  method: "put",
  path: "/api/syarat/{id}",
  tags: ["Syarat"],
  summary: "Update Syarat",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  request: {
    body: {
      content: {
        "application/json": { schema: updateSyaratSchema.shape.body },
      },
    },
  },
  responses: {
    200: {
      description: "Syarat updated",
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
  validate(updateSyaratSchema),
  syaratController.update,
);

registry.registerPath({
  method: "delete",
  path: "/api/syarat/{id}",
  tags: ["Syarat"],
  summary: "Delete Syarat",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Syarat deleted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), success: z.boolean() }),
        },
      },
    },
  },
});
router.delete("/:id", requireAuth, syaratController.destroy);

export default router;
