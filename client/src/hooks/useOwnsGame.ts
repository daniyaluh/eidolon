import { useLibrary } from "./queries/useLibrary";
import { useAuthStore } from "../store/authStore";

export function useOwnsGame(gameId: string): boolean {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data } = useLibrary();

  if (!isAuthenticated || !data) return false;
  return data.items.some((entry) => entry.game.id === gameId);
}
