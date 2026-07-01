import { NavLink, Outlet } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/admin/games", label: "Games" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/users", label: "Users" },
];

export function AdminLayout() {
  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <aside className="w-48 shrink-0">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">Admin</h2>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm ${
                  isActive
                    ? "bg-white/15 font-medium text-white"
                    : "text-zinc-300 hover:bg-zinc-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
