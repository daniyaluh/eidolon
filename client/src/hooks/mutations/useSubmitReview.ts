import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "../../lib/apiClient";
import type { ReviewInput } from "../../types/review";

export function useSubmitReview(gameId: string, gameSlug?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReviewInput) => apiClient.post(`/games/${gameId}/reviews`, input),
    onSuccess: () => {
      toast.success("Review submitted");
      queryClient.invalidateQueries({ queryKey: ["reviews", gameId] });
      // The game's avgRating/ratingCount changed; refresh detail + lists.
      if (gameSlug) {
        queryClient.invalidateQueries({ queryKey: ["game", gameSlug] });
      }
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}
