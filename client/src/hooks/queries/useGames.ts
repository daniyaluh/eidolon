import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import type { GamesFilters, PaginatedGames } from "../../types/game";

export function useGames(filters: GamesFilters) {
  return useQuery({
    queryKey: ["games", filters],
    queryFn: () => apiClient.get<PaginatedGames>("/games", { ...filters }),
    placeholderData: (previousData) => previousData,
  });
}
