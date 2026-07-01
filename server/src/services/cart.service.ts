import { OrderType } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class CartError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "CartError";
    this.status = status;
  }
}

export async function getCart(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { game: true },
    orderBy: { createdAt: "asc" },
  });

  return items.map((item) => ({
    id: item.id,
    planType: item.planType,
    game: item.game,
  }));
}

export async function addToCart(userId: string, gameId: string, planType: OrderType) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) {
    throw new CartError("Game not found", 404);
  }

  if (planType === "ONE_TIME" && game.priceOneTime === null) {
    throw new CartError("This game is not available for one-time purchase");
  }
  if (planType === "SUBSCRIPTION" && game.priceMonthly === null) {
    throw new CartError("This game is not available for subscription");
  }

  await prisma.cartItem.upsert({
    where: { userId_gameId: { userId, gameId } },
    create: { userId, gameId, planType },
    update: { planType },
  });

  return getCart(userId);
}

export async function removeFromCart(userId: string, gameId: string) {
  await prisma.cartItem.deleteMany({ where: { userId, gameId } });
  return getCart(userId);
}
