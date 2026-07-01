import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import type { WishlistResponse } from "../../types/wishlist";
import { useAuthStore } from "../../store/authStore";

export function useWishlist() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["me", "wishlist"],
    queryFn: () => apiClient.get<WishlistResponse>("/me/wishlist"),
    enabled: isAuthenticated,
  });
}
