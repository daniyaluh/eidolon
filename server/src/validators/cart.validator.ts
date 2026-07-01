import { z } from "zod";

export const addToCartSchema = z.object({
  gameId: z.string().min(1),
  planType: z.enum(["ONE_TIME", "SUBSCRIPTION"]),
});

export const updateCartItemSchema = z.object({
  planType: z.enum(["ONE_TIME", "SUBSCRIPTION"]),
});
