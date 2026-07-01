import { Request, Response } from "express";
import { addToCartSchema } from "../validators/cart.validator";
import { addToCart, CartError, getCart, removeFromCart } from "../services/cart.service";

export async function getCartItems(req: Request, res: Response) {
  const items = await getCart(req.user!.id);
  return res.json({ items });
}

export async function postCartItem(req: Request, res: Response) {
  const parsed = addToCartSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid cart item", details: parsed.error.flatten() });
  }

  try {
    const items = await addToCart(req.user!.id, parsed.data.gameId, parsed.data.planType);
    return res.status(201).json({ items });
  } catch (err) {
    if (err instanceof CartError) {
      return res.status(err.status).json({ error: err.message });
    }
    throw err;
  }
}

export async function deleteCartItem(req: Request, res: Response) {
  const items = await removeFromCart(req.user!.id, req.params.gameId);
  return res.json({ items });
}
