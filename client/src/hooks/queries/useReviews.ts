import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import type { PaginatedReviews, ReviewSort } from "../../types/review";

export function useReviews(gameId: string, sort: ReviewSort, page = 1) {
  return useQuery({
    queryKey: ["reviews", gameId, sort, page],
    queryFn: () =>
      apiClient.get<PaginatedReviews>(`/games/${gameId}/reviews`, { sort, page, pageSize: 10 }),
    enabled: Boolean(gameId),
    placeholderData: (previous) => previous,
  });
}
