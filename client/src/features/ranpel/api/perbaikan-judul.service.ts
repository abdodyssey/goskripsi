import { apiClient } from "@/lib/api-client";
import { PerbaikanJudulResponse } from "../types/perbaikan-judul.type";

export const perbaikanJudulService = {
  getAll: async (): Promise<PerbaikanJudulResponse> => {
    const response = await apiClient.get("/perbaikan-judul");
    return response.data;
  },

  getMyRequests: async (): Promise<PerbaikanJudulResponse> => {
    const response = await apiClient.get("/perbaikan-judul/me");
    return response.data;
  },

  submit: async (data: {
    judulLama: string;
    judulBaru: string;
    fileSurat: string;
  }): Promise<PerbaikanJudulResponse> => {
    const response = await apiClient.post("/perbaikan-judul", data);
    return response.data;
  },

  review: async (
    id: number,
    data: {
      status: string;
      catatanSekprodi?: string;
    }
  ): Promise<PerbaikanJudulResponse> => {
    const response = await apiClient.patch(`/perbaikan-judul/${id}`, data);
    return response.data;
  },
};
