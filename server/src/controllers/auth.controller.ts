import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import {
  AuthError,
  loginUser,
  logoutSession,
  refreshSession,
  registerUser,
} from "../services/auth.service";
import { REFRESH_COOKIE_MAX_AGE_MS, REFRESH_COOKIE_NAME } from "../lib/tokens";

const isProduction = process.env.NODE_ENV === "production";

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid registration data", details: parsed.error.flatten() });
  }

  try {
    const { email, password, displayName } = parsed.data;
    const { user, accessToken, refreshToken } = await registerUser(email, password, displayName);
    setRefreshCookie(res, refreshToken);
    return res.status(201).json({ user, accessToken });
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid login data", details: parsed.error.flatten() });
  }

  try {
    const { email, password } = parsed.data;
    const { user, accessToken, refreshToken } = await loginUser(email, password);
    setRefreshCookie(res, refreshToken);
    return res.json({ user, accessToken });
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!refreshToken) {
    return res.status(401).json({ error: "Missing refresh token" });
  }

  try {
    const { user, accessToken, refreshToken: newRefreshToken } = await refreshSession(refreshToken);
    setRefreshCookie(res, newRefreshToken);
    return res.json({ user, accessToken });
  } catch (err) {
    clearRefreshCookie(res);
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
}

export async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  await logoutSession(refreshToken);
  clearRefreshCookie(res);
  return res.status(204).send();
}
