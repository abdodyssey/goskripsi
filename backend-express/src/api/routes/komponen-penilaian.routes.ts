import { Router } from "express";
import { z } from "zod";
import { registry } from "../../utils/openapi-generator";
import { komponenPenilaianController } from "../controllers/komponen-penilaian.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createKomponenPenilaianSchema,
  updateKomponenPenilaianSchema,
} from "../../schemas/komponen-penilaian.schema";

const router = Router();

registry.registerPath({
  method: "get",
  path: "/api/komponen-penilaian",
  tags: ["Komponen Penilaian"],
  summary: "Get All Komponen Penilaian",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of Komponen Penilaian",
      content: {
        "application/json": {
          schema: z.object({ data: z.array(z.any()), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/", requireAuth, komponenPenilaianController.index);

registry.registerPath({
  method: "post",
  path: "/api/komponen-penilaian",
  tags: ["Komponen Penilaian"],
  summary: "Create Komponen Penilaian",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createKomponenPenilaianSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Komponen Penilaian created",
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
  validate(createKomponenPenilaianSchema),
  komponenPenilaianController.store,
);

registry.registerPath({
  method: "get",
  path: "/api/komponen-penilaian/{id}",
  tags: ["Komponen Penilaian"],
  summary: "Get Komponen Penilaian by ID",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Komponen Penilaian details",
      content: {
        "application/json": {
          schema: z.object({ data: z.any(), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/:id", requireAuth, komponenPenilaianController.show);

registry.registerPath({
  method: "put",
  path: "/api/komponen-penilaian/{id}",
  tags: ["Komponen Penilaian"],
  summary: "Update Komponen Penilaian",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateKomponenPenilaianSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Komponen Penilaian updated",
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
  validate(updateKomponenPenilaianSchema),
  komponenPenilaianController.update,
);

registry.registerPath({
  method: "delete",
  path: "/api/komponen-penilaian/{id}",
  tags: ["Komponen Penilaian"],
  summary: "Delete Komponen Penilaian",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Komponen Penilaian deleted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), success: z.boolean() }),
        },
      },
    },
  },
});
router.delete("/:id", requireAuth, komponenPenilaianController.destroy);

export default router;
