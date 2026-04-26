"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const pejabat_controller_1 = require("../controllers/pejabat.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const pejabat_schema_1 = require("../../schemas/pejabat.schema");
const router = (0, express_1.Router)();
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/pejabat",
    tags: ["Pejabat"],
    summary: "Get All Pejabat",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "List of Pejabat",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, pejabat_controller_1.pejabatController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/pejabat",
    tags: ["Pejabat"],
    summary: "Create Pejabat",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: pejabat_schema_1.createPejabatSchema.shape.body },
            },
        },
    },
    responses: {
        201: {
            description: "Pejabat created",
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
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(pejabat_schema_1.createPejabatSchema), pejabat_controller_1.pejabatController.store);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/pejabat/{id}",
    tags: ["Pejabat"],
    summary: "Get Pejabat by ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Pejabat details",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/:id", auth_middleware_1.requireAuth, pejabat_controller_1.pejabatController.show);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/pejabat/{id}",
    tags: ["Pejabat"],
    summary: "Update Pejabat",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    request: {
        body: {
            content: {
                "application/json": { schema: pejabat_schema_1.updatePejabatSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Pejabat updated",
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
router.put("/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(pejabat_schema_1.updatePejabatSchema), pejabat_controller_1.pejabatController.update);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/pejabat/{id}",
    tags: ["Pejabat"],
    summary: "Delete Pejabat",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Pejabat deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, pejabat_controller_1.pejabatController.destroy);
exports.default = router;
