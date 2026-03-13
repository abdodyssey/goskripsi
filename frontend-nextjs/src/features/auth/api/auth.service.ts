import { apiClient } from "@/lib/api-client";
import { AuthResponse } from "@/types/user.type";
import {
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from "../schemas/auth.schema";

export const authService = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/login", data);
    return response.data;
  },

  getProfile: async (): Promise<AuthResponse> => {
    const response = await apiClient.get<AuthResponse>("/me");
    return response.data;
  },

  changePassword: async (data: ChangePasswordInput): Promise<any> => {
    const response = await apiClient.post("/change-password", data);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileInput): Promise<AuthResponse> => {
    const response = await apiClient.patch<AuthResponse>("/profile", data);
    return response.data;
  },
};
