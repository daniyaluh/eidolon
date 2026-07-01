import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import type { PaginatedGames } from "../../types/game";

export function useGameSearchSuggestions(search: string) {
  const trimmed = search.trim();

  return useQuery({
    queryKey: ["games", "search-suggestions", trimmed],
    queryFn: () =>
      apiClient.get<PaginatedGames>("/games", {
        search: trimmed,
        page: 1,
        pageSize: 5,
      }),
    enabled: trimmed.length > 0,
    staleTime: 30_000,
  });
}
