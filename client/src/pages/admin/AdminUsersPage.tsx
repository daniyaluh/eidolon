import { useState } from "react";
import { useAdminUsers } from "../../hooks/queries/useAdminUsers";
import { useUpdateUserRole, useDeleteUser } from "../../hooks/mutations/useAdminUserMutations";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useAuthStore } from "../../store/authStore";
import { Pagination } from "../../components/games/Pagination";
import { Spinner } from "../../components/ui/Spinner";
import type { AdminUser } from "../../types/adminUser";

export function AdminUsersPage() {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading, isError } = useAdminUsers(debouncedSearch, page);
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  function handleToggleRole(user: AdminUser) {
    const role = user.role === "ADMIN" ? "USER" : "ADMIN";
    updateRole.mutate({ id: user.id, role });
  }

  function handleDelete(user: AdminUser) {
    if (window.confirm(`Delete ${user.email}? This removes their orders, library, and reviews. This cannot be undone.`)) {
      deleteUser.mutate(user.id);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Users</h1>

      <input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Search by email or name..."
        className="mb-4 w-full max-w-sm rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
      />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-white" />
        </div>
      )}

      {isError && (
        <p className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          Failed to load users.
        </p>
      )}

      {!isLoading && !isError && data && (
        <>
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900 text-xs uppercase text-zinc-400">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Library</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-zinc-400">
                      No users found.
                    </td>
                  </tr>
                )}
                {data.items.map((user) => {
                  const isSelf = user.id === currentUserId;
                  return (
                    <tr key={user.id} className="bg-zinc-950">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              user.avatarUrl ??
                              `https://api.dicebear.com/9.x/identicon/svg?seed=${user.id}`
                            }
                            alt=""
                            className="h-8 w-8 rounded-full bg-zinc-800 object-cover"
                          />
                          <div>
                            <p className="font-medium text-white">
                              {user.displayName}
                              {isSelf && <span className="ml-2 text-xs text-white">You</span>}
                            </p>
                            <p className="text-xs text-zinc-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            user.role === "ADMIN"
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{user.orderCount}</td>
                      <td className="px-4 py-3 text-zinc-300">{user.libraryCount}</td>
                      <td className="px-4 py-3 text-zinc-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleRole(user)}
                            disabled={isSelf || updateRole.isPending}
                            title={isSelf ? "You can't change your own role" : ""}
                            className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:border-amber-500 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {user.role === "ADMIN" ? "Make user" : "Make admin"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            disabled={isSelf || deleteUser.isPending}
                            title={isSelf ? "You can't delete your own account here" : ""}
                            className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:border-red-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
