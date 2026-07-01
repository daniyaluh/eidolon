import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "../../lib/apiClient";
import type { UserRole } from "../../types/user";

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
}

export function useUpdateUserRole() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      apiClient.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: (_data, { role }) => {
      toast.success(role === "ADMIN" ? "User promoted to admin" : "Admin rights removed");
      invalidate();
    },
  });
}

export function useDeleteUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/users/${id}`),
    onSuccess: () => {
      toast.success("User deleted");
      invalidate();
    },
  });
}
