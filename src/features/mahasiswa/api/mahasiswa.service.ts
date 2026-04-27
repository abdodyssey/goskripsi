import { apiClient } from "@/lib/api-client";
import { Mahasiswa, Prodi } from "@/types/user.type";

export interface MahasiswaResponse {
  data: Mahasiswa[];
  success: boolean;
}

export interface SingleMahasiswaResponse {
  data: Mahasiswa;
  success: boolean;
}

export const mahasiswaService = {
  getAll: async (): Promise<MahasiswaResponse> => {
    const response = await apiClient.get<MahasiswaResponse>("/mahasiswa");
    return response.data;
  },

  getById: async (id: string): Promise<SingleMahasiswaResponse> => {
    const response = await apiClient.get<SingleMahasiswaResponse>(
      `/mahasiswa/${id}`,
    );
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<Mahasiswa>,
  ): Promise<SingleMahasiswaResponse> => {
    const response = await apiClient.patch<SingleMahasiswaResponse>(
      `/mahasiswa/${id}`,
      data,
    );
    return response.data;
  },

  getProdis: async (): Promise<{ data: Prodi[] }> => {
    const response = await apiClient.get<{ data: Prodi[] }>("/prodi");
    return response.data;
  },

  getDosens: async (): Promise<{ data: any[] }> => {
    const response = await apiClient.get<{ data: any[] }>("/dosen?role=dosen&limit=1000");
    return response.data;
  },

  getMyDocuments: async (): Promise<{
    data: { jenis: string; fileUrl: string }[];
  }> => {
    const response = await apiClient.get("/mahasiswa/my/documents");
    return response.data;
  },
};
