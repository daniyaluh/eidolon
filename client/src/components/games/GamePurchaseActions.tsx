import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PlanType } from "../../types/cart";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { ApiError } from "../../lib/apiClient";
import { Spinner } from "../ui/Spinner";

interface GamePurchaseActionsProps {
  gameId: string;
  priceOneTime: number | null;
  priceMonthly: number | null;
}

export function GamePurchaseActions({ gameId, priceOneTime, priceMonthly }: GamePurchaseActionsProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();
  const [pendingPlan, setPendingPlan] = useState<PlanType | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(plan: PlanType) {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    setError(null);
    setPendingPlan(plan);
    try {
      await addItem(gameId, plan);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add to cart.");
    } finally {
      setPendingPlan(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {priceOneTime !== null && (
          <button
            type="button"
            onClick={() => handleAdd("ONE_TIME")}
            disabled={pendingPlan !== null}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
          >
            {pendingPlan === "ONE_TIME" && <Spinner />}
            Buy Now
          </button>
        )}
        {priceMonthly !== null && (
          <button
            type="button"
            onClick={() => handleAdd("SUBSCRIPTION")}
            disabled={pendingPlan !== null}
            className="flex items-center gap-2 rounded-lg border border-white px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-200/10 disabled:opacity-50"
          >
            {pendingPlan === "SUBSCRIPTION" && <Spinner />}
            Subscribe
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
