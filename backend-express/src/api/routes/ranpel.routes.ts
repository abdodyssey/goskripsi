import { Router } from "express";
import { z } from "zod";
import { registry } from "../../utils/openapi-generator";
import { ranpelController } from "../controllers/ranpel.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createRanpelSchema,
  updateRanpelSchema,
  updatePengajuanRanpelSchema,
} from "../../schemas/ranpel.schema";

const router = Router();

// Pengajuan Ranpel Approval (Admin/Kaprodi)
registry.registerPath({
  method: "get",
  path: "/api/ranpel/pengajuan",
  tags: ["Ranpel Pengajuan"],
  summary: "Get All Pengajuan Ranpel",
  description:
    "Mengambil semua daftar pengajuan rancangan penelitian (Admin/Kaprodi).",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Daftar pengajuan ranpel",
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(z.any()),
            success: z.boolean().openapi({ example: true }),
          }),
        },
      },
    },
  },
});

router.get("/pengajuan", requireAuth, ranpelController.getAllPengajuan);

registry.registerPath({
  method: "put",
  path: "/api/ranpel/pengajuan/{id}",
  tags: ["Ranpel Pengajuan"],
  summary: "Update/Approve Pengajuan Ranpel",
  description:
    "Menyetujui, menolak, atau meminta revisi pada pengajuan ranpel.",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: updatePengajuanRanpelSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Status pengajuan berhasil diupdate",
      content: {
        "application/json": {
          schema: z.object({
            data: z.any(),
            success: z.boolean().openapi({ example: true }),
          }),
        },
      },
    },
  },
});

router.put(
  "/pengajuan/:id",
  requireAuth,
  validate(updatePengajuanRanpelSchema),
  ranpelController.updatePengajuan,
);

registry.registerPath({
  method: "delete",
  path: "/api/ranpel/pengajuan/{id}",
  tags: ["Ranpel Pengajuan"],
  summary: "Delete Pengajuan Ranpel",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Pengajuan deleted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), success: z.boolean() }),
        },
      },
    },
  },
});
router.delete("/pengajuan/:id", requireAuth, ranpelController.destroyPengajuan);

// PDF Export
router.get("/export-pdf/:id", requireAuth, ranpelController.exportPdf);

// Mahasiswa specific ranpel handling
registry.registerPath({
  method: "post",
  path: "/api/ranpel/mahasiswa/{id}",
  tags: ["Ranpel Pengajuan"],
  summary: "Submit Pengajuan Ranpel (Mahasiswa)",
  description: "Mahasiswa mengajukan rancangan penelitian baru.",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: "Mahasiswa ID" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: createRanpelSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Pengajuan berhasil dikirim",
      content: {
        "application/json": {
          schema: z.object({
            data: z.any(),
            success: z.boolean().openapi({ example: true }),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/ranpel/mahasiswa/{id}",
  tags: ["Ranpel Pengajuan"],
  summary: "Get Ranpel by Mahasiswa ID",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Ranpel details for Mahasiswa",
      content: {
        "application/json": {
          schema: z.object({ data: z.any(), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/mahasiswa/:id", requireAuth, ranpelController.getByMahasiswa);
router.post(
  "/mahasiswa/:id",
  requireAuth,
  validate(createRanpelSchema),
  ranpelController.storeByMahasiswa,
);

registry.registerPath({
  method: "put",
  path: "/api/ranpel/mahasiswa/ranpel/{ranpelId}",
  tags: ["Ranpel Pengajuan"],
  summary: "Update Ranpel by Mahasiswa",
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "ranpelId",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": { schema: updateRanpelSchema.shape.body },
      },
    },
  },
  responses: {
    200: {
      description: "Ranpel updated",
      content: {
        "application/json": {
          schema: z.object({ data: z.any(), success: z.boolean() }),
        },
      },
    },
  },
});
router.put(
  "/mahasiswa/ranpel/:ranpelId",
  requireAuth,
  validate(updateRanpelSchema),
  ranpelController.updateRanpelByMahasiswa,
);

// Core Ranpel APIs
registry.registerPath({
  method: "get",
  path: "/api/ranpel",
  tags: ["Ranpel"],
  summary: "Get All Ranpel",
  description: "Mengambil semua data rancangan penelitian.",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List Ranpel",
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(z.any()),
            success: z.boolean().openapi({ example: true }),
          }),
        },
      },
    },
  },
});

router.get("/", requireAuth, ranpelController.index);

registry.registerPath({
  method: "post",
  path: "/api/ranpel",
  tags: ["Ranpel"],
  summary: "Create New Ranpel",
  description: "Memasukkan data rancangan penelitian baru.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createRanpelSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Ranpel berhasil dibuat",
      content: {
        "application/json": {
          schema: z.object({
            data: z.any(),
            success: z.boolean().openapi({ example: true }),
          }),
        },
      },
    },
  },
});

router.post(
  "/",
  requireAuth,
  validate(createRanpelSchema),
  ranpelController.store,
);

registry.registerPath({
  method: "delete",
  path: "/api/ranpel/{id}",
  tags: ["Ranpel"],
  summary: "Delete Ranpel",
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: "id", in: "path", required: true, schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "Ranpel deleted",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), success: z.boolean() }),
        },
      },
    },
  },
});
router.delete("/:id", requireAuth, ranpelController.destroyRanpel);

export default router;
