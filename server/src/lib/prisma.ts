import { PrismaClient } from "@prisma/client";

// Transient connection failures we should retry. The free MongoDB Atlas tier
// intermittently drops/refuses connections ("Server selection timeout",
// "ReplicaSetNoPrimary", etc.); these are momentary and recover on retry.
const TRANSIENT_CODES = new Set(["P1001", "P1002", "P1008", "P1017", "P2024", "P2010", "P2037"]);
const TRANSIENT_PATTERNS = [
  "Server selection timeout",
  "ReplicaSetNoPrimary",
  "No available servers",
  "connection closed",
  "Connection reset",
  "ECONNRESET",
  "ETIMEDOUT",
  "EPIPE",
  "pool timed out",
  "Timed out",
  "network",
  "socket",
];

function isTransient(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  if (code && TRANSIENT_CODES.has(code)) {
    // P2010 (raw query failed) is only transient when the message looks like a
    // connection problem, not a genuine query error.
    if (code !== "P2010") return true;
  }
  const msg = String((err as Error)?.message ?? err);
  return TRANSIENT_PATTERNS.some((p) => msg.toLowerCase().includes(p.toLowerCase()));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const base = new PrismaClient();

/**
 * Prisma client that transparently retries transient Atlas connection blips
 * (up to 4 attempts with short backoff) so a momentary network/cluster hiccup
 * doesn't surface as an error to the user.
 */
export const prisma = base.$extends({
  query: {
    async $allOperations({ args, query }) {
      const maxRetries = 3;
      let lastErr: unknown;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await query(args);
        } catch (err) {
          lastErr = err;
          if (isTransient(err) && attempt < maxRetries) {
            await sleep(300 * (attempt + 1));
            continue;
          }
          throw err;
        }
      }
      throw lastErr;
    },
  },
});

/** The interactive-transaction client type for this (extended) Prisma client. */
export type TxClient = Omit<typeof prisma, `$${string}`>;

