interface Props {
  label: string
  value: string
  sub?: string
  trend?: number
  highlight?: boolean
}

export default function KpiCard({ label, value, sub, trend, highlight }: Props) {
  const trendPositive = trend !== undefined && trend > 0
  const trendNegative = trend !== undefined && trend < 0

  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-2 border transition-shadow hover:shadow-md ${
        highlight
          ? 'bg-indigo-50 border-indigo-200'
          : 'bg-white border-gray-100'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-indigo-700' : 'text-gray-900'}`}>{value}</p>
      <div className="flex items-center gap-2 mt-auto">
        {trend !== undefined && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
              trendPositive
                ? 'text-emerald-700 bg-emerald-50'
                : trendNegative
                ? 'text-red-600 bg-red-50'
                : 'text-gray-500 bg-gray-50'
            }`}
          >
            {trendPositive ? '+' : ''}{trend.toFixed(1)}%
          </span>
        )}
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}
