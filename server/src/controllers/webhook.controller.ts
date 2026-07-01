import { Request, Response } from "express";
import Stripe from "stripe";
import { getStripe } from "../lib/stripe";
import { env } from "../lib/env";
import {
  handleCheckoutCompleted,
  handleInvoicePaymentFailed,
  handleSubscriptionDeleted,
} from "../services/fulfillment.service";

export async function handleStripeWebhook(req: Request, res: Response) {
  if (!env.stripeWebhookSecret) {
    return res.status(500).json({ error: "Stripe webhook secret not configured" });
  }

  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return res.status(400).json({ error: "Missing Stripe signature" });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.body as Buffer,
      signature,
      env.stripeWebhookSecret
    );
  } catch (err) {
    console.error("[webhook] signature verification failed:", (err as Error).message);
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    console.error(`[webhook] error handling ${event.type}:`, (err as Error).message);
    return res.status(500).json({ error: "Webhook handler failed" });
  }

  return res.json({ received: true });
}
