import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import type { PaginatedUsers } from "../../types/adminUser";

export function useAdminUsers(search: string, page: number) {
  return useQuery({
    queryKey: ["admin", "users", search, page],
    queryFn: () =>
      apiClient.get<PaginatedUsers>("/admin/users", {
        search: search || undefined,
        page,
        pageSize: 10,
      }),
    placeholderData: (prev) => prev,
  });
}
