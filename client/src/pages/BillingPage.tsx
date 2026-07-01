import { useState } from "react";
import { useLibrary } from "../hooks/queries/useLibrary";
import { useCancelSubscription } from "../hooks/mutations/useCancelSubscription";
import { Spinner } from "../components/ui/Spinner";
import type { LibraryEntry } from "../types/library";

function SubscriptionRow({ entry }: { entry: LibraryEntry }) {
  const cancelSubscription = useCancelSubscription();
  const [confirming, setConfirming] = useState(false);

  function handleCancel() {
    if (!entry.stripeSubscriptionId) return;
    cancelSubscription.mutate(entry.stripeSubscriptionId, {
      onSettled: () => setConfirming(false),
    });
  }

  return (
    <div className="flex items-center gap-4 bg-zinc-900 px-4 py-3">
      <img src={entry.game.coverUrl} alt="" className="h-12 w-20 rounded object-cover" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">{entry.game.title}</p>
        <p className="text-xs text-zinc-400">
          {entry.game.priceMonthly !== null ? `$${entry.game.priceMonthly.toFixed(2)}/mo` : ""}
        </p>
        {entry.pastDue && (
          <p className="mt-1 text-xs text-red-400">
            ⚠ Payment failed — please update your billing details to keep access.
          </p>
        )}
      </div>

      {confirming ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelSubscription.isPending}
            className="flex items-center gap-1 rounded bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-400 disabled:opacity-50"
          >
            {cancelSubscription.isPending && <Spinner className="h-3 w-3" />}
            Confirm cancel
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={cancelSubscription.isPending}
            className="text-xs text-zinc-400 hover:text-white"
          >
            Keep
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:border-red-500 hover:text-red-400"
        >
          Cancel subscription
        </button>
      )}
    </div>
  );
}

export function BillingPage() {
  const { data, isLoading, isError, error } = useLibrary();

  const subscriptions = (data?.items ?? []).filter(
    (entry) => entry.acquiredVia === "SUBSCRIPTION" && entry.subscriptionActive
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Billing & Subscriptions</h1>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-white" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-900 bg-red-950/40 p-6 text-center text-red-300">
          Failed to load subscriptions{error instanceof Error ? `: ${error.message}` : ""}.
        </div>
      )}

      {!isLoading && !isError && subscriptions.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-700 py-16 text-center text-zinc-400">
          You have no active subscriptions.
        </div>
      )}

      {!isLoading && !isError && subscriptions.length > 0 && (
        <div className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800">
          {subscriptions.map((entry) => (
            <SubscriptionRow key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
