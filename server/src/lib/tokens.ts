import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { env } from "./env";
import { redis } from "./redis";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface AccessTokenPayload {
  id: string;
  role: "USER" | "ADMIN";
}

interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

function refreshTokenRedisKey(jti: string): string {
  return `refresh-token:${jti}`;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: ACCESS_TOKEN_TTL });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}

export async function issueRefreshToken(userId: string): Promise<string> {
  const jti = randomUUID();
  const token = jwt.sign({ sub: userId, jti }, env.jwtRefreshSecret, {
    expiresIn: REFRESH_TOKEN_TTL_SECONDS,
  });

  if (redis) {
    await redis.set(refreshTokenRedisKey(jti), userId, "EX", REFRESH_TOKEN_TTL_SECONDS);
  }

  return token;
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string; jti: string }> {
  const payload = jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;

  if (redis) {
    const storedUserId = await redis.get(refreshTokenRedisKey(payload.jti));
    if (!storedUserId || storedUserId !== payload.sub) {
      throw new Error("Refresh token has been revoked");
    }
  }

  return { userId: payload.sub, jti: payload.jti };
}

export async function revokeRefreshToken(jti: string): Promise<void> {
  if (redis) {
    await redis.del(refreshTokenRedisKey(jti));
  }
}

export const REFRESH_COOKIE_NAME = "refreshToken";
export const REFRESH_COOKIE_MAX_AGE_MS = REFRESH_TOKEN_TTL_SECONDS * 1000;
