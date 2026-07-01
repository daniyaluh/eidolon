import { NavLink, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuthStore } from "../../store/authStore";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const ICONS = {
  home: <Icon><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></Icon>,
  store: <Icon><path d="M4 7h16l-1 4.5a3 3 0 0 1-3 2.5H8a3 3 0 0 1-3-2.5L4 7Z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" /><path d="M6 14v7h12v-7" /></Icon>,
  library: <Icon><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></Icon>,
  wishlist: <Icon><path d="M12 20s-7-4.35-9.5-8.5C1 8.5 2.5 5 6 5c2 0 3.2 1.2 4 2.3C10.8 6.2 12 5 14 5c3.5 0 5 3.5 3.5 6.5C19 15.65 12 20 12 20Z" /></Icon>,
  profile: <Icon><circle cx="12" cy="8" r="4" /><path d="M5 21c0-3.5 3-6 7-6s7 2.5 7 6" /></Icon>,
  logout: <Icon><path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></Icon>,
};

export function SideRail() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const items: { to: string; label: string; icon: ReactNode; auth?: boolean }[] = [
    { to: "/", label: "Home", icon: ICONS.home },
    { to: "/games", label: "Store", icon: ICONS.store },
    { to: "/library", label: "Library", icon: ICONS.library, auth: true },
    { to: "/wishlist", label: "Wishlist", icon: ICONS.wishlist, auth: true },
    { to: "/profile", label: "Profile", icon: ICONS.profile, auth: true },
  ].filter((i) => !i.auth || isAuthenticated);

  async function handleLogout() {
    await logout();
    navigate("/games");
  }

  return (
    <aside className="fixed left-3 top-1/2 z-30 hidden -translate-y-1/2 lg:block">
      <nav className="surface flex flex-col items-center gap-1 rounded-3xl p-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex w-[68px] flex-col items-center gap-1.5 rounded-2xl py-2.5 transition ${
                isActive
                  ? "bg-white text-black"
                  : "text-zinc-300 hover:bg-zinc-200/10 hover:text-white"
              }`
            }
          >
            {item.icon}
            <span className="text-[11px] font-medium leading-none">{item.label}</span>
          </NavLink>
        ))}

        <div className="my-1 h-px w-8 bg-white/10" />

        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-[68px] flex-col items-center gap-1.5 rounded-2xl py-2.5 text-zinc-400 transition hover:bg-zinc-200/10 hover:text-white"
          >
            {ICONS.logout}
            <span className="text-[11px] font-medium leading-none">Log out</span>
          </button>
        ) : (
          <NavLink
            to="/login"
            className="flex w-[68px] flex-col items-center gap-1.5 rounded-2xl py-2.5 text-zinc-400 transition hover:bg-zinc-200/10 hover:text-white"
          >
            {ICONS.logout}
            <span className="text-[11px] font-medium leading-none">Log in</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
