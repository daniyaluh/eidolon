import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { invalidateGamesListCache } from "../../utils/cache";
import { gameInputSchema, updateGameInputSchema } from "../../validators/game.validator";

export async function createGame(req: Request, res: Response) {
  const parsed = gameInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid game payload", details: parsed.error.flatten() });
  }

  const game = await prisma.game.create({
    data: {
      ...parsed.data,
      systemRequirements: parsed.data.systemRequirements as Prisma.InputJsonValue,
      source: "ADMIN",
    },
  });

  await invalidateGamesListCache();

  return res.status(201).json(game);
}

export async function updateGame(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = updateGameInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid game payload", details: parsed.error.flatten() });
  }

  const existing = await prisma.game.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Game not found" });
  }

  const game = await prisma.game.update({
    where: { id },
    data: {
      ...parsed.data,
      systemRequirements: parsed.data.systemRequirements as Prisma.InputJsonValue | undefined,
    },
  });

  await invalidateGamesListCache();

  return res.json(game);
}

export async function deleteGame(req: Request, res: Response) {
  const { id } = req.params;

  const existing = await prisma.game.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Game not found" });
  }

  await prisma.game.delete({ where: { id } });

  await invalidateGamesListCache();

  return res.status(204).send();
}
