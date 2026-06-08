'use client'
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'
import { fmtDelta, fmt } from '@/lib/metrics'

interface Props {
  orders: number
  aov: number
  ordersDelta: number
  aovDelta: number
  priorAov: number
  period: string
}

export default function OrdersCard({ orders, aov, ordersDelta, aovDelta, priorAov, period }: Props) {
  const benchmarkAov = priorAov > 0 ? priorAov : 2000
  const gaugePercent = Math.min((aov / benchmarkAov) * 100, 100)
  const gaugeColor = aov >= benchmarkAov ? '#22C55E' : aov > 0 ? '#6366f1' : '#e5e7eb'

  const gaugeData = [{ value: gaugePercent, fill: gaugeColor }]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[#1B2447]">Orders</p>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{period}</span>
      </div>

      {/* AOV Gauge */}
      <div className="flex flex-col items-center">
        <p className="text-xs text-gray-400 font-medium self-start">Avg. order value</p>
        <div className="relative flex items-end justify-center" style={{ height: 80 }}>
          <RadialBarChart
            width={140}
            height={80}
            innerRadius="60%"
            outerRadius="85%"
            startAngle={180}
            endAngle={0}
            data={gaugeData}
            cx="50%"
            cy="100%"
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" background={{ fill: '#f3f4f6' }} cornerRadius={4} />
          </RadialBarChart>
          <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-lg font-bold text-[#1B2447] whitespace-nowrap">
            {aov > 0 ? fmt(aov, 'currency') : '--'}
          </p>
        </div>
        <span className={`text-xs font-semibold mt-1 ${aovDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {aov > 0 ? fmtDelta(aovDelta, 'currency') : ''}
        </span>
      </div>

      {/* Orders count */}
      <div className="border-t border-gray-50 pt-3 flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-[#1B2447]">{orders.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Orders</p>
        </div>
        <span className={`text-xs font-semibold pb-1 ${ordersDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {fmtDelta(ordersDelta, 'number')} vs last month
        </span>
      </div>
    </div>
  )
}
