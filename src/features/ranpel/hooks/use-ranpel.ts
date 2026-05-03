import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ranpelService } from "../api/ranpel.service";
import { CreateRanpelFormValues } from "../schemas/ranpel.schema";

export const useRanpelByMahasiswa = (mahasiswaId?: string) => {
  const queryClient = useQueryClient();

  // Fetch Pengajuan specifically for current mahasiswa
  const pengajuanQuery = useQuery({
    queryKey: ["pengajuan-ranpel", mahasiswaId],
    queryFn: () => ranpelService.getPengajuanByMahasiswa(mahasiswaId as string),
    enabled: !!mahasiswaId,
  });

  // Debug logging for production
  useEffect(() => {
    if (pengajuanQuery.data) {
      console.log("[useRanpelByMahasiswa] Data received:", pengajuanQuery.data);
    }
    if (pengajuanQuery.error) {
      console.error("[useRanpelByMahasiswa] Error:", pengajuanQuery.error);
    }
  }, [pengajuanQuery.data, pengajuanQuery.error]);

  // Mutation to create ranpel
  const createMutation = useMutation({
    mutationFn: (data: CreateRanpelFormValues) =>
      ranpelService.createPengajuanByMahasiswa(mahasiswaId as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pengajuan-ranpel", mahasiswaId],
      });
    },
  });

  // Mutation to delete pengajuan
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ranpelService.deletePengajuan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pengajuan-ranpel", mahasiswaId],
      });
    },
  });

  // Mutation to update ranpel
  const updateMutation = useMutation({
    mutationFn: ({
      ranpelId,
      data,
    }: {
      ranpelId: string;
      data: CreateRanpelFormValues;
    }) => ranpelService.updateRanpel(ranpelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pengajuan-ranpel", mahasiswaId],
      });
    },
  });

  return {
    pengajuanList: pengajuanQuery.data?.data,
    isLoading: pengajuanQuery.isLoading,
    isError: pengajuanQuery.isError,
    refetch: pengajuanQuery.refetch,
    createPengajuan: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deletePengajuan: deleteMutation.mutateAsync,
    updateRanpel: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};

export const useAllPengajuan = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["all-pengajuan-ranpel"],
    queryFn: () => ranpelService.getAllPengajuan(100),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
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
      };
    }) => ranpelService.updatePengajuan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-pengajuan-ranpel"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      ranpelService.createPengajuanByMahasiswa(data.mahasiswaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-pengajuan-ranpel"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ranpelService.deletePengajuan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-pengajuan-ranpel"] });
    },
  });

  const updateRanpelMutation = useMutation({
    mutationFn: ({ ranpelId, data }: { ranpelId: string; data: any }) =>
      ranpelService.updateRanpel(ranpelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-pengajuan-ranpel"] });
    },
  });

  return {
    pengajuanList: ((query.data as { data?: unknown[] })?.data || query.data || []) as any[],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    updatePengajuan: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending || updateRanpelMutation.isPending,
    updateRanpel: updateRanpelMutation.mutateAsync,
    createPengajuan: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deletePengajuan: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
