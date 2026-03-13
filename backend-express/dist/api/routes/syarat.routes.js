"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const syarat_controller_1 = require("../controllers/syarat.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const syarat_schema_1 = require("../../schemas/syarat.schema");
const router = (0, express_1.Router)();
openapi_generator_1.registry.registerPath({
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
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, syarat_controller_1.syaratController.index);
openapi_generator_1.registry.registerPath({
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
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/jenis-ujian/:jenisUjianId", auth_middleware_1.requireAuth, syarat_controller_1.syaratController.getByJenisUjian);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/syarat",
    tags: ["Syarat"],
    summary: "Create Syarat",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: syarat_schema_1.createSyaratSchema.shape.body },
            },
        },
    },
    responses: {
        201: {
            description: "Syarat created",
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
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(syarat_schema_1.createSyaratSchema), syarat_controller_1.syaratController.store);
openapi_generator_1.registry.registerPath({
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
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/:id", auth_middleware_1.requireAuth, syarat_controller_1.syaratController.show);
openapi_generator_1.registry.registerPath({
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
                "application/json": { schema: syarat_schema_1.updateSyaratSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Syarat updated",
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
router.put("/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(syarat_schema_1.updateSyaratSchema), syarat_controller_1.syaratController.update);
openapi_generator_1.registry.registerPath({
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
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, syarat_controller_1.syaratController.destroy);
exports.default = router;
