import type { CartItem, PlanType } from "../../types/cart";
import { useCartStore } from "../../store/cartStore";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const setPlan = useCartStore((state) => state.setPlan);
  const removeItem = useCartStore((state) => state.removeItem);

  const { game, planType } = item;
  const canBuyOnce = game.priceOneTime !== null;
  const canSubscribe = game.priceMonthly !== null;

  function selectPlan(plan: PlanType) {
    if (plan === planType) return;
    setPlan(game.id, plan);
  }

  return (
    <div className="flex gap-3 border-b border-zinc-800 py-3">
      <img src={game.coverUrl} alt="" className="h-16 w-24 rounded object-cover" />

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">{game.title}</h3>
          <button
            type="button"
            onClick={() => removeItem(game.id)}
            className="text-xs text-zinc-500 hover:text-red-400"
            aria-label={`Remove ${game.title} from cart`}
          >
            Remove
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={!canBuyOnce}
            onClick={() => selectPlan("ONE_TIME")}
            className={`rounded px-2 py-1 text-xs ${
              planType === "ONE_TIME"
                ? "bg-white text-zinc-950"
                : "bg-zinc-800 text-zinc-300"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Buy once {canBuyOnce ? `$${game.priceOneTime!.toFixed(2)}` : "—"}
          </button>
          <button
            type="button"
            disabled={!canSubscribe}
            onClick={() => selectPlan("SUBSCRIPTION")}
            className={`rounded px-2 py-1 text-xs ${
              planType === "SUBSCRIPTION"
                ? "bg-white text-zinc-950"
                : "bg-zinc-800 text-zinc-300"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Subscribe {canSubscribe ? `$${game.priceMonthly!.toFixed(2)}/mo` : "—"}
          </button>
        </div>
      </div>
    </div>
  );
}
