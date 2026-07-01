import { useState } from "react";
import { motion } from "framer-motion";
import type { ChatAction } from "../../types/chat";
import { useCartStore } from "../../store/cartStore";

interface ChatActionChipProps {
  action: ChatAction;
}

export function ChatActionChip({ action }: ChatActionChipProps) {
  const removeItem = useCartStore((state) => state.removeItem);
  const [undone, setUndone] = useState(false);
  const [busy, setBusy] = useState(false);

  if (action.type === "checkout_started") {
    return (
      <div className="mt-2 rounded-lg border border-zinc-700 bg-white/10 px-3 py-2 text-xs text-zinc-200">
        Redirecting you to secure checkout…
      </div>
    );
  }

  if (action.type !== "added_to_cart" || !action.gameId) return null;

  async function handleUndo() {
    if (!action.gameId) return;
    setBusy(true);
    try {
      await removeItem(action.gameId);
      setUndone(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-xs"
    >
      <span className="text-zinc-200">
        {undone ? "Removed " : "Added "}
        <span className="font-semibold text-white">{action.gameTitle}</span>
        {action.planType === "SUBSCRIPTION" ? " (monthly)" : ""}
        {undone ? " from cart" : " to cart"}
      </span>
      {!undone && (
        <button
          type="button"
          onClick={handleUndo}
          disabled={busy}
          className="shrink-0 rounded border border-zinc-600 px-2 py-1 text-zinc-300 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
        >
          Undo
        </button>
      )}
    </motion.div>
  );
}
