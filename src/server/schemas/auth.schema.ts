import { z } from "zod";
import { registry } from "../utils/openapi-generator";

export const loginSchema = z.object({
  body: z
    .object({
      username: z
        .string()
        .min(1, "Username is required")
        .openapi({ example: "kaprodi_tif" }),
      password: z.string().min(1, "Password is required").openapi({
        example: "password123",
        type: "string",
        format: "password",
      }),
    })
    .openapi("LoginRequest"),
});

registry.register("LoginRequest", loginSchema.shape.body);

export const changePasswordSchema = z.object({
  body: z
    .object({
      current_password: z.string().min(1, "Current password is required"),
      new_password: z
        .string()
        .min(8, "New password must be at least 8 characters"),
      new_password_confirmation: z
        .string()
        .min(8, "Confirmation must be at least 8 characters"),
    })
    .refine((data) => data.new_password === data.new_password_confirmation, {
      message: "Passwords don't match",
      path: ["new_password_confirmation"],
    }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    nama: z.string().optional(),
    email: z.string().email().optional(),
    no_hp: z.string().optional().nullable(),
    alamat: z.string().optional().nullable(),
    url_ttd: z.string().url().optional().nullable(),
    foto: z.string().optional().nullable(),
    ipk: z.number().optional().nullable(),
    semester: z.number().int().optional().nullable(),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
