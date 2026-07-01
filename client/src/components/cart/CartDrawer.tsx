import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "../../store/cartStore";
import { computeCartTotals } from "../../lib/cartTotals";
import { CartItemRow } from "./CartItemRow";
import { CheckoutButton } from "../checkout/CheckoutButton";

export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const items = useCartStore((state) => state.items);

  const { oneTimeTotal, monthlyTotal } = computeCartTotals(items);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-40 bg-black/60"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-zinc-950 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
              <h2 className="text-lg font-bold text-white">Your Cart</h2>
              <button
                type="button"
                onClick={closeDrawer}
                className="text-zinc-400 hover:text-white"
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4">
              {items.length === 0 ? (
                <p className="py-16 text-center text-sm text-zinc-400">Your cart is empty.</p>
              ) : (
                items.map((item) => <CartItemRow key={item.id} item={item} />)
              )}
            </div>

            {items.length > 0 && (
              <div className="space-y-3 border-t border-zinc-800 px-4 py-4">
                {oneTimeTotal > 0 && (
                  <div className="flex justify-between text-sm text-zinc-300">
                    <span>One-time total</span>
                    <span className="font-semibold text-white">${oneTimeTotal.toFixed(2)}</span>
                  </div>
                )}
                {monthlyTotal > 0 && (
                  <div className="flex justify-between text-sm text-zinc-300">
                    <span>Monthly total</span>
                    <span className="font-semibold text-white">
                      ${monthlyTotal.toFixed(2)}/mo
                    </span>
                  </div>
                )}
                <CheckoutButton />
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
