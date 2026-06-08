import { fmtDelta, fmt } from '@/lib/metrics'

interface Props {
  revenue: number
  orders: number
  revDelta: number
  ordersDelta: number
  hasData: boolean
}

function DeltaChip({ delta, type }: { delta: number; type: 'currency' | 'number' }) {
  const positive = delta >= 0
  return (
    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${positive ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
      {fmtDelta(delta, type)}
    </span>
  )
}

export default function TodayCard({ revenue, orders, revDelta, ordersDelta, hasData }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Today</p>

      <div className="flex flex-col gap-1">
        <p className="text-4xl font-bold text-[#1B2447] leading-none">
          {hasData ? fmt(revenue, 'currency') : '--'}
        </p>
        <p className="text-xs text-gray-400">Revenue</p>
        {hasData && <DeltaChip delta={revDelta} type="currency" />}
      </div>

      <div className="border-t border-gray-50 pt-3 flex flex-col gap-1">
        <p className="text-2xl font-bold text-[#1B2447]">{hasData ? orders.toLocaleString() : '--'}</p>
        <p className="text-xs text-gray-400">Orders</p>
        {hasData && <DeltaChip delta={ordersDelta} type="number" />}
      </div>
    </div>
  )
}
