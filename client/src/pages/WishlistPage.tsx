import { useState } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../hooks/queries/useWishlist";
import { useCartStore } from "../store/cartStore";
import { GamePrice } from "../components/games/GamePrice";
import { WishlistButton } from "../components/wishlist/WishlistButton";
import { Spinner } from "../components/ui/Spinner";
import type { Game } from "../types/game";
import { ApiError } from "../lib/apiClient";

function WishlistRow({ game }: { game: Game }) {
  const addItem = useCartStore((state) => state.addItem);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddToCart() {
    setError(null);
    setPending(true);
    try {
      const plan = game.priceOneTime !== null ? "ONE_TIME" : "SUBSCRIPTION";
      await addItem(game.id, plan);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add to cart.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-4 bg-zinc-900 px-4 py-3">
      <Link to={`/games/${game.slug}`}>
        <img src={game.coverUrl} alt="" className="h-14 w-24 rounded object-cover" />
      </Link>
      <div className="flex-1">
        <Link to={`/games/${game.slug}`} className="text-sm font-semibold text-white hover:underline">
          {game.title}
        </Link>
        <div className="mt-1">
          <GamePrice priceOneTime={game.priceOneTime} priceMonthly={game.priceMonthly} />
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
        >
          {pending && <Spinner className="h-3 w-3" />}
          Add to cart
        </button>
        <WishlistButton game={game} />
      </div>
    </div>
  );
}

export function WishlistPage() {
  const { data, isLoading, isError, error } = useWishlist();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">My Wishlist</h1>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-white" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-900 bg-red-950/40 p-6 text-center text-red-300">
          Failed to load wishlist{error instanceof Error ? `: ${error.message}` : ""}.
        </div>
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-700 py-16 text-center text-zinc-400">
          Your wishlist is empty. Tap the heart on any game to save it here.
        </div>
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800">
          {data.items.map((item) => (
            <WishlistRow key={item.id} game={item.game} />
          ))}
        </div>
      )}
    </div>
  );
}
