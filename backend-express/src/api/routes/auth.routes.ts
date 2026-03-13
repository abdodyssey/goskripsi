import { Router } from "express";
import { z } from "zod";
import { registry } from "../../utils/openapi-generator";
import { authController } from "../controllers/auth.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "../../schemas/auth.schema";

const router = Router();

// Public Routes
registry.registerPath({
  method: "post",
  path: "/api/login",
  tags: ["Auth"],
  summary: "User Login",
  description: "Authentikasi user menggunakan NIP/NIM dan Password.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login berhasil",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi({ example: "Login berhasil" }),
            success: z.boolean().openapi({ example: true }),
            token_type: z.string().openapi({ example: "Bearer" }),
            user: z.object({
              id: z.string().openapi({ example: "1" }),
              nip_nim: z.string().openapi({ example: "kaprodi_tif" }),
              nama: z.string().openapi({ example: "Dr. Budi (Kaprodi)" }),
            }),
          }),
        },
      },
    },
  },
});

router.post("/login", validate(loginSchema), authController.login);
registry.registerPath({
  method: "post",
  path: "/api/logout",
  tags: ["Auth"],
  summary: "User Logout",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Logout berhasil",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), success: z.boolean() }),
        },
      },
    },
  },
});
router.post("/logout", requireAuth, authController.logout);

// Protected Routes
registry.registerPath({
  method: "post",
  path: "/api/change-password",
  tags: ["Auth"],
  summary: "Change Password",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: changePasswordSchema.shape.body },
      },
    },
  },
  responses: {
    200: {
      description: "Password berhasil diubah",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), success: z.boolean() }),
        },
      },
    },
  },
});
router.post(
  "/change-password",
  requireAuth,
  validate(changePasswordSchema),
  authController.changePassword,
);

registry.registerPath({
  method: "get",
  path: "/api/me",
  tags: ["Auth"],
  summary: "Get Current User Profile",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "User profile details",
      content: {
        "application/json": {
          schema: z.object({ data: z.any(), success: z.boolean() }),
        },
      },
    },
  },
});
router.get("/user", requireAuth, authController.getMe);
router.get("/me", requireAuth, authController.getMe);

registry.registerPath({
  method: "patch",
  path: "/api/profile",
  tags: ["Auth"],
  summary: "Update User Profile",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: updateProfileSchema.shape.body },
      },
    },
  },
  responses: {
    200: {
      description: "Profile updated successfully",
      content: {
        "application/json": {
          schema: z.object({ data: z.any(), success: z.boolean() }),
        },
      },
    },
  },
});
router.patch(
  "/profile",
  requireAuth,
  validate(updateProfileSchema),
  authController.updateProfile,
);

export default router;
