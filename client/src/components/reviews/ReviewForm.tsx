import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewFormSchema } from "../../lib/validation/review";
import type { ReviewFormValues } from "../../lib/validation/review";
import type { MyReview } from "../../types/review";
import { useSubmitReview } from "../../hooks/mutations/useSubmitReview";
import { ApiError } from "../../lib/apiClient";
import { StarRating } from "../games/StarRating";
import { Spinner } from "../ui/Spinner";

interface ReviewFormProps {
  gameId: string;
  gameSlug: string;
  existingReview: MyReview | null;
}

export function ReviewForm({ gameId, gameSlug, existingReview }: ReviewFormProps) {
  const submitReview = useSubmitReview(gameId, gameSlug);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: existingReview?.rating ?? 0,
      title: existingReview?.title ?? "",
      body: existingReview?.body ?? "",
    },
  });

  async function onSubmit(values: ReviewFormValues) {
    setServerError(null);
    setSaved(false);
    try {
      await submitReview.mutateAsync(values);
      setSaved(true);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Could not submit review.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl bg-zinc-900 p-5">
      <h3 className="text-lg font-semibold text-white">
        {existingReview ? "Edit your review" : "Write a review"}
      </h3>

      <div className="space-y-1">
        <span className="block text-sm font-medium text-zinc-300">Your rating</span>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <StarRating interactive value={field.value} onChange={field.onChange} size="lg" />
          )}
        />
        {errors.rating && <p className="text-xs text-red-400">{errors.rating.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="review-title" className="block text-sm font-medium text-zinc-300">
          Title
        </label>
        <input
          id="review-title"
          {...register("title")}
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
        />
        {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="review-body" className="block text-sm font-medium text-zinc-300">
          Review
        </label>
        <textarea
          id="review-body"
          rows={4}
          {...register("body")}
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
        />
        {errors.body && <p className="text-xs text-red-400">{errors.body.message}</p>}
      </div>

      {serverError && <p className="text-sm text-red-400">{serverError}</p>}
      {saved && <p className="text-sm text-white">Your review has been saved.</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
      >
        {isSubmitting && <Spinner />}
        {existingReview ? "Update review" : "Submit review"}
      </button>
    </form>
  );
}
