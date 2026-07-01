interface GamePriceProps {
  priceOneTime: number | null;
  priceMonthly: number | null;
}

export function GamePrice({ priceOneTime, priceMonthly }: GamePriceProps) {
  if (priceOneTime === null && priceMonthly === null) {
    return <span className="text-sm text-zinc-400">Price unavailable</span>;
  }

  return (
    <div className="flex items-baseline gap-2">
      {priceOneTime !== null && (
        <span className="text-lg font-semibold text-white">${priceOneTime.toFixed(2)}</span>
      )}
      {priceMonthly !== null && (
        <span className="text-sm text-white">
          {priceOneTime !== null ? "or " : ""}${priceMonthly.toFixed(2)}/mo
        </span>
      )}
    </div>
  );
}
