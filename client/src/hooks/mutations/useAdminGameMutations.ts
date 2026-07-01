import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import type { Game } from "../../types/game";
import type { GameInput } from "../../types/admin";

function useInvalidateGames() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["games"] });
    queryClient.invalidateQueries({ queryKey: ["admin"] });
  };
}

export function useCreateGame() {
  const invalidate = useInvalidateGames();
  return useMutation({
    mutationFn: (input: GameInput) => apiClient.post<Game>("/admin/games", input),
    onSuccess: invalidate,
  });
}

export function useUpdateGame() {
  const invalidate = useInvalidateGames();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<GameInput> }) =>
      apiClient.patch<Game>(`/admin/games/${id}`, input),
    onSuccess: invalidate,
  });
}

export function useDeleteGame() {
  const invalidate = useInvalidateGames();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/games/${id}`),
    onSuccess: invalidate,
  });
}
