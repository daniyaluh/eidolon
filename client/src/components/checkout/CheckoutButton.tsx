import { useState } from "react";
import { apiClient, ApiError } from "../../lib/apiClient";
import { Spinner } from "../ui/Spinner";

interface CheckoutButtonProps {
  disabled?: boolean;
}

export function CheckoutButton({ disabled }: CheckoutButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setError(null);
    setIsRedirecting(true);
    try {
      const { url } = await apiClient.post<{ url: string }>("/checkout/create-session");
      window.location.href = url;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start checkout.");
      setIsRedirecting(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={disabled || isRedirecting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRedirecting && <Spinner />}
        {isRedirecting ? "Redirecting to checkout..." : "Checkout"}
      </button>
    </div>
  );
}
