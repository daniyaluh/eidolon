import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/apiClient";
import { useCartStore } from "../store/cartStore";

type ConfirmState = "confirming" | "done" | "error";

export function CheckoutSuccessPage() {
  const queryClient = useQueryClient();
  const fetchCart = useCartStore((state) => state.fetchCart);
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [state, setState] = useState<ConfirmState>("confirming");
  const startedRef = useRef(false);

  useEffect(() => {
    // Guard against React 18 StrictMode double-invocation in dev.
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;

    function refreshLocalState() {
      queryClient.invalidateQueries({ queryKey: ["me", "library"] });
      queryClient.invalidateQueries({ queryKey: ["me", "orders"] });
      fetchCart().catch(() => undefined);
    }

    async function confirm() {
      if (!sessionId) {
        // No session id to confirm — fall back to webhook-driven fulfillment.
        refreshLocalState();
        setState("done");
        return;
      }

      // Confirm the purchase server-side. This records the Order (revenue) and
      // grants library access even if the Stripe webhook never reaches us.
      // Retry a few times in case the payment is still settling.
      for (let attempt = 0; attempt < 5 && !cancelled; attempt++) {
        try {
          const { status } = await apiClient.post<{ status: "fulfilled" | "pending" }>(
            "/checkout/confirm",
            { sessionId }
          );
          if (status === "fulfilled") {
            if (cancelled) return;
            refreshLocalState();
            setState("done");
            return;
          }
        } catch {
          // Swallow and retry; the webhook is still a backstop.
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (cancelled) return;
      // Still pending after retries — the webhook should catch up shortly.
      refreshLocalState();
      setState("error");
    }

    confirm();

    return () => {
      cancelled = true;
    };
  }, [sessionId, queryClient, fetchCart]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-3xl text-white">
        ✓
      </div>
      <h1 className="text-2xl font-bold text-white">Payment successful</h1>
      <p className="text-sm text-zinc-400">
        {state === "confirming"
          ? "Confirming your purchase and adding your games to your library…"
          : state === "error"
            ? "Your payment went through. Your games will appear in your library in a few moments."
            : "Thanks for your purchase! Your games have been added to your library."}
      </p>
      <div className="flex gap-3 pt-2">
        <Link
          to="/library"
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
        >
          Go to Library
        </Link>
        <Link
          to="/games"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-500"
        >
          Keep browsing
        </Link>
      </div>
    </div>
  );
}
