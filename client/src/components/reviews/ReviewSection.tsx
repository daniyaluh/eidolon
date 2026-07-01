import { useOwnsGame } from "../../hooks/useOwnsGame";
import { useMyReview } from "../../hooks/queries/useMyReview";
import { useAuthStore } from "../../store/authStore";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";

interface ReviewSectionProps {
  gameId: string;
  gameSlug: string;
}

export function ReviewSection({ gameId, gameSlug }: ReviewSectionProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const ownsGame = useOwnsGame(gameId);
  const { data: myReviewData, isLoading: myReviewLoading } = useMyReview(gameId);

  return (
    <section className="mt-8 space-y-5">
      {isAuthenticated && ownsGame && !myReviewLoading && (
        <ReviewForm
          gameId={gameId}
          gameSlug={gameSlug}
          existingReview={myReviewData?.review ?? null}
        />
      )}

      {isAuthenticated && !ownsGame && (
        <p className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
          You can write a review once you own this game.
        </p>
      )}

      <ReviewList gameId={gameId} />
    </section>
  );
}
