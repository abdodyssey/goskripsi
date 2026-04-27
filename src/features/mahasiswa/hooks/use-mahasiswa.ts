import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mahasiswaService } from "../api/mahasiswa.service";
import { Mahasiswa } from "@/types/user.type";

export const useMahasiswa = () => {
  const queryClient = useQueryClient();

  const mahasiswaQuery = useQuery({
    queryKey: ["mahasiswa-list"],
    queryFn: () => mahasiswaService.getAll(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Mahasiswa> }) =>
      mahasiswaService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mahasiswa-list"] });
    },
  });

  return {
    mahasiswaList: mahasiswaQuery.data?.data || [],
    isLoading: mahasiswaQuery.isLoading,
    isError: mahasiswaQuery.isError,
    refetch: mahasiswaQuery.refetch,
    updateMahasiswa: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};

export const useProdis = () => {
  return useQuery({
    queryKey: ["prodis"],
    queryFn: () => mahasiswaService.getProdis(),
  });
};

export const useDosens = () => {
  return useQuery({
    queryKey: ["dosens"],
    queryFn: () => mahasiswaService.getDosens(),
  });
};
