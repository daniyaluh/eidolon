import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import type { GameDetail } from "../../types/game";

export function useGame(slug: string | undefined) {
  return useQuery({
    queryKey: ["game", slug],
    queryFn: () => apiClient.get<GameDetail>(`/games/${slug}`),
    enabled: Boolean(slug),
  });
}
