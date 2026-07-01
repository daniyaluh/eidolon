import type { CartItem } from "../types/cart";

export interface CartTotals {
  oneTimeTotal: number;
  monthlyTotal: number;
}

export function computeCartTotals(items: CartItem[]): CartTotals {
  return items.reduce<CartTotals>(
    (totals, item) => {
      if (item.planType === "ONE_TIME" && item.game.priceOneTime !== null) {
        totals.oneTimeTotal += item.game.priceOneTime;
      }
      if (item.planType === "SUBSCRIPTION" && item.game.priceMonthly !== null) {
        totals.monthlyTotal += item.game.priceMonthly;
      }
      return totals;
    },
    { oneTimeTotal: 0, monthlyTotal: 0 }
  );
}
