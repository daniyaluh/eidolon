import { Request, Response } from "express";
import {
  createCheckoutSession,
  confirmCheckoutSession,
  CheckoutError,
} from "../services/checkout.service";

export async function postCreateSession(req: Request, res: Response) {
  try {
    const { url } = await createCheckoutSession(req.user!.id);
    return res.json({ url });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
}

export async function postConfirmSession(req: Request, res: Response) {
  try {
    const sessionId = String((req.body as { sessionId?: unknown })?.sessionId ?? "");
    const result = await confirmCheckoutSession(req.user!.id, sessionId);
    return res.json(result);
  } catch (err) {
    if (err instanceof CheckoutError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
}
