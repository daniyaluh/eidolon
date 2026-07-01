import type { Review } from "../../types/review";
import { StarRating } from "../games/StarRating";
import { useVoteHelpful } from "../../hooks/mutations/useVoteHelpful";

interface ReviewItemProps {
  review: Review;
  gameId: string;
}

export function ReviewItem({ review, gameId }: ReviewItemProps) {
  const voteHelpful = useVoteHelpful(gameId);

  return (
    <div className="space-y-2 border-b border-zinc-800 py-4">
      <div className="flex items-center gap-3">
        <img
          src={
            review.author.avatarUrl ??
            `https://api.dicebear.com/9.x/identicon/svg?seed=${review.author.id}`
          }
          alt=""
          className="h-8 w-8 rounded-full bg-zinc-800 object-cover"
        />
        <div>
          <p className="text-sm font-medium text-white">
            {review.author.displayName}
            {review.isOwn && <span className="ml-2 text-xs text-white">You</span>}
          </p>
          <StarRating rating={review.rating} size="sm" />
        </div>
        <span className="ml-auto text-xs text-zinc-500">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>

      <h4 className="font-semibold text-white">{review.title}</h4>
      <p className="whitespace-pre-line text-sm text-zinc-300">{review.body}</p>

      <button
        type="button"
        disabled={review.hasVotedHelpful || review.isOwn || voteHelpful.isPending}
        onClick={() => voteHelpful.mutate(review.id)}
        className="inline-flex items-center gap-1.5 rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        👍 Helpful ({review.helpfulCount})
      </button>
    </div>
  );
}
