import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { storage } from "../../lib/storage";
import { invalidateGamesListCache } from "../../utils/cache";

export async function uploadCover(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const game = await prisma.game.findUnique({ where: { id: req.params.id } });
  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  const stored = await storage.save(req.file.buffer, req.file.originalname, "covers");

  await prisma.game.update({ where: { id: game.id }, data: { coverUrl: stored.url } });
  await invalidateGamesListCache();

  return res.status(201).json({ url: stored.url });
}

export async function uploadScreenshot(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const game = await prisma.game.findUnique({ where: { id: req.params.id } });
  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  const stored = await storage.save(req.file.buffer, req.file.originalname, "screenshots");

  await prisma.game.update({
    where: { id: game.id },
    data: { screenshots: { push: stored.url } },
  });
  await invalidateGamesListCache();

  return res.status(201).json({ url: stored.url });
}
