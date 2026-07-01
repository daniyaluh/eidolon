import { Link } from "react-router-dom";
import type { GamesFilters } from "../../types/game";
import { useGames } from "../../hooks/queries/useGames";
import { GameCard } from "../games/GameCard";
import { GameGrid } from "../games/GameGrid";
import { GameCardSkeleton } from "../games/GameCardSkeleton";

interface GameRowProps {
  eyebrow?: string;
  title: string;
  /** Filter subset applied on top of page/pageSize. */
  filters: Partial<Omit<GamesFilters, "page" | "pageSize">>;
  viewAllTo: string;
  /** "scroll" = horizontal carousel (default), "grid" = full responsive grid. */
  layout?: "scroll" | "grid";
}

/**
 * A category row backed by a real /games query — either a horizontal carousel
 * or a full grid. Renders nothing when the category has no matching games.
 */
export function GameRow({ eyebrow, title, filters, viewAllTo, layout = "scroll" }: GameRowProps) {
  const { data, isLoading } = useGames({ page: 1, pageSize: layout === "grid" ? 8 : 12, ...filters });

  if (!isLoading && (!data || data.items.length === 0)) return null;

  return (
    <section className="mx-auto max-w-[1800px] px-4 py-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          {eyebrow && (
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-500">
              {eyebrow}
            </p>
          )}
          <h2 className="text-display mt-1 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
        </div>
        <Link
          to={viewAllTo}
          className="glass-soft shrink-0 rounded-full px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/15"
        >
          View all →
        </Link>
      </div>

      {layout === "grid" ? (
        isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <GameGrid games={data!.items} />
        )
      ) : (
        <div className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:thin] snap-x">
          {isLoading
            ? Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="w-[270px] shrink-0">
                  <GameCardSkeleton />
                </div>
              ))
            : data!.items.map((game) => (
                <div key={game.id} className="w-[270px] shrink-0 snap-start">
                  <GameCard game={game} />
                </div>
              ))}
        </div>
      )}
    </section>
  );
}
