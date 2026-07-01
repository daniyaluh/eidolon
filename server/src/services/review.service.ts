import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { TxClient } from "../lib/prisma";

export class ReviewError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "ReviewError";
    this.status = status;
  }
}

export interface ReviewInput {
  rating: number;
  title: string;
  body: string;
}

export type ReviewSort = "newest" | "helpful";

async function recomputeGameRating(tx: TxClient, gameId: string) {
  const agg = await tx.review.aggregate({
    where: { gameId },
    _avg: { rating: true },
    _count: { _all: true },
  });

  await tx.game.update({
    where: { id: gameId },
    data: {
      avgRating: agg._avg.rating ?? 0,
      ratingCount: agg._count._all,
    },
  });
}

export async function upsertReview(userId: string, gameId: string, input: ReviewInput) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) {
    throw new ReviewError("Game not found", 404);
  }

  const ownership = await prisma.libraryEntry.findUnique({
    where: { userId_gameId: { userId, gameId } },
  });
  if (!ownership) {
    throw new ReviewError("You can only review games you own", 403);
  }

  return prisma.$transaction(async (tx) => {
    const review = await tx.review.upsert({
      where: { userId_gameId: { userId, gameId } },
      create: { userId, gameId, ...input },
      update: { rating: input.rating, title: input.title, body: input.body },
    });

    await recomputeGameRating(tx, gameId);

    return review;
  });
}

export async function listReviews(
  gameId: string,
  options: { sort: ReviewSort; page: number; pageSize: number; currentUserId?: string }
) {
  const orderBy: Prisma.ReviewOrderByWithRelationInput[] =
    options.sort === "helpful"
      ? [{ helpfulCount: "desc" }, { createdAt: "desc" }]
      : [{ createdAt: "desc" }];

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { gameId },
      orderBy,
      skip: (options.page - 1) * options.pageSize,
      take: options.pageSize,
      include: {
        user: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    }),
    prisma.review.count({ where: { gameId } }),
  ]);

  // Mark which reviews the current user has already voted helpful on.
  let votedReviewIds = new Set<string>();
  if (options.currentUserId && reviews.length > 0) {
    const votes = await prisma.reviewVote.findMany({
      where: {
        userId: options.currentUserId,
        reviewId: { in: reviews.map((r) => r.id) },
      },
      select: { reviewId: true },
    });
    votedReviewIds = new Set(votes.map((v) => v.reviewId));
  }

  const items = reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    title: review.title,
    body: review.body,
    helpfulCount: review.helpfulCount,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    author: review.user,
    isOwn: review.userId === options.currentUserId,
    hasVotedHelpful: votedReviewIds.has(review.id),
  }));

  return { items, total, page: options.page, pageSize: options.pageSize };
}

export async function voteHelpful(userId: string, reviewId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    throw new ReviewError("Review not found", 404);
  }

  const existingVote = await prisma.reviewVote.findUnique({
    where: { reviewId_userId: { reviewId, userId } },
  });
  if (existingVote) {
    throw new ReviewError("You have already marked this review as helpful", 409);
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.reviewVote.create({ data: { reviewId, userId } });
    return tx.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { increment: 1 } },
    });
  });

  return { helpfulCount: updated.helpfulCount };
}

export async function getMyReviewForGame(userId: string, gameId: string) {
  return prisma.review.findUnique({
    where: { userId_gameId: { userId, gameId } },
  });
}
