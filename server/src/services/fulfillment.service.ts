import Stripe from "stripe";
import { prisma } from "../lib/prisma";

function parseGameIds(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(",").filter(Boolean);
}

function extractId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

async function fulfillOneTimeGame(
  userId: string,
  gameId: string,
  paymentIntentId: string | null
) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return;

  const existingOrder = await prisma.order.findFirst({
    where: { userId, gameId, type: "ONE_TIME", stripePaymentIntentId: paymentIntentId },
  });

  if (!existingOrder) {
    await prisma.order.create({
      data: {
        userId,
        gameId,
        type: "ONE_TIME",
        amount: game.priceOneTime ?? 0,
        currency: "usd",
        status: "COMPLETED",
        stripePaymentIntentId: paymentIntentId,
      },
    });
  }

  await prisma.libraryEntry.upsert({
    where: { userId_gameId: { userId, gameId } },
    create: {
      userId,
      gameId,
      acquiredVia: "ONE_TIME",
      subscriptionActive: false,
    },
    update: { acquiredVia: "ONE_TIME" },
  });
}

async function fulfillSubscriptionGame(
  userId: string,
  gameId: string,
  subscriptionId: string | null
) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return;

  const existingOrder = await prisma.order.findFirst({
    where: { userId, gameId, type: "SUBSCRIPTION", stripeSubscriptionId: subscriptionId },
  });

  if (!existingOrder) {
    await prisma.order.create({
      data: {
        userId,
        gameId,
        type: "SUBSCRIPTION",
        amount: game.priceMonthly ?? 0,
        currency: "usd",
        status: "COMPLETED",
        stripeSubscriptionId: subscriptionId,
      },
    });
  }

  await prisma.libraryEntry.upsert({
    where: { userId_gameId: { userId, gameId } },
    create: {
      userId,
      gameId,
      acquiredVia: "SUBSCRIPTION",
      subscriptionActive: true,
      pastDue: false,
      stripeSubscriptionId: subscriptionId,
    },
    update: {
      acquiredVia: "SUBSCRIPTION",
      subscriptionActive: true,
      pastDue: false,
      stripeSubscriptionId: subscriptionId,
    },
  });
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("[fulfillment] checkout.session.completed missing userId metadata");
    return;
  }

  const oneTimeGameIds = parseGameIds(session.metadata?.oneTimeGameIds);
  const subscriptionGameIds = parseGameIds(session.metadata?.subscriptionGameIds);
  const paymentIntentId = extractId(session.payment_intent);
  const subscriptionId = extractId(session.subscription);

  for (const gameId of oneTimeGameIds) {
    await fulfillOneTimeGame(userId, gameId, paymentIntentId);
  }
  for (const gameId of subscriptionGameIds) {
    await fulfillSubscriptionGame(userId, gameId, subscriptionId);
  }

  // Clear the purchased items from the cart.
  const purchasedGameIds = [...oneTimeGameIds, ...subscriptionGameIds];
  if (purchasedGameIds.length > 0) {
    await prisma.cartItem.deleteMany({
      where: { userId, gameId: { in: purchasedGameIds } },
    });
  }
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.libraryEntry.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { subscriptionActive: false, pastDue: false },
  });
}

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = extractId(
    (invoice as unknown as { subscription?: string | { id: string } | null }).subscription
  );
  if (!subscriptionId) return;

  await prisma.libraryEntry.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { pastDue: true },
  });
}
