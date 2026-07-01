import { useLibrary } from "../hooks/queries/useLibrary";
import { LibraryGameCard } from "../components/library/LibraryGameCard";
import { GameCardSkeleton } from "../components/games/GameCardSkeleton";

export function LibraryPage() {
  const { data, isLoading, isError, error } = useLibrary();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">My Library</h1>

      {isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-900 bg-red-950/40 p-6 text-center text-red-300">
          Failed to load your library{error instanceof Error ? `: ${error.message}` : ""}.
        </div>
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 py-20 text-center">
          <p className="text-lg font-medium text-zinc-300">Your library is empty</p>
          <p className="text-sm text-zinc-500">Buy or subscribe to a game to see it here.</p>
        </div>
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.items.map((entry) => (
            <LibraryGameCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
