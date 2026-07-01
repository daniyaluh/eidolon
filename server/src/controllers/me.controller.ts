import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { storage } from "../lib/storage";
import { updateMeSchema } from "../validators/auth.validator";

// Shared shape so every endpoint returns the user consistently.
function publicUser(user: {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function getMe(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json(publicUser(user));
}

export async function updateMe(req: Request, res: Response) {
  const parsed = updateMeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid profile data", details: parsed.error.flatten() });
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: parsed.data,
  });

  return res.json(publicUser(user));
}

export async function uploadAvatar(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const stored = await storage.save(req.file.buffer, req.file.originalname, "avatars");

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { avatarUrl: stored.url },
  });

  return res.status(201).json(publicUser(user));
}

export async function getMyLibrary(req: Request, res: Response) {
  const entries = await prisma.libraryEntry.findMany({
    where: { userId: req.user!.id },
    include: { game: true },
    orderBy: { id: "desc" },
  });

  const items = entries.map((entry) => ({
    id: entry.id,
    acquiredVia: entry.acquiredVia,
    subscriptionActive: entry.subscriptionActive,
    pastDue: entry.pastDue,
    stripeSubscriptionId: entry.stripeSubscriptionId,
    playtimeMinutes: entry.playtimeMinutes,
    lastPlayedAt: entry.lastPlayedAt,
    game: entry.game,
  }));

  return res.json({ items });
}

export async function getMyOrders(req: Request, res: Response) {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.id },
    include: { game: true },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ items: orders });
}
