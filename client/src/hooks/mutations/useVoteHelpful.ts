import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import type { PaginatedReviews } from "../../types/review";

interface VoteContext {
  previous: [readonly unknown[], PaginatedReviews | undefined][];
}

export function useVoteHelpful(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ helpfulCount: number }, Error, string, VoteContext>({
    mutationFn: (reviewId: string) =>
      apiClient.post<{ helpfulCount: number }>(`/reviews/${reviewId}/helpful`),

    onMutate: async (reviewId) => {
      await queryClient.cancelQueries({ queryKey: ["reviews", gameId] });

      const previous = queryClient.getQueriesData<PaginatedReviews>({
        queryKey: ["reviews", gameId],
      });

      // Optimistically bump the count and mark as voted across all cached pages.
      for (const [key, data] of previous) {
        if (!data) continue;
        queryClient.setQueryData<PaginatedReviews>(key, {
          ...data,
          items: data.items.map((review) =>
            review.id === reviewId && !review.hasVotedHelpful
              ? { ...review, helpfulCount: review.helpfulCount + 1, hasVotedHelpful: true }
              : review
          ),
        });
      }

      return { previous };
    },

    onError: (_err, _reviewId, context) => {
      // Roll back on failure (e.g. duplicate vote 409).
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", gameId] });
    },
  });
}
