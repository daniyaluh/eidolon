import { Link } from "react-router-dom";
import { useGamesFilters } from "../hooks/useGamesFilters";
import { useGames } from "../hooks/queries/useGames";
import { FilterSidebar } from "../components/games/FilterSidebar";
import { SortDropdown } from "../components/games/SortDropdown";
import { GameGrid } from "../components/games/GameGrid";
import { GameCardSkeleton } from "../components/games/GameCardSkeleton";
import { EmptyGamesState } from "../components/games/EmptyGamesState";
import { Pagination } from "../components/games/Pagination";
import type { Game } from "../types/game";

function FeaturedBanner({ game }: { game: Game }) {
  const art = game.screenshots?.[0] ?? game.coverUrl;
  return (
    <div className="relative mb-8 overflow-hidden rounded-[1.75rem]">
      <div className="absolute inset-0">
        <img src={art} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>
      <div className="relative flex min-h-[300px] flex-col justify-end gap-4 p-6 sm:min-h-[340px] sm:p-9">
        <span className="glass-soft w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
          Featured
        </span>
        <h2 className="text-display max-w-xl text-4xl font-bold uppercase leading-[0.95] text-white sm:text-6xl">
          {game.title}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {game.genres.slice(0, 3).map((g) => (
            <span key={g} className="glass-soft rounded-full px-3 py-1 text-xs text-zinc-200">
              {g}
            </span>
          ))}
        </div>
        <div className="mt-1 flex items-center gap-3">
          <Link
            to={`/games/${game.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-95"
          >
            View game
          </Link>
          {game.priceOneTime != null && (
            <span className="text-display text-2xl font-semibold text-white">
              ${game.priceOneTime.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function GamesGridPage() {
  const { filters, updateFilters } = useGamesFilters();
  const { data, isLoading, isError, error } = useGames(filters);

  const showFeatured =
    !isLoading && !isError && data && data.items.length > 0 && (data.page ?? 1) === 1 && !filters.search;
  const featured = showFeatured ? data!.items[0] : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {featured && <FeaturedBanner game={featured} />}

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">Catalogue</p>
          <h1 className="text-display mt-1 text-3xl font-bold text-white">Browse Games</h1>
        </div>
        <SortDropdown value={filters.sort} onChange={(sort) => updateFilters({ sort })} />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <FilterSidebar filters={filters} onChange={updateFilters} />

        <div className="flex-1">
          {isLoading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <GameCardSkeleton key={i} />
              ))}
            </div>
          )}

          {isError && (
            <div className="surface rounded-2xl p-6 text-center text-red-300">
              Failed to load games{error instanceof Error ? `: ${error.message}` : ""}.
            </div>
          )}

          {!isLoading && !isError && data && data.items.length === 0 && <EmptyGamesState />}

          {!isLoading && !isError && data && data.items.length > 0 && (
            <>
              <GameGrid games={data.items} />
              <Pagination
                page={data.page}
                pageSize={data.pageSize}
                total={data.total}
                onPageChange={(page) => updateFilters({ page })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
