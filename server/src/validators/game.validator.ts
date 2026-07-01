import { z } from "zod";

export const gameInputSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  description: z.string().trim().min(1),
  shortDescription: z.string().trim().min(1),
  // Allow an empty cover at create time so the admin can create the game
  // first and upload the cover image to its /upload-cover endpoint after.
  coverUrl: z.union([z.string().url(), z.literal("")]).default(""),
  trailerUrl: z.string().url().nullable().optional(),
  screenshots: z.array(z.string().url()).default([]),
  genres: z.array(z.string()).default([]),
  platforms: z.array(z.string()).default([]),
  releaseDate: z.coerce.date(),
  developer: z.string().trim().min(1),
  publisher: z.string().trim().min(1),
  priceOneTime: z.number().nonnegative().nullable().optional(),
  priceMonthly: z.number().nonnegative().nullable().optional(),
  systemRequirements: z.record(z.string(), z.unknown()).default({}),
});

export const updateGameInputSchema = gameInputSchema.partial();
