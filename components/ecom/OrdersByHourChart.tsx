'use client'
import { HourlyOrdersRow } from '@/types/shopify-analytics'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Props {
  hours:   HourlyOrdersRow[]
  loading: boolean
}

function formatHour(h: number): string {
  if (h === 0)  return '12a'
  if (h < 12)  return `${h}a`
  if (h === 12) return '12p'
  return `${h - 12}p`
}

export default function OrdersByHourChart({ hours, loading }: Props) {
  if (loading) return <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />

  if (!hours || hours.length === 0) return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm text-gray-400 flex items-center justify-center h-32">
      No hourly data
    </div>
  )

  const max = Math.max(...hours.map((h) => h.orders), 1)
  const peakHour = hours.reduce((best, h) => h.orders > best.orders ? h : best, hours[0])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-gray-100">
        <h3 className="text-sm font-bold text-gray-800">Orders by time of day</h3>
        <span className="text-xs text-gray-400">
          Peak: {formatHour(peakHour.hour)} ({peakHour.orders} orders)
        </span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={hours} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="hour"
            tickFormatter={formatHour}
            tick={{ fontSize: 9, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fontSize: 9, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(v) => [`${v} orders`, 'Orders']}
            labelFormatter={(h) => formatHour(Number(h))}
            contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #f0f0f0' }}
          />
          <Bar dataKey="orders" radius={[3, 3, 0, 0]}>
            {hours.map((h) => (
              <Cell
                key={h.hour}
                fill={h.orders === max ? '#3b82f6' : '#bfdbfe'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
