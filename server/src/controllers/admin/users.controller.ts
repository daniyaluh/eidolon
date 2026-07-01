import { Request, Response } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

const listQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
});

const updateRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

export async function listUsers(req: Request, res: Response) {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query", details: parsed.error.flatten() });
  }
  const { search, page, pageSize } = parsed.data;

  const where: Prisma.UserWhereInput = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { displayName: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true, libraryEntries: true, reviews: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const items = users.map((u) => ({
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    role: u.role,
    createdAt: u.createdAt,
    orderCount: u._count.orders,
    libraryCount: u._count.libraryEntries,
    reviewCount: u._count.reviews,
  }));

  return res.json({ items, total, page, pageSize });
}

export async function updateUserRole(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = updateRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid role", details: parsed.error.flatten() });
  }

  // An admin can't change their own role (avoids locking yourself out).
  if (id === req.user!.id) {
    return res.status(400).json({ error: "You can't change your own role." });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "User not found" });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role: parsed.data.role },
    select: { id: true, email: true, role: true },
  });

  return res.json(user);
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;

  if (id === req.user!.id) {
    return res.status(400).json({ error: "You can't delete your own account here." });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "User not found" });
  }

  // Cascading deletes remove the user's orders, library, reviews, cart, etc.
  await prisma.user.delete({ where: { id } });

  return res.status(204).send();
}
