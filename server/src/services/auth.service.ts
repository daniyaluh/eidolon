import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import {
  issueRefreshToken,
  revokeRefreshToken,
  signAccessToken,
  verifyRefreshToken,
} from "../lib/tokens";

const BCRYPT_SALT_ROUNDS = 10;

export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

function toPublicUser(user: { id: string; email: string; displayName: string; avatarUrl: string | null; role: "USER" | "ADMIN"; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function registerUser(email: string, password: string, displayName: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AuthError("An account with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, passwordHash, displayName, role: "USER" },
  });

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = await issueRefreshToken(user.id);

  return { user: toPublicUser(user), accessToken, refreshToken };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AuthError("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new AuthError("Invalid email or password");
  }

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = await issueRefreshToken(user.id);

  return { user: toPublicUser(user), accessToken, refreshToken };
}

export async function refreshSession(refreshToken: string) {
  let verified: { userId: string; jti: string };
  try {
    verified = await verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthError("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: verified.userId } });
  if (!user) {
    throw new AuthError("Invalid or expired refresh token");
  }

  await revokeRefreshToken(verified.jti);

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const newRefreshToken = await issueRefreshToken(user.id);

  return { user: toPublicUser(user), accessToken, refreshToken: newRefreshToken };
}

export async function logoutSession(refreshToken: string | undefined) {
  if (!refreshToken) return;

  try {
    const { jti } = await verifyRefreshToken(refreshToken);
    await revokeRefreshToken(jti);
  } catch {
    // Token already invalid/expired — nothing to revoke.
  }
}
