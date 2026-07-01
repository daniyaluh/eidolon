import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getWishlist(req: Request, res: Response) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user!.id },
    include: { game: true },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ items: items.map((item) => ({ id: item.id, game: item.game })) });
}

export async function addToWishlist(req: Request, res: Response) {
  const { gameId } = req.params;

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  await prisma.wishlistItem.upsert({
    where: { userId_gameId: { userId: req.user!.id, gameId } },
    create: { userId: req.user!.id, gameId },
    update: {},
  });

  return res.status(201).json({ success: true });
}

export async function removeFromWishlist(req: Request, res: Response) {
  await prisma.wishlistItem.deleteMany({
    where: { userId: req.user!.id, gameId: req.params.gameId },
  });

  return res.json({ success: true });
}
