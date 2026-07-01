import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./lib/env";
import { gamesRouter } from "./routes/games.routes";
import { adminGamesRouter } from "./routes/admin/games.routes";
import { adminAnalyticsRouter } from "./routes/admin/analytics.routes";
import { adminUsersRouter } from "./routes/admin/users.routes";
import { authRouter } from "./routes/auth.routes";
import { meRouter } from "./routes/me.routes";
import { cartRouter } from "./routes/cart.routes";
import { checkoutRouter } from "./routes/checkout.routes";
import { subscriptionRouter } from "./routes/subscription.routes";
import { reviewsRouter } from "./routes/reviews.routes";
import { wishlistRouter } from "./routes/wishlist.routes";
import { chatRouter } from "./routes/chat.routes";
import { webhookRouter } from "./routes/webhook.routes";
import { errorHandler } from "./middleware/errorHandler";
import { authRateLimiter, chatRateLimiter } from "./middleware/rateLimit.middleware";
import { getHealth } from "./controllers/health.controller";
import { asyncHandler } from "./utils/asyncHandler";
import { scheduleGamesSync } from "./cron/gamesSync.cron";
import { LOCAL_UPLOADS_DIR } from "./lib/storage";

const app = express();

// Behind a hosting proxy (Render/Railway/etc.) so rate limiting and secure
// cookies see the real client IP and protocol.
app.set("trust proxy", 1);

app.use(cors({ origin: env.clientOrigin, credentials: true }));

// Stripe webhooks need the raw request body, so they are mounted BEFORE the
// express.json() parser, which would otherwise consume and discard the buffer.
app.use("/api/webhooks", webhookRouter);

app.use(express.json());
app.use(cookieParser());

// Serve locally-stored uploads in development.
app.use("/uploads", express.static(LOCAL_UPLOADS_DIR));

// Health check (DB + Redis connectivity) for load balancers / uptime monitors.
app.get("/api/health", asyncHandler(getHealth));
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRateLimiter, authRouter);
app.use("/api/me", meRouter);
app.use("/api/games", gamesRouter);
app.use("/api/admin/games", adminGamesRouter);
app.use("/api/admin/analytics", adminAnalyticsRouter);
app.use("/api/admin/users", adminUsersRouter);
app.use("/api/cart", cartRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/chat", chatRateLimiter, chatRouter);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Eidolon API listening on port ${env.port}`);
  scheduleGamesSync();
});
