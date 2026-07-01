import type { Game } from "./game";

export type OrderType = "ONE_TIME" | "SUBSCRIPTION";
export type OrderStatus = "PENDING" | "COMPLETED" | "REFUNDED" | "CANCELLED";

export interface Order {
  id: string;
  type: OrderType;
  amount: number;
  currency: string;
  status: OrderStatus;
  stripePaymentIntentId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
  game: Game;
}

export interface OrdersResponse {
  items: Order[];
}
