import { z } from "zod";

export const reviewInputSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(5000),
});

export const listReviewsQuerySchema = z.object({
  sort: z.enum(["newest", "helpful"]).default("newest"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
});
