export function ReviewSkeleton() {
  return (
    <div className="space-y-2 border-b border-zinc-800 py-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-800" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 animate-pulse rounded bg-zinc-800" />
          <div className="h-3 w-16 animate-pulse rounded bg-zinc-800" />
        </div>
      </div>
      <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-800" />
      <div className="h-3 w-full animate-pulse rounded bg-zinc-800" />
      <div className="h-3 w-4/5 animate-pulse rounded bg-zinc-800" />
    </div>
  );
}
