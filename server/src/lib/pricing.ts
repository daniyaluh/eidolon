// RAWG doesn't provide store prices, so we derive sensible ones from the game's
// rating (0–5). Higher-rated titles are priced as premium; every game gets both
// a one-time and a monthly price so both purchase flows are usable.

export function deriveOneTimePrice(rating: number): number {
  if (rating >= 4.5) return 59.99;
  if (rating >= 4.0) return 49.99;
  if (rating >= 3.5) return 39.99;
  if (rating >= 3.0) return 29.99;
  if (rating > 0) return 19.99;
  return 14.99; // unrated / niche
}

export function deriveMonthlyPrice(oneTime: number): number {
  if (oneTime >= 59.99) return 14.99;
  if (oneTime >= 49.99) return 11.99;
  if (oneTime >= 39.99) return 9.99;
  if (oneTime >= 29.99) return 6.99;
  return 4.99;
}

export function derivePrices(rating: number): { priceOneTime: number; priceMonthly: number } {
  const priceOneTime = deriveOneTimePrice(rating);
  return { priceOneTime, priceMonthly: deriveMonthlyPrice(priceOneTime) };
}
