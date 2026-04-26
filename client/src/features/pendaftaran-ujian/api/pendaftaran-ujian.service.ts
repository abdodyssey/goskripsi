import { apiClient } from "@/lib/api-client";
import {
  PendaftaranUjianResponse,
  JenisUjian,
  Syarat,
} from "../types/pendaftaran-ujian.type";

export const pendaftaranUjianService = {
  getByMahasiswa: async (
    mahasiswaId: string,
  ): Promise<PendaftaranUjianResponse> => {
    const response = await apiClient.get<PendaftaranUjianResponse>(
      `/pendaftaran-ujian/mahasiswa/${mahasiswaId}`,
    );
    return response.data;
  },

  getAll: async (): Promise<PendaftaranUjianResponse> => {
    const response =
      await apiClient.get<PendaftaranUjianResponse>(`/pendaftaran-ujian`);
    return response.data;
  },

  create: async (formData: FormData): Promise<PendaftaranUjianResponse> => {
    const response = await apiClient.post<PendaftaranUjianResponse>(
      `/pendaftaran-ujian`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/pendaftaran-ujian/${id}`,
    );
    return response.data;
  },

  getJenisUjian: async (): Promise<{
    data: JenisUjian[];
    success: boolean;
  }> => {
    const response = await apiClient.get<{
      data: JenisUjian[];
      success: boolean;
    }>(`/jenis-ujian`);
    return response.data;
  },

  getSyaratByJenisUjian: async (
    jenisUjianId: string,
  ): Promise<{ data: Syarat[]; success: boolean }> => {
    const response = await apiClient.get<{
      data: Syarat[];
      success: boolean;
    }>(`/syarat/jenis-ujian/${jenisUjianId}`);
    return response.data;
  },

  submit: async (id: string): Promise<PendaftaranUjianResponse> => {
    const response = await apiClient.post<PendaftaranUjianResponse>(
      `/pendaftaran-ujian/${id}/submit`,
    );
    return response.data;
  },

  review: async (
    id: string,
    payload: { status: string; keterangan: string },
  ): Promise<PendaftaranUjianResponse> => {
    const response = await apiClient.post<PendaftaranUjianResponse>(
      `/pendaftaran-ujian/${id}/review`,
      payload,
    );
    return response.data;
  },

  uploadRevisi: async (
    id: string,
    formData: FormData,
  ): Promise<PendaftaranUjianResponse> => {
    const response = await apiClient.post<PendaftaranUjianResponse>(
      `/pendaftaran-ujian/${id}/upload-revisi`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },
};
