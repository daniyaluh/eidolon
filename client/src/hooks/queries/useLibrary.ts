import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import type { LibraryResponse } from "../../types/library";
import { useAuthStore } from "../../store/authStore";

export function useLibrary() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["me", "library"],
    queryFn: () => apiClient.get<LibraryResponse>("/me/library"),
    enabled: isAuthenticated,
  });
}
