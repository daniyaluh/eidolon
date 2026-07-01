import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";

type DependencyStatus = "ok" | "down" | "not_configured";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function checkDatabase(): Promise<DependencyStatus> {
  // Retry a couple times so a momentary Atlas blip doesn't report "down".
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await prisma.$runCommandRaw({ ping: 1 });
      return "ok";
    } catch {
      if (attempt < 2) await sleep(400);
    }
  }
  return "down";
}

async function checkRedis(): Promise<DependencyStatus> {
  if (!redis) return "not_configured";
  try {
    await redis.ping();
    return "ok";
  } catch {
    return "down";
  }
}

export async function getHealth(_req: Request, res: Response) {
  const [database, cache] = await Promise.all([checkDatabase(), checkRedis()]);

  // Redis is optional, so only the database can fail the check.
  const healthy = database === "ok";

  return res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    checks: { database, redis: cache },
    timestamp: new Date().toISOString(),
  });
}
