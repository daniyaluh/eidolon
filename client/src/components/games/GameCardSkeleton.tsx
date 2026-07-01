export function GameCardSkeleton() {
  return (
    <div className="surface overflow-hidden rounded-2xl">
      <div className="aspect-[16/10] w-full animate-pulse bg-white/[0.04]" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-white/[0.06]" />
        <div className="flex gap-1.5">
          <div className="h-5 w-14 animate-pulse rounded-full bg-white/[0.05]" />
          <div className="h-5 w-14 animate-pulse rounded-full bg-white/[0.05]" />
        </div>
        <div className="h-4 w-24 animate-pulse rounded bg-white/[0.05]" />
        <div className="h-5 w-28 animate-pulse rounded bg-white/[0.06]" />
      </div>
    </div>
  );
}
