import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAnalytics } from "../../hooks/queries/useAnalytics";
import { StatCard } from "../../components/admin/StatCard";
import { useStaggerReveal } from "../../hooks/useStaggerReveal";

function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-8 w-40 animate-pulse rounded bg-zinc-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-zinc-900" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-zinc-900" />
      <div className="h-80 animate-pulse rounded-xl bg-zinc-900" />
    </div>
  );
}

export function AdminAnalyticsPage() {
  const { data, isLoading, isError } = useAnalytics();
  const cardsRef = useStaggerReveal<HTMLDivElement>([data?.totalRevenue]);

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (isError || !data) {
    return (
      <p className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
        Failed to load analytics.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      <div ref={cardsRef} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total revenue" value={data.totalRevenue} prefix="$" decimals={2} />
        <StatCard label="Active subscriptions" value={data.activeSubscriptions} />
        <StatCard label="New users (30d)" value={data.newUsersLast30Days} />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Revenue — last 30 days</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.revenueByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
              labelStyle={{ color: "#e2e8f0" }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
            />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Top 10 best sellers</h2>
        {data.topSellers.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">No sales yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.topSellers} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="title"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                width={120}
              />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
                labelStyle={{ color: "#e2e8f0" }}
                formatter={(value) => [`${Number(value)} sold`, "Units"]}
              />
              <Bar dataKey="unitsSold" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
