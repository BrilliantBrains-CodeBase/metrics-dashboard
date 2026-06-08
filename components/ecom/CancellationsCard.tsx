import { fmt } from '@/lib/metrics'

interface Props {
  orders: number
  returns: number
  returnRate: number
  ordersDelta: number
  discounts: number
  discountRate: number
}

export default function CancellationsCard({
  orders, returns, returnRate, ordersDelta, discounts, discountRate,
}: Props) {
  const rows = [
    { label: 'Returns', value: returns, pct: returnRate },
    { label: 'Discounts', value: discounts, pct: discountRate },
  ].filter((r) => r.value > 0)

  const maxVal = Math.max(...rows.map((r) => r.value), 1)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 h-full">
      <p className="text-sm font-bold text-[#1B2447]">Deductions</p>

      <div>
        <p className="text-4xl font-bold text-[#1B2447]">{orders.toLocaleString()}</p>
        <p className="text-xs text-gray-400 mt-1">Orders this month</p>
        <span className={`text-xs font-semibold mt-1 inline-block ${ordersDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {ordersDelta >= 0 ? '+' : ''}{Math.round(ordersDelta)} vs last month
        </span>
      </div>

      {rows.length > 0 && (
        <div className="mt-auto space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Breakdown</p>
          {rows.map((row) => (
            <div key={row.label}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{row.label}</span>
                <span className="font-semibold text-[#1B2447]">{fmt(row.value, 'currency')}</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-300"
                  style={{ width: `${(row.value / maxVal) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {rows.length === 0 && (
        <p className="text-xs text-gray-400 mt-auto">No returns or discounts this period.</p>
      )}
    </div>
  )
}
