export function EmptyGamesState() {
  return (
    <div className="surface flex flex-col items-center justify-center gap-2 rounded-2xl py-20 text-center">
      <p className="text-lg font-medium text-zinc-200">No games match your filters</p>
      <p className="text-sm text-zinc-500">Try adjusting your search or clearing some filters.</p>
    </div>
  );
}
