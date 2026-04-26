import { z } from "zod";

// * username (Mandatory)
// * password (Mandatory)
export const loginSchema = z.object({
  username: z.string().min(1, { message: "Username wajib diisi" }),
  password: z.string().min(1, { message: "Kata sandi wajib diisi" }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const updateProfileSchema = z.object({
  nama: z.string().optional(),
  email: z.string().email().optional(),
  no_hp: z.string().optional().nullable(),
  alamat: z.string().optional().nullable(),
  url_ttd: z.string().url().optional().nullable(),
  foto: z.string().optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Kata sandi saat ini wajib diisi"),
    new_password: z.string().min(8, "Kata sandi baru minimal 8 karakter"),
    new_password_confirmation: z
      .string()
      .min(8, "Konfirmasi kata sandi minimal 8 karakter"),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["new_password_confirmation"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
