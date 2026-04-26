import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ujianService } from "../api/ujian.service";

export const useUjian = () => {
  const queryClient = useQueryClient();

  const useAllUjian = () =>
    useQuery({
      queryKey: ["all-ujian"],
      queryFn: () => ujianService.getAll(),
    });

  const useUjianByMahasiswa = (mahasiswaId: string) =>
    useQuery({
      queryKey: ["ujian-mahasiswa", mahasiswaId],
      queryFn: () => ujianService.getByMahasiswa(mahasiswaId),
      enabled: !!mahasiswaId,
    });

  const useSchedulingForm = (pendaftaranId: string) =>
    useQuery({
      queryKey: ["scheduling-form", pendaftaranId],
      queryFn: () => ujianService.getSchedulingForm(pendaftaranId),
      enabled: !!pendaftaranId,
    });

  const createSchedulingMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => ujianService.createScheduling(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-ujian"] });
      queryClient.invalidateQueries({ queryKey: ["pendaftaran-ujian"] });
    },
  });

  const updateSchedulingMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      ujianService.updateScheduling(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-ujian"] });
    },
  });

  const useUjianById = (id: string) =>
    useQuery({
      queryKey: ["ujian", id],
      queryFn: () => ujianService.getById(id),
      enabled: !!id,
    });

  const useFormPenilaian = (id: string) =>
    useQuery({
      queryKey: ["form-penilaian", id],
      queryFn: () => ujianService.getFormInputNilai(id),
      enabled: !!id,
    });

  const useKeputusanOptions = (id: string) =>
    useQuery({
      queryKey: ["keputusan-options", id],
      queryFn: () => ujianService.getDataKeputusan(id),
      enabled: !!id,
    });

  const submitAbsensiMutation = useMutation({
    mutationFn: ({ id, absensiList }: { id: string; absensiList: Record<string, unknown>[] }) =>
      ujianService.submitAbsensi(id, absensiList),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["ujian", id] });
    },
  });

  const simpanDraftNilaiMutation = useMutation({
    mutationFn: ({ id, penilaianList }: { id: string; penilaianList: Record<string, unknown>[] }) =>
      ujianService.simpanDraftNilai(id, penilaianList),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["form-penilaian", id] });
    },
  });

  const submitNilaiFinalMutation = useMutation({
    mutationFn: ({ id, penilaianList }: { id: string; penilaianList: Record<string, unknown>[] }) =>
      ujianService.submitNilaiFinal(id, penilaianList),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["form-penilaian", id] });
      queryClient.invalidateQueries({ queryKey: ["ujian", id] });
    },
  });

  const finalisasiNilaiMutation = useMutation({
    mutationFn: (id: string) => ujianService.finalisasiNilai(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["ujian", id] });
      queryClient.invalidateQueries({ queryKey: ["form-penilaian", id] });
    },
  });

  const submitKeputusanMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      ujianService.submitKeputusan(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["ujian", id] });
    },
  });

  return {
    useAllUjian,
    useUjianByMahasiswa,
    useSchedulingForm,
    createScheduling: createSchedulingMutation.mutateAsync,
    isCreating: createSchedulingMutation.isPending,
    updateScheduling: updateSchedulingMutation.mutateAsync,
    isUpdating: updateSchedulingMutation.isPending,
    useUjianById,
    useFormPenilaian,
    useKeputusanOptions,
    submitAbsensi: submitAbsensiMutation.mutateAsync,
    isSubmittingAbsensi: submitAbsensiMutation.isPending,
    simpanDraftNilai: simpanDraftNilaiMutation.mutateAsync,
    isSavingDraft: simpanDraftNilaiMutation.isPending,
    submitNilaiFinal: submitNilaiFinalMutation.mutateAsync,
    isSubmittingFinal: submitNilaiFinalMutation.isPending,
    finalisasiNilaiStatus: finalisasiNilaiMutation, // export full mutation for better state access
    finalisasiNilai: finalisasiNilaiMutation.mutateAsync,
    isFinalizing: finalisasiNilaiMutation.isPending,
    submitKeputusan: submitKeputusanMutation.mutateAsync,
    isSubmittingKeputusan: submitKeputusanMutation.isPending,
  };
};
