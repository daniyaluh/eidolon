import Stripe from "stripe";
import { Game } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { getStripe } from "../lib/stripe";
import { env } from "../lib/env";
import { handleCheckoutCompleted } from "./fulfillment.service";

export class CheckoutError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "CheckoutError";
    this.status = status;
  }
}

const CURRENCY = "usd";

function toStripeAmount(dollars: number): number {
  return Math.round(dollars * 100);
}

async function getOrCreateCustomer(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new CheckoutError("User not found", 404);
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.displayName,
    metadata: { userId: user.id },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

async function getOrCreateMonthlyPrice(game: Game): Promise<string> {
  if (game.stripeMonthlyPriceId) return game.stripeMonthlyPriceId;
  if (game.priceMonthly === null) {
    throw new CheckoutError(`Game "${game.title}" has no monthly price`);
  }

  const stripe = getStripe();
  const price = await stripe.prices.create({
    currency: CURRENCY,
    unit_amount: toStripeAmount(game.priceMonthly),
    recurring: { interval: "month" },
    product_data: { name: `${game.title} — Monthly` },
  });

  await prisma.game.update({
    where: { id: game.id },
    data: { stripeMonthlyPriceId: price.id },
  });

  return price.id;
}

function oneTimeLineItem(game: Game): Stripe.Checkout.SessionCreateParams.LineItem {
  return {
    quantity: 1,
    price_data: {
      currency: CURRENCY,
      unit_amount: toStripeAmount(game.priceOneTime!),
      product_data: { name: game.title },
    },
  };
}

export async function createCheckoutSession(userId: string): Promise<{ url: string }> {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { game: true },
  });

  if (cartItems.length === 0) {
    throw new CheckoutError("Your cart is empty");
  }

  const oneTimeItems = cartItems.filter((item) => item.planType === "ONE_TIME");
  const subscriptionItems = cartItems.filter((item) => item.planType === "SUBSCRIPTION");

  for (const item of oneTimeItems) {
    if (item.game.priceOneTime === null) {
      throw new CheckoutError(`"${item.game.title}" is not available for one-time purchase`);
    }
  }

  const stripe = getStripe();
  const customerId = await getOrCreateCustomer(userId);

  const successUrl = `${env.clientOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${env.clientOrigin}/checkout/cancelled`;

  const oneTimeGameIds = oneTimeItems.map((item) => item.gameId);
  const subscriptionGameIds = subscriptionItems.map((item) => item.gameId);

  const metadata: Record<string, string> = {
    userId,
    oneTimeGameIds: oneTimeGameIds.join(","),
    subscriptionGameIds: subscriptionGameIds.join(","),
  };

  let session: Stripe.Checkout.Session;

  if (subscriptionItems.length > 0) {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of subscriptionItems) {
      const priceId = await getOrCreateMonthlyPrice(item.game);
      lineItems.push({ price: priceId, quantity: 1 });
    }
    // One-time items ride along as one-time line items on the first invoice.
    for (const item of oneTimeItems) {
      lineItems.push(oneTimeLineItem(item.game));
    }

    session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      subscription_data: { metadata },
    });
  } else {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: oneTimeItems.map((item) => oneTimeLineItem(item.game)),
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      payment_intent_data: { metadata },
    });
  }

  if (!session.url) {
    throw new CheckoutError("Stripe did not return a checkout URL", 502);
  }

  return { url: session.url };
}

export type ConfirmStatus = "fulfilled" | "pending";

/**
 * Synchronously fulfills a completed checkout session from the success page.
 *
 * This is a safety net for the `checkout.session.completed` webhook: if the
 * webhook isn't delivered (e.g. the Stripe CLI listener isn't running, or in
 * any environment where Stripe can't reach this server), the purchase would
 * otherwise never be recorded — no Order row, so no revenue and no library
 * entry. Fulfillment is idempotent (guards on the Stripe payment id), so it's
 * safe even when the webhook also runs.
 */
export async function confirmCheckoutSession(
  userId: string,
  sessionId: string
): Promise<{ status: ConfirmStatus }> {
  if (!sessionId) {
    throw new CheckoutError("Missing checkout session id");
  }

  const stripe = getStripe();

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    throw new CheckoutError("Checkout session not found", 404);
  }

  // Only the user who created the session may confirm it.
  if (session.metadata?.userId !== userId) {
    throw new CheckoutError("This checkout session does not belong to you", 403);
  }

  // Payment hasn't settled yet — leave it for the webhook or a later retry.
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return { status: "pending" };
  }

  await handleCheckoutCompleted(session);
  return { status: "fulfilled" };
}
