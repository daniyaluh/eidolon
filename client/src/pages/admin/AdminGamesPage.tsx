import { useState } from "react";
import { useGames } from "../../hooks/queries/useGames";
import { useDeleteGame } from "../../hooks/mutations/useAdminGameMutations";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { GameFormModal } from "../../components/admin/GameFormModal";
import { Pagination } from "../../components/games/Pagination";
import { Spinner } from "../../components/ui/Spinner";
import type { Game } from "../../types/game";

export function AdminGamesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const deleteGame = useDeleteGame();

  const { data, isLoading, isError } = useGames({
    search: debouncedSearch || undefined,
    page,
    pageSize: 10,
  });

  function openCreate() {
    setEditingGame(null);
    setModalOpen(true);
  }

  function openEdit(game: Game) {
    setEditingGame(game);
    setModalOpen(true);
  }

  function handleDelete(game: Game) {
    if (window.confirm(`Delete "${game.title}"? This cannot be undone.`)) {
      deleteGame.mutate(game.id);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Games</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
        >
          + Add Game
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Search games..."
        className="mb-4 w-full max-w-sm rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
      />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-white" />
        </div>
      )}

      {isError && (
        <p className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          Failed to load games.
        </p>
      )}

      {!isLoading && !isError && data && (
        <>
          <div className="overflow-hidden rounded-xl border border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900 text-xs uppercase text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Game</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-zinc-400">
                      No games found.
                    </td>
                  </tr>
                )}
                {data.items.map((game) => (
                  <tr key={game.id} className="bg-zinc-950">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={game.coverUrl || "https://placehold.co/80x48"}
                          alt=""
                          className="h-10 w-16 rounded object-cover"
                        />
                        <span className="font-medium text-white">{game.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {game.priceOneTime !== null ? `$${game.priceOneTime.toFixed(2)}` : "—"}
                      {game.priceMonthly !== null && (
                        <span className="text-xs text-white"> · ${game.priceMonthly.toFixed(2)}/mo</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {game.avgRating.toFixed(1)} ({game.ratingCount})
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                        {game.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(game)}
                          className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:border-white hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(game)}
                          disabled={deleteGame.isPending}
                          className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {modalOpen && <GameFormModal game={editingGame} onClose={() => setModalOpen(false)} />}
    </div>
  );
}
