"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../api/auth.service";
import { AuthResponse } from "@/types/user.type";
import {
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from "../schemas/auth.schema";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import React from "react";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: (res) => {
      const token = res.access_token || res.token;
      if (token && token !== "undefined") {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      router.push("/dashboard");
    },
    onError: () => {
      notifications.show({
        title: "Gagal Masuk",
        message: "Username atau kata sandi salah. Silakan coba lagi.",
        color: "red",
        icon: React.createElement(IconX, { size: 18 }),
      });
    },
  });

  const profileQuery = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => authService.getProfile(),
    retry: false,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.removeQueries({ queryKey: ["user-profile"] });
    router.push("/auth/login");
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileInput) => authService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordInput) => authService.changePassword(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      notifications.show({
        title: "Berhasil",
        message: "Kata sandi Anda telah diperbarui.",
        color: "green",
      });
    },

    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      notifications.show({
        title: "Gagal Mengubah Kata Sandi",
        message:
          error.response?.data?.message ||
          "Terjadi kesalahan saat mengubah kata sandi.",
        color: "red",
        icon: React.createElement(IconX, { size: 18 }),
      });
    },
  });

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    changePassword: changePasswordMutation.mutate,
    changePasswordAsync: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    error: loginMutation.error,
    userResponse: profileQuery.data as AuthResponse | undefined,
    isLoadingProfile: profileQuery.isLoading,
    isAuthenticated: !!profileQuery.data,
    isDefaultPassword: profileQuery.data?.is_default_password || false,
    logout,
  };
};
