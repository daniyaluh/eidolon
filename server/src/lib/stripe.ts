import Stripe from "stripe";
import { env } from "./env";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!env.stripeSecretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to server/.env to enable payments."
    );
  }
  if (!stripeClient) {
    stripeClient = new Stripe(env.stripeSecretKey);
  }
  return stripeClient;
}
