import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDayUTC(date: Date): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function buildDailyRevenueSeries(
  orders: { amount: number; createdAt: Date }[],
  since: Date
): { date: string; revenue: number }[] {
  const totals = new Map<string, number>();

  // Seed every day in the window with 0 so the chart has no gaps.
  for (let d = new Date(since); d <= new Date(); d = new Date(d.getTime() + DAY_MS)) {
    totals.set(startOfDayUTC(d), 0);
  }

  for (const order of orders) {
    const key = startOfDayUTC(order.createdAt);
    totals.set(key, (totals.get(key) ?? 0) + order.amount);
  }

  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue: Number(revenue.toFixed(2)) }));
}

export async function getAnalytics(_req: Request, res: Response) {
  const since = new Date(Date.now() - 30 * DAY_MS);

  const [completedOrders, totalRevenueAgg, topSellersRaw, activeSubscriptions, newUsers] =
    await Promise.all([
      prisma.order.findMany({
        where: { status: "COMPLETED", createdAt: { gte: since } },
        select: { amount: true, createdAt: true },
      }),
      prisma.order.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.order.groupBy({
        by: ["gameId"],
        where: { status: "COMPLETED" },
        _count: { _all: true },
        _sum: { amount: true },
        orderBy: { _count: { gameId: "desc" } },
        take: 10,
      }),
      prisma.libraryEntry.count({
        where: { acquiredVia: "SUBSCRIPTION", subscriptionActive: true },
      }),
      prisma.user.count({ where: { createdAt: { gte: since } } }),
    ]);

  // Resolve game titles for the top sellers.
  const topGameIds = topSellersRaw.map((row) => row.gameId);
  const topGames = await prisma.game.findMany({
    where: { id: { in: topGameIds } },
    select: { id: true, title: true, coverUrl: true },
  });
  const gameById = new Map(topGames.map((g) => [g.id, g]));

  const topSellers = topSellersRaw.map((row) => ({
    gameId: row.gameId,
    title: gameById.get(row.gameId)?.title ?? "Unknown",
    coverUrl: gameById.get(row.gameId)?.coverUrl ?? "",
    unitsSold: row._count._all,
    revenue: Number((row._sum.amount ?? 0).toFixed(2)),
  }));

  return res.json({
    totalRevenue: Number((totalRevenueAgg._sum.amount ?? 0).toFixed(2)),
    revenueByDay: buildDailyRevenueSeries(completedOrders, since),
    topSellers,
    activeSubscriptions,
    newUsersLast30Days: newUsers,
  });
}
