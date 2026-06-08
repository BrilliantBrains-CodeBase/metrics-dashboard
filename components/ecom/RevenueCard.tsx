'use client'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { fmtDelta, fmt } from '@/lib/metrics'
import { ShopifyRow } from '@/types'

interface Props {
  total: number
  projected: number
  progressPct: number
  delta: number
  sparkRows: ShopifyRow[]
  period: string
}

export default function RevenueCard({ total, projected, progressPct, delta, sparkRows, period }: Props) {
  const sparkData = [...sparkRows]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({ v: r.netSales }))

  const positive = delta >= 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[#1B2447]">Revenue</p>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{period}</span>
      </div>

      <div>
        <p className="text-4xl font-bold text-[#1B2447] leading-none">{fmt(total, 'currency')}</p>
        <p className="text-xs text-gray-400 mt-1">Total</p>
      </div>

      <span className={`text-xs font-semibold self-start ${positive ? 'text-green-600' : 'text-red-500'}`}>
        {fmtDelta(delta, 'currency')} vs prior period
      </span>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-400">{progressPct.toFixed(0)}%</span>
          <span className="text-xs text-gray-400">{fmt(projected, 'currency')} projected</span>
        </div>
      </div>

      {/* Sparkline */}
      {sparkData.length > 1 && (
        <div className="mt-auto -mx-1">
          <ResponsiveContainer width="100%" height={56}>
            <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#6366f1"
                strokeWidth={1.5}
                fill="#6366f1"
                fillOpacity={0.08}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
