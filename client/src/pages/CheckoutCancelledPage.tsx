import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";

export function CheckoutCancelledPage() {
  const openDrawer = useCartStore((state) => state.openDrawer);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 text-3xl text-amber-400">
        !
      </div>
      <h1 className="text-2xl font-bold text-white">Checkout cancelled</h1>
      <p className="text-sm text-zinc-400">
        No payment was taken. Your cart is still saved, so you can pick up right where you left off.
      </p>
      <div className="flex gap-3 pt-2">
        <Link
          to="/games"
          onClick={openDrawer}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
        >
          Review cart
        </Link>
        <Link
          to="/games"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-500"
        >
          Keep browsing
        </Link>
      </div>
    </div>
  );
}
