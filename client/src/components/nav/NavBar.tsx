import { Link, useNavigate } from "react-router-dom";
import { SearchBar } from "./SearchBar";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

export function NavBar() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const cartCount = useCartStore((state) => state.items.length);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/games");
  }

  const linkClass = "text-zinc-400 transition-colors hover:text-white";

  return (
    <header className="sticky top-0 z-30 px-3 pt-3">
      <div className="glass mx-auto flex max-w-7xl items-center justify-between gap-6 rounded-2xl px-4 py-2.5">
        <Link to="/games" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="h-11 w-11 object-contain" />
          <img src="/wordmark.png" alt="Eidolon" className="h-[24px] w-auto translate-y-[3px] object-contain brightness-0 invert" />
        </Link>

        <SearchBar />

        <div className="flex items-center gap-5 text-sm">
          {isAuthenticated ? (
            <>
              <Link to="/library" className={`hidden md:inline ${linkClass}`}>
                Library
              </Link>
              <Link to="/wishlist" className={`hidden lg:inline ${linkClass}`}>
                Wishlist
              </Link>
              <Link to="/orders" className={`hidden lg:inline ${linkClass}`}>
                Orders
              </Link>
              <Link to="/billing" className={`hidden lg:inline ${linkClass}`}>
                Billing
              </Link>
              {user?.role === "ADMIN" && (
                <Link to="/admin" className="hidden md:inline font-medium text-white/90 hover:text-white">
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={openDrawer}
                className="relative text-zinc-400 transition-colors hover:text-white"
                aria-label="Open cart"
              >
                Cart
                {cartCount > 0 && (
                  <span className="absolute -right-3.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black">
                    {cartCount}
                  </span>
                )}
              </button>
              <Link
                to="/profile"
                className="flex items-center gap-2 text-zinc-300 transition-colors hover:text-white"
              >
                <img
                  src={user?.avatarUrl ?? `https://api.dicebear.com/9.x/identicon/svg?seed=${user?.id}`}
                  alt=""
                  className="h-8 w-8 rounded-full bg-white/10 object-cover ring-1 ring-white/15"
                />
                <span className="hidden sm:inline">{user?.displayName}</span>
              </Link>
              <button type="button" onClick={handleLogout} className={`hidden sm:inline ${linkClass}`}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass}>
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-white px-4 py-1.5 font-semibold text-black transition-colors hover:bg-zinc-200"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
