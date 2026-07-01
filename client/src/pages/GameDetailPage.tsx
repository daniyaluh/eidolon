import { useParams } from "react-router-dom";
import { useGame } from "../hooks/queries/useGame";
import { ScreenshotCarousel } from "../components/games/ScreenshotCarousel";
import { SystemRequirementsTable } from "../components/games/SystemRequirementsTable";
import { StarRating } from "../components/games/StarRating";
import { GamePrice } from "../components/games/GamePrice";
import { GamePurchaseActions } from "../components/games/GamePurchaseActions";
import { ReviewSection } from "../components/reviews/ReviewSection";
import { WishlistButton } from "../components/wishlist/WishlistButton";

export function GameDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: game, isLoading, isError, error } = useGame(slug);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="aspect-video w-full animate-pulse rounded-xl bg-zinc-800" />
        <div className="mt-6 h-8 w-1/2 animate-pulse rounded bg-zinc-800" />
        <div className="mt-3 h-4 w-full animate-pulse rounded bg-zinc-800" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-xl border border-red-900 bg-red-950/40 p-6 text-center text-red-300">
          Failed to load game{error instanceof Error ? `: ${error.message}` : ""}.
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 text-center text-zinc-400">
        Game not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <ScreenshotCarousel
        trailerUrl={game.trailerUrl}
        screenshots={game.screenshots}
        title={game.title}
      />

      <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{game.title}</h1>
            <WishlistButton game={game} />
          </div>
          <div className="flex flex-wrap gap-1">
            {game.genres.map((genre) => (
              <span key={genre} className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                {genre}
              </span>
            ))}
          </div>
          <StarRating rating={game.reviewSummary.avgRating} count={game.reviewSummary.ratingCount} />
          <p className="text-sm text-zinc-400">
            {game.developer} · {game.publisher}
          </p>
        </div>

        <div className="space-y-3 rounded-xl bg-zinc-900 p-4">
          <GamePrice priceOneTime={game.priceOneTime} priceMonthly={game.priceMonthly} />
          <GamePurchaseActions
            gameId={game.id}
            priceOneTime={game.priceOneTime}
            priceMonthly={game.priceMonthly}
          />
        </div>
      </div>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">About this game</h2>
        <p className="whitespace-pre-line text-zinc-300">{game.description}</p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">System Requirements</h2>
        <SystemRequirementsTable requirements={game.systemRequirements} />
      </section>

      <ReviewSection gameId={game.id} gameSlug={game.slug} />
    </div>
  );
}
