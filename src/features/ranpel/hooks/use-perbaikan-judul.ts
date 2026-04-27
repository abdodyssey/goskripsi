import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { perbaikanJudulService } from "../api/perbaikan-judul.service";

export const usePerbaikanJudul = () => {
  const queryClient = useQueryClient();

  const allRequestsQuery = useQuery({
    queryKey: ["all-perbaikan-judul"],
    queryFn: () => perbaikanJudulService.getAll(),
  });

  const myRequestsQuery = useQuery({
    queryKey: ["my-perbaikan-judul"],
    queryFn: () => perbaikanJudulService.getMyRequests(),
  });

  const submitMutation = useMutation({
    mutationFn: (data: {
      judulLama: string;
      judulBaru: string;
      fileSurat: string;
    }) => perbaikanJudulService.submit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-perbaikan-judul"] });
      queryClient.invalidateQueries({ queryKey: ["all-perbaikan-judul"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => perbaikanJudulService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-perbaikan-judul"] });
      queryClient.invalidateQueries({ queryKey: ["all-perbaikan-judul"] });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { status: string; catatanSekprodi?: string };
    }) => perbaikanJudulService.review(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-perbaikan-judul"] });
      queryClient.invalidateQueries({ queryKey: ["my-perbaikan-judul"] });
    },
  });

  return {
    allRequests: allRequestsQuery.data?.data,
    myRequests: myRequestsQuery.data?.data,
    isLoadingAll: allRequestsQuery.isLoading,
    isLoadingMy: myRequestsQuery.isLoading,
    submitRequest: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    cancelRequest: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    reviewRequest: reviewMutation.mutateAsync,
    isReviewing: reviewMutation.isPending,
    refetchAll: allRequestsQuery.refetch,
    refetchMy: myRequestsQuery.refetch,
  };
};
