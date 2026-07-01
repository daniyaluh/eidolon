import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
  displayName: z.string().trim().min(1).max(50),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const updateMeSchema = z.object({
  displayName: z.string().trim().min(1).max(50).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});
