import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: required("DATABASE_URL"),
  redisUrl: process.env.REDIS_URL,
  rawgApiKey: process.env.RAWG_API_KEY,
  // JWT_SECRET is the canonical name; JWT_ACCESS_SECRET kept as a fallback.
  jwtAccessSecret:
    process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || "dev-access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  serverPublicUrl: process.env.SERVER_PUBLIC_URL || "http://localhost:4000",
  storageDriver: process.env.STORAGE_DRIVER || "local",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
};
