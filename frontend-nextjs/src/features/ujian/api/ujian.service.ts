import { apiClient } from "@/lib/api-client";

export const ujianService = {
  getAll: async () => {
    const response = await apiClient.get("/ujian");
    return response.data;
  },

  getByMahasiswa: async (mahasiswaId: string) => {
    const response = await apiClient.get(`/ujian/mahasiswa/${mahasiswaId}`);
    return response.data;
  },

  getSchedulingForm: async (pendaftaranId: string) => {
    const response = await apiClient.get(
      `/ujian/scheduling/${pendaftaranId}/form`,
    );
    return response.data;
  },

  createScheduling: async (payload: any) => {
    const response = await apiClient.post("/ujian/scheduling", payload);
    return response.data;
  },

  updateScheduling: async (id: string, payload: any) => {
    const response = await apiClient.put(`/ujian/scheduling/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/ujian/${id}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/ujian/${id}`);
    return response.data;
  },

  submitAbsensi: async (id: string, absensiList: any[]) => {
    const response = await apiClient.post(`/ujian/${id}/absensi`, {
      absensiList,
    });
    return response.data;
  },

  getFormInputNilai: async (id: string) => {
    const response = await apiClient.get(`/ujian/${id}/form-penilaian`);
    return response.data;
  },

  simpanDraftNilai: async (id: string, penilaianList: any[]) => {
    const response = await apiClient.post(`/ujian/${id}/nilai-draft`, {
      penilaianList,
    });
    return response.data;
  },

  submitNilaiFinal: async (id: string, penilaianList: any[]) => {
    const response = await apiClient.post(`/ujian/${id}/nilai-final`, {
      penilaianList,
    });
    return response.data;
  },

  finalisasiNilai: async (id: string) => {
    const response = await apiClient.post(`/ujian/${id}/finalisasi`);
    return response.data;
  },

  getDataKeputusan: async (id: string) => {
    const response = await apiClient.get(`/ujian/${id}/keputusan-options`);
    return response.data;
  },

  submitKeputusan: async (id: string, payload: any) => {
    const response = await apiClient.post(`/ujian/${id}/keputusan`, payload);
    return response.data;
  },

  downloadJadwalPdf: async () => {
    const response = await apiClient.get("/ujian/pdf/jadwal", {
      responseType: "blob",
    });
    return response.data;
  },
};
