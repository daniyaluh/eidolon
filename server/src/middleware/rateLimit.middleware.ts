import rateLimit from "express-rate-limit";

const isProduction = process.env.NODE_ENV === "production";

function jsonLimitHandler(message: string) {
  return (_req: unknown, res: { status: (code: number) => { json: (body: unknown) => unknown } }) =>
    res.status(429).json({ error: message });
}

// Stricter limit for auth: login/register/refresh are abuse-prone.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isProduction ? 30 : 1000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: jsonLimitHandler("Too many auth attempts. Please try again later."),
});

// The chat agent makes paid LLM calls, so cap requests per user/IP.
export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: isProduction ? 20 : 1000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: jsonLimitHandler("You're sending messages too quickly. Please slow down."),
});
