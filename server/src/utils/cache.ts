import { redis } from "../lib/redis";

const GAMES_LIST_CACHE_PREFIX = "games:list:";

export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  if (!redis) {
    return fetcher();
  }

  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    console.error("[cache] read failed, falling back to source:", (err as Error).message);
  }

  const fresh = await fetcher();

  try {
    await redis.set(key, JSON.stringify(fresh), "EX", ttlSeconds);
  } catch (err) {
    console.error("[cache] write failed:", (err as Error).message);
  }

  return fresh;
}

export function gamesListCacheKey(queryString: string): string {
  return `${GAMES_LIST_CACHE_PREFIX}${queryString}`;
}

export async function invalidateGamesListCache(): Promise<void> {
  if (!redis) return;

  try {
    const keys = await redis.keys(`${GAMES_LIST_CACHE_PREFIX}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error("[cache] invalidation failed:", (err as Error).message);
  }
}
