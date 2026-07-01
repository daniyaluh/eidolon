import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "../../lib/apiClient";

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) =>
      apiClient.delete<{ success: boolean }>(`/subscriptions/${subscriptionId}`),
    onSuccess: () => {
      toast.success("Subscription cancelled");
      queryClient.invalidateQueries({ queryKey: ["me", "library"] });
      queryClient.invalidateQueries({ queryKey: ["me", "orders"] });
    },
  });
}
