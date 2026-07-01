import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { getOrSetCache, gamesListCacheKey } from "../utils/cache";

export type GamesSort = "newest" | "price_asc" | "price_desc" | "rating" | "alphabetical";

export interface ListGamesQuery {
  search?: string;
  genre?: string;
  platform?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: GamesSort;
  page: number;
  pageSize: number;
}

export interface ListGamesResult {
  items: Prisma.GameGetPayload<Record<string, never>>[];
  total: number;
  page: number;
  pageSize: number;
}

const SORT_MAP: Record<GamesSort, Prisma.GameOrderByWithRelationInput[]> = {
  newest: [{ createdAt: "desc" }],
  price_asc: [{ priceOneTime: "asc" }],
  price_desc: [{ priceOneTime: "desc" }],
  rating: [{ avgRating: "desc" }],
  alphabetical: [{ title: "asc" }],
};

function buildWhere(query: ListGamesQuery): Prisma.GameWhereInput {
  const where: Prisma.GameWhereInput = {};

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.genre) {
    where.genres = { has: query.genre };
  }

  if (query.platform) {
    where.platforms = { has: query.platform };
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.priceOneTime = {
      ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
    };
  }

  return where;
}

function buildCacheKeyFromQuery(query: ListGamesQuery): string {
  const normalized = Object.entries(query)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return gamesListCacheKey(normalized);
}

export async function listGames(query: ListGamesQuery): Promise<ListGamesResult> {
  const cacheKey = buildCacheKeyFromQuery(query);

  return getOrSetCache(cacheKey, 300, async () => {
    const where = buildWhere(query);
    const orderBy = SORT_MAP[query.sort ?? "newest"];

    const [items, total] = await Promise.all([
      prisma.game.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.game.count({ where }),
    ]);

    return { items, total, page: query.page, pageSize: query.pageSize };
  });
}

export async function getGameById(id: string) {
  return prisma.game.findUnique({ where: { id } });
}

export async function getGameBySlug(slug: string) {
  const game = await prisma.game.findUnique({ where: { slug } });
  if (!game) return null;

  const ratingBreakdown = await prisma.review.groupBy({
    by: ["rating"],
    where: { gameId: game.id },
    _count: { rating: true },
  });

  const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of ratingBreakdown) {
    breakdown[row.rating as 1 | 2 | 3 | 4 | 5] = row._count.rating;
  }

  return {
    ...game,
    reviewSummary: {
      avgRating: game.avgRating,
      ratingCount: game.ratingCount,
      breakdown,
    },
  };
}
