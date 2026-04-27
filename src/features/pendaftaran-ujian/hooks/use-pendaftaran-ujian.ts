import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pendaftaranUjianService } from "../api/pendaftaran-ujian.service";

export const usePendaftaranUjianByMahasiswa = (mahasiswaId?: string) => {
  const queryClient = useQueryClient();

  const pendaftaranQuery = useQuery({
    queryKey: ["pendaftaran-ujian", mahasiswaId],
    queryFn: () =>
      pendaftaranUjianService.getByMahasiswa(mahasiswaId as string),
    enabled: !!mahasiswaId,
  });

  const jenisUjianQuery = useQuery({
    queryKey: ["jenis-ujian"],
    queryFn: () => pendaftaranUjianService.getJenisUjian(),
  });

  const createMutation = useMutation({
    mutationFn: (formData: FormData) =>
      pendaftaranUjianService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pendaftaran-ujian", mahasiswaId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pendaftaranUjianService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pendaftaran-ujian", mahasiswaId],
      });
    },
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => pendaftaranUjianService.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pendaftaran-ujian", mahasiswaId],
      });
    },
  });

  const uploadRevisiMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      pendaftaranUjianService.uploadRevisi(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pendaftaran-ujian", mahasiswaId],
      });
    },
  });

  return {
    pendaftaranList: pendaftaranQuery.data?.data,
    isLoading: pendaftaranQuery.isLoading,
    isError: pendaftaranQuery.isError,
    refetch: pendaftaranQuery.refetch,
    jenisUjianList: jenisUjianQuery.data?.data || [],
    isLoadingJenisUjian: jenisUjianQuery.isLoading,
    createPendaftaran: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deletePendaftaran: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    submitPendaftaran: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    uploadRevisi: uploadRevisiMutation.mutateAsync,
    isUploadingRevisi: uploadRevisiMutation.isPending,
  };
};
export const useAllPendaftaranUjian = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["all-pendaftaran-ujian"],
    queryFn: () => pendaftaranUjianService.getAll(),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { status: string; keterangan: string };
    }) => pendaftaranUjianService.review(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-pendaftaran-ujian"] });
    },
  });

  return {
    pendaftaranList: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    reviewPendaftaran: reviewMutation.mutateAsync,
    isReviewing: reviewMutation.isPending,
  };
};
