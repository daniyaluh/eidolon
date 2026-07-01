import type { LibraryEntry } from "../../types/library";

function formatPlaytime(minutes: number): string {
  if (minutes < 60) return `${minutes} min played`;
  const hours = Math.round(minutes / 60);
  return `${hours} hr played`;
}

function formatLastPlayed(lastPlayedAt: string | null): string {
  if (!lastPlayedAt) return "Never played";
  return `Last played ${new Date(lastPlayedAt).toLocaleDateString()}`;
}

function ownershipLabel(entry: LibraryEntry): string {
  if (entry.acquiredVia === "ONE_TIME") return "Owned forever";
  return entry.subscriptionActive ? "Active subscription" : "Subscription expired";
}

interface LibraryGameCardProps {
  entry: LibraryEntry;
}

export function LibraryGameCard({ entry }: LibraryGameCardProps) {
  const { game } = entry;

  return (
    <div className="overflow-hidden rounded-xl bg-zinc-900">
      <div className="aspect-video w-full overflow-hidden bg-zinc-800">
        <img src={game.coverUrl} alt={game.title} className="h-full w-full object-cover" />
      </div>
      <div className="space-y-2 p-4">
        <h3 className="truncate text-base font-semibold text-white">{game.title}</h3>
        <p className="text-xs text-zinc-400">{ownershipLabel(entry)}</p>
        <p className="text-xs text-zinc-500">{formatPlaytime(entry.playtimeMinutes)}</p>
        <p className="text-xs text-zinc-500">{formatLastPlayed(entry.lastPlayedAt)}</p>
        <button
          type="button"
          disabled={entry.acquiredVia === "SUBSCRIPTION" && !entry.subscriptionActive}
          className="w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Play
        </button>
      </div>
    </div>
  );
}
