import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import type { MyReview } from "../../types/review";
import { useAuthStore } from "../../store/authStore";

export function useMyReview(gameId: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["reviews", gameId, "mine"],
    queryFn: () => apiClient.get<{ review: MyReview | null }>(`/games/${gameId}/reviews/mine`),
    enabled: Boolean(gameId) && isAuthenticated,
  });
}
