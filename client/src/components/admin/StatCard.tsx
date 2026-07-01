import { useCountUp } from "../../hooks/useCountUp";

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  decimals?: number;
}

export function StatCard({ label, value, prefix = "", decimals = 0 }: StatCardProps) {
  const animated = useCountUp(value);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">
        {prefix}
        {animated.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
      </p>
    </div>
  );
}
