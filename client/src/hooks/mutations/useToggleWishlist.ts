import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import type { Game } from "../../types/game";
import type { WishlistResponse } from "../../types/wishlist";

interface ToggleArgs {
  game: Game;
  isWishlisted: boolean;
}

interface ToggleContext {
  previous: WishlistResponse | undefined;
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, ToggleArgs, ToggleContext>({
    mutationFn: ({ game, isWishlisted }) =>
      isWishlisted
        ? apiClient.delete(`/wishlist/${game.id}`)
        : apiClient.post(`/wishlist/${game.id}`),

    onMutate: async ({ game, isWishlisted }) => {
      await queryClient.cancelQueries({ queryKey: ["me", "wishlist"] });
      const previous = queryClient.getQueryData<WishlistResponse>(["me", "wishlist"]);

      const current = previous?.items ?? [];
      const nextItems = isWishlisted
        ? current.filter((item) => item.game.id !== game.id)
        : [{ id: `optimistic-${game.id}`, game }, ...current];

      queryClient.setQueryData<WishlistResponse>(["me", "wishlist"], { items: nextItems });

      return { previous };
    },

    onError: (_err, _args, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["me", "wishlist"], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "wishlist"] });
    },
  });
}
