"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const faq_controller_1 = require("../controllers/faq.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const faq_schema_1 = require("../../schemas/faq.schema");
const router = (0, express_1.Router)();
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/faq",
    tags: ["FAQ"],
    summary: "Get All FAQ",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "List of FAQ",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, faq_controller_1.faqController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/faq",
    tags: ["FAQ"],
    summary: "Create FAQ",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: { "application/json": { schema: faq_schema_1.createFaqSchema.shape.body } },
        },
    },
    responses: {
        201: {
            description: "FAQ created",
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
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(faq_schema_1.createFaqSchema), faq_controller_1.faqController.store);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/faq/{id}",
    tags: ["FAQ"],
    summary: "Get FAQ by ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "FAQ details",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/:id", auth_middleware_1.requireAuth, faq_controller_1.faqController.show);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/faq/{id}",
    tags: ["FAQ"],
    summary: "Update FAQ",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    request: {
        body: {
            content: { "application/json": { schema: faq_schema_1.updateFaqSchema.shape.body } },
        },
    },
    responses: {
        200: {
            description: "FAQ updated",
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
router.put("/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(faq_schema_1.updateFaqSchema), faq_controller_1.faqController.update);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/faq/{id}",
    tags: ["FAQ"],
    summary: "Delete FAQ",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "FAQ deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, faq_controller_1.faqController.destroy);
exports.default = router;
