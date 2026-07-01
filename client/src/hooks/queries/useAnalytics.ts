import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import type { Analytics } from "../../types/admin";

export function useAnalytics() {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => apiClient.get<Analytics>("/admin/analytics"),
  });
}
