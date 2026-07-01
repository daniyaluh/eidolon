import { useOrders } from "../hooks/queries/useOrders";
import { Spinner } from "../components/ui/Spinner";

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-white/15 text-white",
  PENDING: "bg-amber-500/15 text-amber-400",
  REFUNDED: "bg-sky-500/15 text-sky-400",
  CANCELLED: "bg-zinc-500/15 text-zinc-400",
};

export function OrderHistoryPage() {
  const { data, isLoading, isError, error } = useOrders();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Order History</h1>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8 text-white" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-900 bg-red-950/40 p-6 text-center text-red-300">
          Failed to load orders{error instanceof Error ? `: ${error.message}` : ""}.
        </div>
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-700 py-16 text-center text-zinc-400">
          You haven't made any purchases yet.
        </div>
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800">
          {data.items.map((order) => (
            <div key={order.id} className="flex items-center gap-4 bg-zinc-900 px-4 py-3">
              <img src={order.game.coverUrl} alt="" className="h-12 w-20 rounded object-cover" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{order.game.title}</p>
                <p className="text-xs text-zinc-400">
                  {order.type === "SUBSCRIPTION" ? "Monthly subscription" : "One-time purchase"} ·{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">
                  ${order.amount.toFixed(2)}
                  {order.type === "SUBSCRIPTION" && <span className="text-xs text-zinc-400">/mo</span>}
                </p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${
                    STATUS_STYLES[order.status] ?? "bg-zinc-500/15 text-zinc-400"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
