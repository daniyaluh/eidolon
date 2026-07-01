import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getStripe } from "../lib/stripe";

export async function cancelSubscription(req: Request, res: Response) {
  const subscriptionId = req.params.id;

  // Ensure the subscription actually belongs to the requesting user.
  const entry = await prisma.libraryEntry.findFirst({
    where: { userId: req.user!.id, stripeSubscriptionId: subscriptionId },
  });

  if (!entry) {
    return res.status(404).json({ error: "Subscription not found" });
  }

  await getStripe().subscriptions.cancel(subscriptionId);

  // The customer.subscription.deleted webhook will flip subscriptionActive to
  // false; we optimistically reflect it here so the UI updates immediately.
  await prisma.libraryEntry.updateMany({
    where: { userId: req.user!.id, stripeSubscriptionId: subscriptionId },
    data: { subscriptionActive: false },
  });

  return res.json({ success: true });
}
