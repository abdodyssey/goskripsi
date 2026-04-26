"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const openapi_generator_1 = require("../../utils/openapi-generator");
const comment_controller_1 = require("../controllers/comment.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const comment_schema_1 = require("../../schemas/comment.schema");
const router = (0, express_1.Router)();
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/comment",
    tags: ["Comment"],
    summary: "Get All Comments",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "List of Comments",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.array(zod_1.z.any()), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/", auth_middleware_1.requireAuth, comment_controller_1.commentController.index);
openapi_generator_1.registry.registerPath({
    method: "post",
    path: "/api/comment",
    tags: ["Comment"],
    summary: "Create Comment",
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "application/json": { schema: comment_schema_1.createCommentSchema.shape.body },
            },
        },
    },
    responses: {
        201: {
            description: "Comment created",
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
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(comment_schema_1.createCommentSchema), comment_controller_1.commentController.store);
openapi_generator_1.registry.registerPath({
    method: "get",
    path: "/api/comment/{id}",
    tags: ["Comment"],
    summary: "Get Comment by ID",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Comment details",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ data: zod_1.z.any(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.get("/:id", auth_middleware_1.requireAuth, comment_controller_1.commentController.show);
openapi_generator_1.registry.registerPath({
    method: "put",
    path: "/api/comment/{id}",
    tags: ["Comment"],
    summary: "Update Comment",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    request: {
        body: {
            content: {
                "application/json": { schema: comment_schema_1.updateCommentSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Comment updated",
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
router.put("/:id", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(comment_schema_1.updateCommentSchema), comment_controller_1.commentController.update);
openapi_generator_1.registry.registerPath({
    method: "delete",
    path: "/api/comment/{id}",
    tags: ["Comment"],
    summary: "Delete Comment",
    security: [{ bearerAuth: [] }],
    parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
    ],
    responses: {
        200: {
            description: "Comment deleted",
            content: {
                "application/json": {
                    schema: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                },
            },
        },
    },
});
router.delete("/:id", auth_middleware_1.requireAuth, comment_controller_1.commentController.destroy);
exports.default = router;
