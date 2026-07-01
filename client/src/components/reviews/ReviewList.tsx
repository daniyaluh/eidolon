import { useState } from "react";
import type { ReviewSort } from "../../types/review";
import { useReviews } from "../../hooks/queries/useReviews";
import { ReviewItem } from "./ReviewItem";
import { ReviewSkeleton } from "./ReviewSkeleton";
import { useStaggerReveal } from "../../hooks/useStaggerReveal";

interface ReviewListProps {
  gameId: string;
}

export function ReviewList({ gameId }: ReviewListProps) {
  const [sort, setSort] = useState<ReviewSort>("newest");
  const { data, isLoading, isError, error, isFetching } = useReviews(gameId, sort);
  const listRef = useStaggerReveal<HTMLDivElement>([data?.items.length, sort]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Reviews {data ? `(${data.total})` : ""}
        </h3>
        <div className="flex gap-1 rounded-lg bg-zinc-900 p-1">
          {(["newest", "helpful"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSort(option)}
              className={`rounded px-3 py-1 text-xs ${
                sort === option ? "bg-white text-zinc-950" : "text-zinc-300"
              }`}
            >
              {option === "newest" ? "Newest" : "Most Helpful"}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div>
          {Array.from({ length: 3 }, (_, i) => (
            <ReviewSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && (
        <p className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          Failed to load reviews{error instanceof Error ? `: ${error.message}` : ""}.
        </p>
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <p className="rounded-lg border border-dashed border-zinc-700 py-10 text-center text-sm text-zinc-400">
          No reviews yet. Be the first to review this game!
        </p>
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div ref={listRef} className={isFetching ? "opacity-60 transition-opacity" : ""}>
          {data.items.map((review) => (
            <ReviewItem key={review.id} review={review} gameId={gameId} />
          ))}
        </div>
      )}
    </div>
  );
}
