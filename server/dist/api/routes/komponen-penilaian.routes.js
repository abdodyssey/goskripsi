"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const komponen_penilaian_controller_1 = require("../controllers/komponen-penilaian.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const komponen_penilaian_schema_1 = require("../../schemas/komponen-penilaian.schema");
const router = (0, express_1.Router)();
openapi_generator_1.registry.registerPath({
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
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, komponen_penilaian_controller_1.komponenPenilaianController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/komponen-penilaian",
    tags: ["Komponen Penilaian"],
    summary: "Create Komponen Penilaian",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: komponen_penilaian_schema_1.createKomponenPenilaianSchema.shape.body,
                },
            },
        },
    },
    responses: {
        201: {
            description: "Komponen Penilaian created",
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        data: zod_1.z.any(),
                        message: zod_1.z.string(),
                        success: zod_1.z.boolean(),
                    }),
                },
            },
        },
    },
});
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(komponen_penilaian_schema_1.createKomponenPenilaianSchema), komponen_penilaian_controller_1.komponenPenilaianController.store);
openapi_generator_1.registry.registerPath({
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
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/:id", auth_middleware_1.requireAuth, komponen_penilaian_controller_1.komponenPenilaianController.show);
openapi_generator_1.registry.registerPath({
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
                    schema: komponen_penilaian_schema_1.updateKomponenPenilaianSchema.shape.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Komponen Penilaian updated",
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        data: zod_1.z.any(),
                        message: zod_1.z.string(),
                        success: zod_1.z.boolean(),
                    }),
                },
            },
        },
    },
});
router.put("/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(komponen_penilaian_schema_1.updateKomponenPenilaianSchema), komponen_penilaian_controller_1.komponenPenilaianController.update);
openapi_generator_1.registry.registerPath({
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
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, komponen_penilaian_controller_1.komponenPenilaianController.destroy);
exports.default = router;
