import type { Game } from "./game";

export type PlanType = "ONE_TIME" | "SUBSCRIPTION";

export interface CartItem {
  id: string;
  planType: PlanType;
  game: Game;
}

export interface CartResponse {
  items: CartItem[];
}
