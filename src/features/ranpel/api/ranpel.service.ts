import { apiClient } from "@/lib/api-client";
import { CreateRanpelFormValues } from "../schemas/ranpel.schema";
import {
  PengajuanRancanganPenelitian,
  PengajuanRanpelResponse,
} from "../types/ranpel.type";

export const ranpelService = {
  getPengajuanByMahasiswa: async (
    mahasiswaId: string,
  ): Promise<PengajuanRanpelResponse> => {
    const response = await apiClient.get<PengajuanRanpelResponse>(
      `/ranpel/mahasiswa/${mahasiswaId}`,
    );
    return response.data;
  },

  getAllPengajuan: async (limit: number = 10, skip: number = 0): Promise<PengajuanRancanganPenelitian[]> => {
    const response = await apiClient.get<{
      data: PengajuanRancanganPenelitian[];
    }>(`/ranpel/pengajuan?limit=${limit}&skip=${skip}`);
    return response.data.data;
  },

  createPengajuanByMahasiswa: async (
    mahasiswaId: string,
    data: CreateRanpelFormValues,
  ): Promise<PengajuanRanpelResponse> => {
    const response = await apiClient.post<PengajuanRanpelResponse>(
      `/ranpel/mahasiswa/${mahasiswaId}`,
      data,
    );
    return response.data;
  },

  deletePengajuan: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/ranpel/pengajuan/${id}`,
    );
    return response.data;
  },

  updateRanpel: async (
    ranpelId: string,
    data: Partial<CreateRanpelFormValues>,
  ): Promise<unknown> => {
    const response = await apiClient.put(
      `/ranpel/mahasiswa/ranpel/${ranpelId}`,
      data,
    );
    return response.data;
  },

  updatePengajuan: async (
    id: string,
    data: {
      status?: string;
      status_dosen_pa?: string;
      status_kaprodi?: string;
      keterangan?: string;
      catatan_dosen_pa?: string | null;
      catatan_kaprodi?: string | null;
      komen_pa_masalah?: string | null;
      komen_pa_solusi?: string | null;
      komen_pa_hasil?: string | null;
      komen_pa_data?: string | null;
      komen_pa_metode?: string | null;
      komen_kpr_masalah?: string | null;
      komen_kpr_solusi?: string | null;
      komen_kpr_hasil?: string | null;
      komen_kpr_data?: string | null;
      komen_kpr_metode?: string | null;
    },
  ): Promise<unknown> => {
    const response = await apiClient.put(`/ranpel/pengajuan/${id}`, data);
    return response.data;
  },
};
