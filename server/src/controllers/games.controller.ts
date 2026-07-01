import { Request, Response } from "express";
import { z } from "zod";
import { listGames, getGameBySlug, GamesSort } from "../services/games.service";

const SORT_VALUES: GamesSort[] = ["newest", "price_asc", "price_desc", "rating", "alphabetical"];

const listGamesQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  genre: z.string().trim().min(1).optional(),
  platform: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sort: z.enum(SORT_VALUES as [GamesSort, ...GamesSort[]]).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(60).default(20),
});

export async function getGames(req: Request, res: Response) {
  const parsed = listGamesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query parameters", details: parsed.error.flatten() });
  }

  const result = await listGames(parsed.data);
  return res.json(result);
}

export async function getGameDetail(req: Request, res: Response) {
  const { slug } = req.params;
  const game = await getGameBySlug(slug);

  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  return res.json(game);
}
