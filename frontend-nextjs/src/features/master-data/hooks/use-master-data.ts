import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { notifications } from "@mantine/notifications";

export function useMasterData(entity: string) {
  const queryClient = useQueryClient();
  const endpoint = `/${entity}`;

  const query = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      const response = await apiClient.get(endpoint);
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiClient.post(endpoint, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      notifications.show({
        title: "Berhasil",
        message: "Data berhasil ditambahkan",
        color: "green",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: any }) => {
      return await apiClient.put(`${endpoint}/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      notifications.show({
        title: "Berhasil",
        message: "Data berhasil diperbarui",
        color: "green",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return await apiClient.delete(`${endpoint}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      notifications.show({
        title: "Berhasil",
        message: "Data berhasil dihapus",
        color: "green",
      });
    },
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
